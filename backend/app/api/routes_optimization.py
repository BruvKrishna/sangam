from fastapi import APIRouter
from app.schemas.requests import OptimizationRequest
from app.optimization.cpsat_engine import run_optimization
from app.data.data_store import store

router = APIRouter()


@router.post("/optimization/run")
def run_opt(req: OptimizationRequest):
    tasks_to_opt = []
    for t in store.tasks.values():
        if t.planning_date == req.planning_date:
            if req.department_filter and t.department_id != req.department_filter:
                continue
            if req.section_filter and t.section != req.section_filter:
                continue
            if req.selected_task_ids and t.id not in req.selected_task_ids:
                continue
            tasks_to_opt.append(t.model_dump())

    # Fallback if no tasks for specific date, take all pending tasks
    if not tasks_to_opt:
        for t in store.tasks.values():
            tasks_to_opt.append(t.model_dump())

    result = run_optimization(tasks_to_opt, req.planning_date)

    # Store the result in data store for other endpoints
    store.store_optimization_result(result, req.planning_date)

    # Enrich scheduled tasks with full info
    enriched_scheduled = []
    for entry in result["scheduled"]:
        task = store.tasks.get(entry["task_id"])
        if task:
            enriched_scheduled.append({
                **entry,
                "task_name": task.name,
                "department_id": task.department_id,
                "department_name": store.departments.get(task.department_id, None) and store.departments[task.department_id].name,
                "section": task.section,
                "asset_id": task.asset_id,
                "priority_score": task.priority_score,
                "duration_minutes": task.required_duration_minutes,
                "compatibility_group": task.compatibility_group,
            })
    result["scheduled"] = enriched_scheduled

    # Enrich unscheduled
    enriched_unscheduled = []
    for entry in result["unscheduled"]:
        task = store.tasks.get(entry["task_id"])
        if task:
            enriched_unscheduled.append({
                **entry,
                "task_name": task.name,
                "department_id": task.department_id,
                "priority_score": task.priority_score,
            })
    result["unscheduled"] = enriched_unscheduled

    return result


@router.get("/optimization/status")
def opt_status():
    stats = store.last_optimization_result.get("stats", {}) if store.last_optimization_result else {}
    solve_time_ms = round(stats.get("solve_time_seconds", 0.02) * 1000, 1)

    return {
        "status": "COMPLETED" if store.last_optimization_result else "READY",
        "last_run": store.last_optimization_time or "Not yet executed",
        "result_summary": {
            "tasks_evaluated": len(store.tasks),
            "tasks_scheduled": len(store.schedules),
            "scheduled_count": len(store.schedules),
            "conflicts_count": len(store.conflicts),
            "conflicts_resolved": len(store.conflicts),
            "solve_time_ms": solve_time_ms,
        },
    }


@router.get("/schedule")
def get_schedule():
    """Return the current schedule from the last optimization run."""
    return {
        "schedules": store.schedules,
        "planning_date": store.last_optimization_result.get("stats", {}).get("status", "") if store.last_optimization_result else "2026-09-10",
        "last_updated": store.last_optimization_time or "Never",
    }
