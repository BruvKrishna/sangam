from app.data.data_store import store
from typing import Dict, Any, List
from collections import Counter


def get_dashboard_summary() -> Dict[str, Any]:
    tasks = list(store.tasks.values())
    total = len(tasks)

    # KPI counts
    critical_tasks = sum(1 for t in tasks if t.criticality >= 80)
    overdue_tasks = sum(1 for t in tasks if t.status == "overdue" or t.overdue_score > 50)
    scheduled_tasks = sum(1 for t in tasks if t.status in ("scheduled", "in_progress"))
    pending_tasks = sum(1 for t in tasks if t.status == "pending")
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    cancelled_tasks = sum(1 for t in tasks if t.status == "cancelled")
    planned_blocks = len(store.schedules)
    conflicts_detected = len(store.conflicts)

    # Estimated block hours
    total_duration_mins = sum(t.required_duration_minutes for t in tasks if t.status in ("pending", "scheduled", "overdue", "in_progress"))
    estimated_block_hours = round(total_duration_mins / 60, 1)

    # Assets under maintenance
    assets_under_maint = len(set(t.asset_id for t in tasks if t.status in ("scheduled", "in_progress")))

    # Charts data
    # Tasks by department
    dept_counts = Counter(t.department_id for t in tasks)
    dept_names = {d.id: d.name for d in store.departments.values()}
    tasks_by_department = [
        {"department": dept_names.get(dept_id, dept_id), "count": count}
        for dept_id, count in dept_counts.items()
    ]

    # Tasks by priority category
    def priority_category(score):
        if score is None:
            return "Unscored"
        if score >= 80:
            return "Critical"
        if score >= 60:
            return "High"
        if score >= 40:
            return "Medium"
        return "Low"

    priority_counts = Counter(priority_category(t.priority_score) for t in tasks)
    tasks_by_priority = [
        {"category": cat, "count": count}
        for cat, count in priority_counts.items()
    ]

    # Tasks by status
    status_counts = Counter(t.status for t in tasks)
    tasks_by_status = [
        {"status": status, "count": count}
        for status, count in status_counts.items()
    ]

    # Block hours by date
    date_hours = {}
    for t in tasks:
        if t.status in ("pending", "scheduled", "overdue", "in_progress"):
            date_hours[t.planning_date] = date_hours.get(t.planning_date, 0) + t.required_duration_minutes / 60
    block_hours_by_day = sorted(
        [{"date": date, "hours": round(hours, 1)} for date, hours in date_hours.items()],
        key=lambda x: x["date"]
    )

    # Asset availability trend (simulated)
    asset_availability = [
        {"date": f"2026-09-{d:02d}", "availability": round(85 + (d % 3) * 3 - (d % 5) * 2, 1)}
        for d in range(10, 18)
    ]

    # Overdue vs upcoming
    overdue_count = sum(1 for t in tasks if t.status == "overdue" or t.overdue_score > 50)
    upcoming_count = sum(1 for t in tasks if t.status == "pending" and t.overdue_score <= 50)

    # AI Recommendations
    recommendations = _generate_recommendations(tasks)

    # Planning status
    planning_status = {
        "planning_horizon": "2026-09-10 to 2026-09-17",
        "last_optimization_run": store.last_optimization_time or "Not yet run",
        "tasks_considered": total,
        "constraints_evaluated": total * 3,  # approximate
        "schedule_status": "Optimization available" if not store.last_optimization_result else "Schedule generated",
    }

    return {
        "kpis": {
            "total_tasks": total,
            "critical_tasks": critical_tasks,
            "overdue_tasks": overdue_tasks,
            "planned_blocks": planned_blocks,
            "conflicts_detected": conflicts_detected,
            "assets_under_maintenance": assets_under_maint,
            "estimated_block_hours": estimated_block_hours,
            "tasks_scheduled": scheduled_tasks,
        },
        "charts": {
            "tasks_by_department": tasks_by_department,
            "tasks_by_priority": tasks_by_priority,
            "tasks_by_status": tasks_by_status,
            "block_hours_by_day": block_hours_by_day,
            "asset_availability": asset_availability,
            "overdue_vs_upcoming": {"overdue": overdue_count, "upcoming": upcoming_count},
        },
        "recommendations": recommendations,
        "planning_status": planning_status,
    }


def _generate_recommendations(tasks: list) -> List[Dict[str, Any]]:
    recommendations = []

    # Find overdue tasks that can be combined
    overdue = [t for t in tasks if t.status == "overdue" or t.overdue_score > 50]
    if overdue:
        # Group by section
        section_overdue = {}
        for t in overdue:
            section_overdue.setdefault(t.section, []).append(t)

        for section, section_tasks in section_overdue.items():
            if len(section_tasks) >= 2:
                dept_ids = set(t.department_id for t in section_tasks)
                dept_names_list = [store.departments[d].name for d in dept_ids if d in store.departments]
                recommendations.append({
                    "priority": "HIGH",
                    "message": f"{len(section_tasks)} overdue activities across {', '.join(dept_names_list)} can be combined in a coordinated block on {section}.",
                    "task_ids": [t.id for t in section_tasks[:3]],
                    "type": "coordination",
                })
                if len(recommendations) >= 2:
                    break

    # Find high-priority pending tasks
    high_priority_pending = sorted(
        [t for t in tasks if t.status == "pending" and t.priority_score and t.priority_score >= 70],
        key=lambda t: t.priority_score, reverse=True
    )
    if high_priority_pending:
        top = high_priority_pending[0]
        recommendations.append({
            "priority": "HIGH",
            "message": f"{top.name} (Asset {top.asset_id}) should be scheduled within the next available maintenance window. Priority score: {top.priority_score}.",
            "task_ids": [top.id],
            "type": "scheduling",
        })

    # Find compatibility group opportunities
    compat_tasks = [t for t in tasks if t.compatibility_group and t.status == "pending"]
    groups = {}
    for t in compat_tasks:
        groups.setdefault(t.compatibility_group, []).append(t)
    for grp, grp_tasks in groups.items():
        if len(grp_tasks) >= 2:
            recommendations.append({
                "priority": "MEDIUM",
                "message": f"{len(grp_tasks)} compatible tasks in group '{grp}' can share a single block window, reducing total disruption.",
                "task_ids": [t.id for t in grp_tasks[:3]],
                "type": "efficiency",
            })
            break

    # General recommendation
    if len(overdue) > 5:
        recommendations.append({
            "priority": "MEDIUM",
            "message": f"{len(overdue)} tasks are overdue or approaching overdue status. Consider running optimization to prioritize rescheduling.",
            "task_ids": [],
            "type": "general",
        })

    return recommendations[:4]
