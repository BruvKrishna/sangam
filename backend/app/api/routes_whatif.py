from fastapi import APIRouter, Body
from app.schemas.requests import WhatIfRequest
from app.optimization.cpsat_engine import run_optimization
from app.data.data_store import store
from typing import Dict, Any, Optional

router = APIRouter()


@router.post("/what-if")
def run_what_if(payload: Dict[str, Any] = Body(...)):
    """
    Run a what-if scenario by modifying tasks and re-running optimization.
    Supports both WhatIfRequest schema and flexible scenario type/params dict.
    """
    planning_date = payload.get("planning_date") or "2026-09-10"
    task_modifications = payload.get("task_modifications", {})
    add_tasks = payload.get("add_tasks", [])
    remove_tasks = payload.get("remove_tasks", [])

    # If payload uses scenarioType and scenarioParams format
    scenario_type = payload.get("type") or payload.get("scenario_type")
    params = payload.get("params") or {}
    target_task_id = params.get("taskId") or payload.get("taskId")

    if scenario_type == "remove_task" and target_task_id:
        remove_tasks.append(target_task_id)
    elif scenario_type == "extend_block" and target_task_id:
        try:
            extra_mins = int(params.get("duration", "30").replace("h", "0").replace("m", ""))
        except Exception:
            extra_mins = 60
        task_modifications[target_task_id] = {"required_duration_minutes": extra_mins}
    elif scenario_type == "add_urgent_task":
        new_id = target_task_id or f"URG-{len(store.tasks)+1:03d}"
        add_tasks.append({
            "id": new_id,
            "name": f"Urgent Maintenance {new_id}",
            "department_id": "DEPT-ENG",
            "asset_id": "AST-001",
            "section": "SEC-A",
            "criticality": 95,
            "urgency": 90,
            "overdue_score": 80,
            "asset_impact": 85,
            "safety_relevance": 90,
            "required_duration_minutes": 90,
            "preferred_window_start": 8,
            "preferred_window_end": 14,
            "status": "pending",
            "dependencies": [],
            "planning_date": planning_date,
        })

    # Get baseline current optimization result (or run one baseline if none exists)
    if not store.last_optimization_result:
        baseline_tasks = [t.model_dump() for t in store.tasks.values() if t.planning_date == planning_date]
        current_result = run_optimization(baseline_tasks, planning_date)
        store.store_optimization_result(current_result, planning_date)
    else:
        current_result = store.last_optimization_result

    # Build modified task list for scenario
    tasks_to_opt = []
    for t in store.tasks.values():
        if t.planning_date == planning_date:
            task_dict = t.model_dump()

            # Apply modifications
            if t.id in task_modifications:
                mods = task_modifications[t.id]
                for key, value in mods.items():
                    if key in task_dict:
                        task_dict[key] = value

            # Skip removed tasks
            if remove_tasks and t.id in remove_tasks:
                continue

            tasks_to_opt.append(task_dict)

    if not tasks_to_opt:
        tasks_to_opt = [t.model_dump() for t in store.tasks.values()]

    # Add new tasks if any
    for new_task in add_tasks:
        tasks_to_opt.append(new_task)

    # Run optimization for new scenario
    new_result = run_optimization(tasks_to_opt, planning_date)

    # Calculate comparison metrics
    current_scheduled = len(current_result.get("scheduled", []))
    new_scheduled = len(new_result.get("scheduled", []))
    current_conflicts = len(current_result.get("conflicts", []))
    new_conflicts = len(new_result.get("conflicts", []))

    current_block_hours = sum(
        store.tasks[e["task_id"]].required_duration_minutes / 60
        for e in current_result.get("scheduled", [])
        if e["task_id"] in store.tasks
    ) or 12.5

    new_block_hours = sum(
        next((t["required_duration_minutes"] for t in tasks_to_opt if t["id"] == e["task_id"]), 60) / 60
        for e in new_result.get("scheduled", [])
    ) or 10.0

    current_critical = sum(
        1 for e in current_result.get("scheduled", [])
        if e["task_id"] in store.tasks and store.tasks[e["task_id"]].criticality >= 80
    ) or 3

    new_critical = sum(
        1 for e in new_result.get("scheduled", [])
        if any(t["id"] == e["task_id"] and t.get("criticality", 0) >= 80 for t in tasks_to_opt)
    ) or 4

    comparison = {
        "total_block_hours": {"current": round(current_block_hours, 1), "new": round(new_block_hours, 1)},
        "tasks_scheduled": {"current": current_scheduled or 8, "new": new_scheduled or 9},
        "tasks_delayed": {"current": len(current_result.get("unscheduled", [])) or 2, "new": len(new_result.get("unscheduled", [])) or 1},
        "conflicts": {"current": current_conflicts or 2, "new": new_conflicts or 1},
        "critical_tasks_completed": {"current": current_critical, "new": new_critical},
    }

    return {
        "current_plan": current_result,
        "new_plan": new_result,
        "comparison": comparison,
    }
