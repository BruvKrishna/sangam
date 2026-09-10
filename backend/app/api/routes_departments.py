from fastapi import APIRouter, HTTPException
from app.data.data_store import store
from collections import Counter

router = APIRouter()


@router.get("/departments")
def read_departments():
    departments = []
    for dept in store.departments.values():
        dept_tasks = [t for t in store.tasks.values() if t.department_id == dept.id]
        dept_schedules = [s for s in store.schedules if s.get("department_id") == dept.id]

        active = sum(1 for t in dept_tasks if t.status in ("in_progress",))
        planned = sum(1 for t in dept_tasks if t.status in ("scheduled",))
        pending = sum(1 for t in dept_tasks if t.status in ("pending",))
        completed = sum(1 for t in dept_tasks if t.status in ("completed",))
        overdue = sum(1 for t in dept_tasks if t.status == "overdue" or t.overdue_score > 50)
        critical = sum(1 for t in dept_tasks if t.criticality >= 80)
        total_duration = sum(t.required_duration_minutes for t in dept_tasks if t.status in ("pending", "scheduled", "overdue", "in_progress"))
        block_hours = round(total_duration / 60, 1)

        departments.append({
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "head": dept.head,
            "stats": {
                "total_tasks": len(dept_tasks),
                "active": active,
                "planned": planned,
                "pending": pending,
                "completed": completed,
                "overdue": overdue,
                "critical": critical,
                "block_hours": block_hours,
                "resource_utilization": min(95, round(block_hours / max(1, len(dept_tasks)) * 10, 1)),
            }
        })

    # Find coordination opportunities
    coordination = _find_coordination_opportunities()

    return {
        "departments": departments,
        "coordination_opportunities": coordination,
    }


@router.get("/departments/{dept_id}")
def read_department(dept_id: str):
    dept = store.departments.get(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    dept_tasks = [t for t in store.tasks.values() if t.department_id == dept_id]
    return {
        "department": dept.model_dump(),
        "tasks": [t.model_dump() for t in sorted(dept_tasks, key=lambda t: t.priority_score or 0, reverse=True)],
        "total_tasks": len(dept_tasks),
    }


def _find_coordination_opportunities():
    """Find tasks from different departments on the same section/date that could share a block."""
    opportunities = []
    tasks = list(store.tasks.values())

    # Group pending tasks by (section, date)
    groups = {}
    for t in tasks:
        if t.status in ("pending", "overdue"):
            key = (t.section, t.planning_date)
            groups.setdefault(key, []).append(t)

    for (section, date), group_tasks in groups.items():
        dept_ids = set(t.department_id for t in group_tasks)
        if len(dept_ids) >= 2:
            dept_names = [store.departments[d].name for d in dept_ids if d in store.departments]
            total_duration = sum(t.required_duration_minutes for t in group_tasks)
            savings_hours = round((total_duration * 0.4) / 60, 1)
            opportunities.append({
                "title": f"Combined Maintenance Block on {section}",
                "description": f"Coordinate {', '.join(dept_names)} maintenance activities on {section} ({date}) to execute {len(group_tasks)} tasks within a unified block window.",
                "section": section,
                "planning_date": date,
                "departments": dept_names,
                "task_count": len(group_tasks),
                "total_duration_minutes": total_duration,
                "potential_savings": savings_hours,
                "task_ids": [t.id for t in group_tasks[:4]],
                "recommendation": f"Coordinate {', '.join(dept_names)} on {section} — {len(group_tasks)} tasks, {total_duration} min total",
            })

    return sorted(opportunities, key=lambda x: x["task_count"], reverse=True)[:5]
