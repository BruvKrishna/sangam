from fastapi import APIRouter
from app.schemas.requests import ApprovalRequest
from app.data.data_store import store

router = APIRouter()


@router.get("/approval/pending")
def pending_approvals():
    """Return all schedule entries pending approval."""
    pending = [
        {
            **sched,
            "approval": store.approvals.get(sched["id"], {}),
        }
        for sched in store.schedules
        if sched.get("approval_status") == "pending"
    ]
    return {
        "pending": pending,
        "summary": {
            "total": len(store.schedules),
            "pending": sum(1 for s in store.schedules if s.get("approval_status") == "pending"),
            "approved": sum(1 for s in store.schedules if s.get("approval_status") == "approved"),
            "rejected": sum(1 for s in store.schedules if s.get("approval_status") == "rejected"),
        }
    }


@router.get("/approval/all")
def all_approvals():
    """Return all schedule entries with their approval status."""
    all_entries = [
        {
            **sched,
            "approval": store.approvals.get(sched["id"], {}),
        }
        for sched in store.schedules
    ]
    return {
        "entries": all_entries,
        "summary": {
            "total": len(store.schedules),
            "pending": sum(1 for s in store.schedules if s.get("approval_status") == "pending"),
            "approved": sum(1 for s in store.schedules if s.get("approval_status") == "approved"),
            "rejected": sum(1 for s in store.schedules if s.get("approval_status") == "rejected"),
        }
    }


@router.post("/approval/{schedule_id}/approve")
def approve(schedule_id: str, req: ApprovalRequest):
    result = store.apply_approval(schedule_id, "approved", req.approved_by, req.comments)
    if result:
        return result
    return {"error": "Schedule not found"}


@router.post("/approval/{schedule_id}/reject")
def reject(schedule_id: str, req: ApprovalRequest):
    result = store.apply_approval(schedule_id, "rejected", req.approved_by, req.comments)
    if result:
        return result
    return {"error": "Schedule not found"}


@router.post("/approval/{schedule_id}/modify")
def modify(schedule_id: str, req: ApprovalRequest):
    result = store.apply_approval(schedule_id, "modified", req.approved_by, req.comments)
    if result:
        return result
    return {"error": "Schedule not found"}


@router.post("/approval/{schedule_id}/send-back")
def send_back(schedule_id: str, req: ApprovalRequest):
    result = store.apply_approval(schedule_id, "sent_back", req.approved_by, req.comments)
    if result:
        return result
    return {"error": "Schedule not found"}
