from fastapi import APIRouter
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter()

@router.get("/dashboard/summary")
def read_dashboard_summary():
    return get_dashboard_summary()
