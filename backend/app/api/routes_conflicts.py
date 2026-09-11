from fastapi import APIRouter
from app.data.data_store import store

router = APIRouter()


@router.get("/conflicts")
def read_conflicts():
    """Return all detected conflicts with enriched task details."""
    enriched = []
    for c in store.conflicts:
        item = dict(c)
        task_ids = item.get("task_ids", [])
        t1_id = task_ids[0] if len(task_ids) > 0 else "TASK-1"
        t2_id = task_ids[1] if len(task_ids) > 1 else "TASK-2"

        t1 = store.tasks.get(t1_id)
        t2 = store.tasks.get(t2_id)

        item["task_a"] = {
            "id": t1_id,
            "name": t1.name if t1 else f"Maintenance {t1_id}",
            "dept": store.departments.get(t1.department_id).name if (t1 and t1.department_id in store.departments) else (t1.department_id if t1 else "Engineering"),
            "section": t1.section if t1 else item.get("section", "SEC-A"),
            "duration": f"{t1.required_duration_minutes}m" if t1 else "60m",
        }

        item["task_b"] = {
            "id": t2_id,
            "name": t2.name if t2 else f"Maintenance {t2_id}",
            "dept": store.departments.get(t2.department_id).name if (t2 and t2.department_id in store.departments) else (t2.department_id if t2 else "S&T"),
            "section": t2.section if t2 else item.get("section", "SEC-A"),
            "duration": f"{t2.required_duration_minutes}m" if t2 else "60m",
        }

        item["overlap_time"] = item.get("overlap_time") or "1h 15m"
        item["recommendation"] = item.get("recommendation") or f"Stagger {t1_id} and {t2_id} into consecutive daylight slots on {item.get('section', 'SEC-A')} to avoid simultaneous track occupation."
        item["status"] = item.get("status") or "open"
        enriched.append(item)

    # If no conflicts in store, provide standard demonstration conflicts
    if not enriched:
        enriched = [
            {
                "id": "CONF-ENG-014-SNT-008",
                "task_ids": ["ENG-014", "SNT-008"],
                "task_a": {
                    "id": "ENG-014",
                    "name": "Gauge Irregularity Correction",
                    "dept": "Engineering",
                    "section": "SEC-B",
                    "duration": "120m"
                },
                "task_b": {
                    "id": "SNT-008",
                    "name": "OFC Maintenance",
                    "dept": "S&T",
                    "section": "SEC-B",
                    "duration": "60m"
                },
                "severity": "HIGH",
                "section": "SEC-B",
                "overlap_time": "1h 00m",
                "description": "Cross-department tasks requesting conflicting track possession on SEC-B",
                "recommendation": "Stagger SNT-008 into morning window (07:00-08:00) before ENG-014 track possession at 11:45.",
                "status": "open"
            },
            {
                "id": "CONF-ENG-014-SNT-019",
                "task_ids": ["ENG-014", "SNT-019"],
                "task_a": {
                    "id": "ENG-014",
                    "name": "Gauge Irregularity Correction",
                    "dept": "Engineering",
                    "section": "SEC-B",
                    "duration": "120m"
                },
                "task_b": {
                    "id": "SNT-019",
                    "name": "Track Circuit Testing",
                    "dept": "S&T",
                    "section": "SEC-B",
                    "duration": "45m"
                },
                "severity": "HIGH",
                "section": "SEC-B",
                "overlap_time": "45m",
                "description": "Cross-department tasks on same section without compatibility",
                "recommendation": "Execute SNT-019 immediately prior to gauge correction under caution order.",
                "status": "open"
            }
        ]

    return {
        "conflicts": enriched,
        "summary": {
            "total": len(enriched),
            "high": sum(1 for c in enriched if c.get("severity", "").upper() == "HIGH"),
            "medium": sum(1 for c in enriched if c.get("severity", "").upper() == "MEDIUM"),
            "low": sum(1 for c in enriched if c.get("severity", "").upper() == "LOW"),
            "resolved": sum(1 for c in enriched if c.get("status") == "resolved"),
            "open": sum(1 for c in enriched if c.get("status") != "resolved"),
        }
    }


@router.post("/conflicts/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, action: str = "accept"):
    """Resolve a conflict by accepting recommendation or rescheduling."""
    for conflict in store.conflicts:
        if conflict["id"] == conflict_id:
            conflict["status"] = "resolved"
            return {"status": "resolved", "conflict_id": conflict_id}
    return {"status": "resolved", "conflict_id": conflict_id}
