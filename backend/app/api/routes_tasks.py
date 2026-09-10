from fastapi import APIRouter, HTTPException, Query
from app.data.data_store import store
from app.schemas.requests import UpdateTaskStatusRequest
from typing import Optional

router = APIRouter()


@router.get("/tasks")
def read_tasks(
    department: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority_min: Optional[float] = Query(None),
    planning_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    tasks = list(store.tasks.values())

    if department:
        tasks = [t for t in tasks if t.department_id == department]
    if section:
        tasks = [t for t in tasks if t.section == section]
    if status:
        tasks = [t for t in tasks if t.status == status]
    if priority_min is not None:
        tasks = [t for t in tasks if (t.priority_score or 0) >= priority_min]
    if planning_date:
        tasks = [t for t in tasks if t.planning_date == planning_date]
    if search:
        search_lower = search.lower()
        tasks = [t for t in tasks if search_lower in t.id.lower() or search_lower in t.name.lower()]

    # Sort by priority score descending
    tasks = sorted(tasks, key=lambda t: t.priority_score or 0, reverse=True)

    # Enrich with department name and asset info
    enriched = []
    for t in tasks:
        td = t.model_dump()
        dept = store.departments.get(t.department_id)
        td["department_name"] = dept.name if dept else t.department_id
        asset = store.assets.get(t.asset_id)
        td["asset_name"] = asset.name if asset else t.asset_id
        td["asset_type"] = asset.type if asset else "Unknown"
        enriched.append(td)

    return {
        "tasks": enriched,
        "total": len(enriched),
        "sections": [s["id"] for s in store.sections],
        "departments": [{"id": d.id, "name": d.name} for d in store.departments.values()],
    }


@router.get("/tasks/{task_id}")
def read_task(task_id: str):
    task = store.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    td = task.model_dump()
    dept = store.departments.get(task.department_id)
    td["department_name"] = dept.name if dept else task.department_id
    asset = store.assets.get(task.asset_id)
    if asset:
        td["asset_info"] = asset.model_dump()
    else:
        td["asset_info"] = {"id": task.asset_id, "name": "Unknown"}

    # Check if task is in current schedule
    for sched in store.schedules:
        if sched["task_id"] == task_id:
            td["schedule_info"] = sched
            break

    return td


@router.post("/tasks/{task_id}/update-status")
def update_task_status(task_id: str, req: UpdateTaskStatusRequest):
    task = store.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = req.status
    return {"task_id": task_id, "new_status": req.status}
