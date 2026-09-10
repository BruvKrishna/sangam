from ortools.sat.python import cp_model
from typing import List, Dict, Any
import time

def run_optimization(tasks: List[Dict], planning_date: str) -> Dict[str, Any]:
    # Filter tasks for the day
    day_tasks = [t for t in tasks if t["planning_date"] == planning_date]
    if not day_tasks:
        return {"scheduled": [], "unscheduled": [], "conflicts": [], "stats": {"status": "NO_TASKS"}}
    
    model = cp_model.CpModel()
    
    # Time horizon: 6:00 to 22:00 = 16 hours. Let's use 15-minute slots.
    # 16 hours * 4 slots/hour = 64 slots.
    # Slot 0 = 6:00, Slot 64 = 22:00.
    horizon = 64
    
    task_vars = {}
    
    # Create variables
    for t in day_tasks:
        duration_slots = max(1, t["required_duration_minutes"] // 15)
        
        pref_start_slot = max(0, (t["preferred_window_start"] - 6) * 4)
        pref_end_slot = min(horizon, (t["preferred_window_end"] - 6) * 4)
        
        # Ensure valid window
        if pref_end_slot - pref_start_slot < duration_slots:
            pref_start_slot = 0
            pref_end_slot = horizon
            
        start_var = model.NewIntVar(pref_start_slot, pref_end_slot - duration_slots, f'start_{t["id"]}')
        end_var = model.NewIntVar(pref_start_slot + duration_slots, pref_end_slot, f'end_{t["id"]}')
        is_scheduled = model.NewBoolVar(f'is_scheduled_{t["id"]}')
        
        interval_var = model.NewOptionalIntervalVar(
            start_var, duration_slots, end_var, is_scheduled, f'interval_{t["id"]}'
        )
        
        task_vars[t["id"]] = {
            "task": t,
            "start": start_var,
            "end": end_var,
            "is_scheduled": is_scheduled,
            "interval": interval_var,
            "duration": duration_slots
        }
    
    # Constraints: 
    # 1. No overlap of incompatible tasks on same section
    # Let's say any two tasks from different departments on same section cannot overlap unless they are in same compatibility group
    sections = set([t["section"] for t in day_tasks])
    conflicts = []
    
    for sec in sections:
        sec_tasks = [t for t in day_tasks if t["section"] == sec]
        for i in range(len(sec_tasks)):
            for j in range(i + 1, len(sec_tasks)):
                t1 = sec_tasks[i]
                t2 = sec_tasks[j]
                
                # if different departments and not in same group
                if t1["department_id"] != t2["department_id"]:
                    if not (t1.get("compatibility_group") and t1.get("compatibility_group") == t2.get("compatibility_group")):
                        # Add NoOverlap
                        model.AddNoOverlap([task_vars[t1["id"]]["interval"], task_vars[t2["id"]]["interval"]])
                        conflicts.append({
                            "id": f"CONF-{t1['id']}-{t2['id']}",
                            "task_ids": [t1["id"], t2["id"]],
                            "description": "Cross-department tasks on same section without compatibility",
                            "severity": "HIGH",
                            "section": sec
                        })
    
    # 2. Dependencies
    for t in day_tasks:
        t_id = t["id"]
        for dep_id in t["dependencies"]:
            if dep_id in task_vars:
                # dependent task must start after prerequisite ends, if both are scheduled
                # We enforce: if both scheduled, start_t >= end_dep
                model.Add(task_vars[t_id]["start"] >= task_vars[dep_id]["end"]).OnlyEnforceIf(
                    [task_vars[t_id]["is_scheduled"], task_vars[dep_id]["is_scheduled"]]
                )
    
    # Objectives
    # Maximize scheduled priority, and give bonus to overdue
    objective_terms = []
    for t_id, tv in task_vars.items():
        priority = int(tv["task"].get("priority_score", 0))
        if tv["task"].get("overdue_score", 0) > 50:
            priority += 50
        objective_terms.append(priority * tv["is_scheduled"])
        
    model.Maximize(sum(objective_terms))
    
    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.Solve(model)
    
    scheduled_tasks = []
    unscheduled_tasks = []
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for t_id, tv in task_vars.items():
            if solver.Value(tv["is_scheduled"]):
                start_slot = solver.Value(tv["start"])
                end_slot = solver.Value(tv["end"])
                
                # convert slots back to time
                start_hour = 6 + (start_slot // 4)
                start_min = (start_slot % 4) * 15
                end_hour = 6 + (end_slot // 4)
                end_min = (end_slot % 4) * 15
                
                scheduled_tasks.append({
                    "task_id": t_id,
                    "start_time": f"{start_hour:02d}:{start_min:02d}",
                    "end_time": f"{end_hour:02d}:{end_min:02d}"
                })
            else:
                unscheduled_tasks.append({
                    "task_id": t_id,
                    "reason": "Constraints prevented scheduling (e.g., conflicts, time windows)"
                })
                
        status_str = "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE"
    else:
        status_str = "INFEASIBLE"
        for t_id in task_vars:
            unscheduled_tasks.append({"task_id": t_id, "reason": "Model Infeasible"})
            
    stats = {
        "status": status_str,
        "solve_time_seconds": solver.WallTime(),
        "objective_value": solver.ObjectiveValue() if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else 0,
        "scheduled_count": len(scheduled_tasks),
        "unscheduled_count": len(unscheduled_tasks)
    }
    
    return {
        "scheduled": scheduled_tasks,
        "unscheduled": unscheduled_tasks,
        "conflicts": conflicts,
        "stats": stats
    }
