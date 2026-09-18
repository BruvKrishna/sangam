from app.data.synthetic_data import generate_departments, generate_sections, generate_assets, generate_tasks
from app.models.task import Task
from app.models.asset import Asset
from app.models.department import Department
from app.priority_engine.scorer import calculate_priority
from app.priority_engine.explainer import generate_explanation
from typing import Dict, List, Any, Optional
import copy


class DataStore:
    """In-memory singleton data store for the SANGAM prototype."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataStore, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        self.departments_raw = generate_departments()
        self.sections_raw = generate_sections()
        self.assets_raw = generate_assets(self.sections_raw)
        self.tasks_raw = generate_tasks(self.departments_raw, self.assets_raw, self.sections_raw)

        # Build domain objects
        self.departments: Dict[str, Department] = {}
        for d in self.departments_raw:
            self.departments[d["id"]] = Department(**d)

        self.sections: List[Dict] = self.sections_raw

        self.assets: Dict[str, Asset] = {}
        for a in self.assets_raw:
            self.assets[a["id"]] = Asset(**a)

        self.tasks: Dict[str, Task] = {}
        for t in self.tasks_raw:
            task = Task(**t)
            score, breakdown, ml_risk = calculate_priority(task)
            task.priority_score = round(score, 2)
            task.priority_breakdown = breakdown
            task.explanation = generate_explanation(task, breakdown, ml_risk)
            self.tasks[task.id] = task

        # Schedule and conflict stores
        self.schedules: List[Dict[str, Any]] = []
        self.conflicts: List[Dict[str, Any]] = []
        self.approvals: Dict[str, Dict[str, Any]] = {}
        self.last_optimization_result: Optional[Dict[str, Any]] = None
        self.last_optimization_time: Optional[str] = None

        self._initialized = True
        print(f"[SANGAM] Data store initialized: {len(self.tasks)} tasks, {len(self.assets)} assets, {len(self.departments)} departments, {len(self.sections)} sections")

    def get_tasks_list(self) -> List[Task]:
        return sorted(self.tasks.values(), key=lambda t: t.priority_score or 0, reverse=True)

    def get_tasks_by_department(self, dept_id: str) -> List[Task]:
        return [t for t in self.tasks.values() if t.department_id == dept_id]

    def get_tasks_by_section(self, section_id: str) -> List[Task]:
        return [t for t in self.tasks.values() if t.section == section_id]

    def get_tasks_by_date(self, date: str) -> List[Task]:
        return [t for t in self.tasks.values() if t.planning_date == date]

    def get_overdue_tasks(self) -> List[Task]:
        return [t for t in self.tasks.values() if t.status == "overdue" or t.overdue_score > 50]

    def get_critical_tasks(self) -> List[Task]:
        return [t for t in self.tasks.values() if t.criticality >= 80]

    def store_optimization_result(self, result: Dict[str, Any], planning_date: str):
        """Store the latest optimization result and create schedule/conflict entries."""
        from datetime import datetime
        self.last_optimization_result = result
        self.last_optimization_time = datetime.now().isoformat()

        # Build schedule entries from optimization result
        new_schedules = []
        for entry in result.get("scheduled", []):
            task_id = entry["task_id"]
            task = self.tasks.get(task_id)
            if task:
                sched = {
                    "id": f"SCH-{task_id}",
                    "task_id": task_id,
                    "task_name": task.name,
                    "department_id": task.department_id,
                    "section": task.section,
                    "asset_id": task.asset_id,
                    "start_time": entry["start_time"],
                    "end_time": entry["end_time"],
                    "planning_date": planning_date,
                    "priority_score": task.priority_score,
                    "status": "pending_approval",
                    "approval_status": "pending",
                    "reason": f"AI-optimized schedule: Priority {task.priority_score}",
                }
                new_schedules.append(sched)
                # Also create approval entry
                self.approvals[f"SCH-{task_id}"] = {
                    "schedule_id": f"SCH-{task_id}",
                    "status": "pending",
                    "approved_by": None,
                    "comments": "",
                    "timestamp": None,
                }
        self.schedules = new_schedules

        # Build conflict entries
        new_conflicts = []
        for i, conf in enumerate(result.get("conflicts", []), 1):
            task_ids = conf.get("task_ids", [])
            tasks_info = []
            for tid in task_ids:
                t = self.tasks.get(tid)
                if t:
                    tasks_info.append({
                        "task_id": tid,
                        "task_name": t.name,
                        "department_id": t.department_id,
                        "section": t.section,
                        "preferred_window": f"{t.preferred_window_start:02d}:00-{t.preferred_window_end:02d}:00",
                    })
            if len(tasks_info) >= 2:
                new_conflicts.append({
                    "id": f"C-{100 + i}",
                    "severity": conf.get("severity", "MEDIUM"),
                    "type": "Overlapping Maintenance",
                    "description": conf.get("description", "Cross-department tasks on same section"),
                    "section": conf.get("section", ""),
                    "tasks": tasks_info,
                    "recommended_action": f"Reschedule {tasks_info[1]['task_id']} to avoid overlap with {tasks_info[0]['task_id']}",
                    "status": "open",
                })
        self.conflicts = new_conflicts

    def apply_approval(self, schedule_id: str, action: str, approved_by: str, comments: str = ""):
        from datetime import datetime
        if schedule_id in self.approvals:
            self.approvals[schedule_id]["status"] = action  # approved, rejected, modified, sent_back
            self.approvals[schedule_id]["approved_by"] = approved_by
            self.approvals[schedule_id]["comments"] = comments
            self.approvals[schedule_id]["timestamp"] = datetime.now().isoformat()

            # Update schedule status
            for sched in self.schedules:
                if sched["id"] == schedule_id:
                    if action == "approved":
                        sched["status"] = "approved"
                        sched["approval_status"] = "approved"
                        # Also update task status
                        task = self.tasks.get(sched["task_id"])
                        if task:
                            task.status = "scheduled"
                    elif action == "rejected":
                        sched["status"] = "rejected"
                        sched["approval_status"] = "rejected"
                    break

            return self.approvals[schedule_id]
        return None


store = DataStore()
store.initialize()
