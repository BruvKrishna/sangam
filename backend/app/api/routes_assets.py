from fastapi import APIRouter, HTTPException, Query
from app.data.data_store import store
from typing import Optional
from collections import Counter

router = APIRouter()


@router.get("/assets")
def read_assets(
    asset_type: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    assets = list(store.assets.values())

    if asset_type:
        assets = [a for a in assets if a.type == asset_type]
    if section:
        assets = [a for a in assets if a.section == section]
    if condition:
        assets = [a for a in assets if a.condition == condition]
    if search:
        search_lower = search.lower()
        assets = [a for a in assets if search_lower in a.id.lower() or search_lower in a.name.lower() or search_lower in a.type.lower()]

    # Enrich with related task count
    enriched = []
    for a in assets:
        ad = a.model_dump()
        related_tasks = [t for t in store.tasks.values() if t.asset_id == a.id]
        ad["related_task_count"] = len(related_tasks)
        ad["active_tasks"] = sum(1 for t in related_tasks if t.status in ("scheduled", "in_progress"))
        dept = store.departments.get(a.department_id)
        ad["department_name"] = dept.name if dept else a.department_id
        enriched.append(ad)

    # Chart data
    condition_counts = Counter(a.condition for a in store.assets.values())
    type_counts = Counter(a.type for a in store.assets.values())
    status_counts = Counter(a.maintenance_status for a in store.assets.values())

    return {
        "assets": enriched,
        "total": len(enriched),
        "charts": {
            "by_condition": [{"condition": k, "count": v} for k, v in condition_counts.items()],
            "by_type": [{"type": k, "count": v} for k, v in type_counts.items()],
            "by_maintenance_status": [{"status": k, "count": v} for k, v in status_counts.items()],
        },
        "filters": {
            "types": sorted(set(a.type for a in store.assets.values())),
            "sections": [s["id"] for s in store.sections],
            "conditions": ["Good", "Fair", "Poor", "Critical"],
        }
    }


@router.get("/assets/{asset_id}")
def read_asset(asset_id: str):
    asset = store.assets.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    ad = asset.model_dump()
    related_tasks = [t.model_dump() for t in store.tasks.values() if t.asset_id == asset_id]
    ad["related_tasks"] = sorted(related_tasks, key=lambda t: t.get("priority_score", 0) or 0, reverse=True)
    dept = store.departments.get(asset.department_id)
    ad["department_name"] = dept.name if dept else asset.department_id

    return ad
