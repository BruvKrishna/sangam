from fastapi import APIRouter
from app.schemas.requests import ReportRequest
from app.data.data_store import store
from datetime import datetime
from collections import Counter

router = APIRouter()

REPORT_TYPES = [
    {"id": "daily_block_plan", "name": "Daily Block Plan", "description": "Scheduled maintenance blocks for a specific day"},
    {"id": "weekly_maintenance", "name": "Weekly Maintenance Plan", "description": "Week-long overview of maintenance activities"},
    {"id": "department_wise", "name": "Department-wise Plan", "description": "Maintenance plan broken down by department"},
    {"id": "overdue_maintenance", "name": "Overdue Maintenance Report", "description": "All overdue and critical maintenance activities"},
    {"id": "conflict_report", "name": "Conflict Report", "description": "Detected scheduling conflicts and resolutions"},
    {"id": "optimization_summary", "name": "Optimization Summary", "description": "Results and statistics from the last optimization run"},
    {"id": "asset_availability", "name": "Asset Availability Summary", "description": "Asset maintenance status and availability overview"},
]


@router.get("/reports/types")
def report_types():
    return REPORT_TYPES


@router.post("/reports/generate")
def generate_report(req: ReportRequest):
    tasks = list(store.tasks.values())
    generated_at = datetime.now().isoformat()

    if req.report_type == "daily_block_plan":
        day_tasks = [t for t in tasks if t.planning_date == req.planning_date]
        day_schedules = [s for s in store.schedules if s.get("planning_date") == req.planning_date]
        content = {
            "title": f"Daily Block Plan — {req.planning_date}",
            "summary": f"{len(day_schedules)} blocks scheduled, {len(day_tasks)} tasks planned",
            "schedules": day_schedules,
            "tasks": [t.model_dump() for t in day_tasks],
        }

    elif req.report_type == "weekly_maintenance":
        weekly_tasks = sorted(tasks, key=lambda t: t.planning_date)
        by_date = {}
        for t in weekly_tasks:
            by_date.setdefault(t.planning_date, []).append({"id": t.id, "name": t.name, "department": t.department_id, "priority": t.priority_score, "status": t.status})
        content = {
            "title": "Weekly Maintenance Plan — 2026-09-10 to 2026-09-17",
            "summary": f"{len(tasks)} total tasks across {len(by_date)} days",
            "by_date": by_date,
        }

    elif req.report_type == "department_wise":
        by_dept = {}
        for t in tasks:
            dept_name = store.departments.get(t.department_id, None)
            dept_label = dept_name.name if dept_name else t.department_id
            by_dept.setdefault(dept_label, []).append({"id": t.id, "name": t.name, "priority": t.priority_score, "status": t.status})
        content = {
            "title": "Department-wise Maintenance Plan",
            "summary": f"Tasks across {len(by_dept)} departments",
            "by_department": {k: {"count": len(v), "tasks": v[:10]} for k, v in by_dept.items()},
        }

    elif req.report_type == "overdue_maintenance":
        overdue = [t for t in tasks if t.status == "overdue" or t.overdue_score > 50]
        overdue_sorted = sorted(overdue, key=lambda t: t.priority_score or 0, reverse=True)
        content = {
            "title": "Overdue Maintenance Report",
            "summary": f"{len(overdue)} overdue or near-overdue tasks",
            "tasks": [{"id": t.id, "name": t.name, "department": t.department_id, "priority": t.priority_score, "overdue_score": t.overdue_score, "section": t.section} for t in overdue_sorted],
        }

    elif req.report_type == "conflict_report":
        content = {
            "title": "Conflict Report",
            "summary": f"{len(store.conflicts)} conflicts detected",
            "conflicts": store.conflicts,
        }

    elif req.report_type == "optimization_summary":
        result = store.last_optimization_result or {}
        content = {
            "title": "Optimization Summary",
            "summary": f"Last run: {store.last_optimization_time or 'N/A'}",
            "stats": result.get("stats", {}),
            "scheduled_count": len(result.get("scheduled", [])),
            "unscheduled_count": len(result.get("unscheduled", [])),
            "conflicts_count": len(result.get("conflicts", [])),
        }

    elif req.report_type == "asset_availability":
        assets_list = list(store.assets.values())
        condition_counts = Counter(a.condition for a in assets_list)
        status_counts = Counter(a.maintenance_status for a in assets_list)
        content = {
            "title": "Asset Availability Summary",
            "summary": f"{len(assets_list)} assets tracked",
            "by_condition": dict(condition_counts),
            "by_maintenance_status": dict(status_counts),
            "assets": [a.model_dump() for a in assets_list[:20]],
        }
    else:
        content = {"title": "Unknown Report Type", "summary": "Report type not recognized"}

    return {
        "report_type": req.report_type,
        "planning_date": req.planning_date,
        "generated_at": generated_at,
        "content": content,
    }
