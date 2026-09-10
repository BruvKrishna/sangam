from fastapi import APIRouter
from app.data.data_store import store

router = APIRouter()


@router.get("/conflicts")
def read_conflicts():
    """Return all detected conflicts from the last optimization run."""
    return {
        "conflicts": store.conflicts,
        "summary": {
            "total": len(store.conflicts),
            "high": sum(1 for c in store.conflicts if c.get("severity") == "HIGH"),
            "medium": sum(1 for c in store.conflicts if c.get("severity") == "MEDIUM"),
            "low": sum(1 for c in store.conflicts if c.get("severity") == "LOW"),
            "resolved": sum(1 for c in store.conflicts if c.get("status") == "resolved"),
            "open": sum(1 for c in store.conflicts if c.get("status") == "open"),
        }
    }


@router.post("/conflicts/{conflict_id}/resolve")
def resolve_conflict(conflict_id: str, action: str = "accept"):
    """Resolve a conflict by accepting the recommendation or other action."""
    for conflict in store.conflicts:
        if conflict["id"] == conflict_id:
            conflict["status"] = "resolved"
            return {"status": "resolved", "conflict_id": conflict_id}
    return {"error": "Conflict not found"}
