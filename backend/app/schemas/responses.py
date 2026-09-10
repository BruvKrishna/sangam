from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ScheduledTask(BaseModel):
    task_id: str
    start_time: str
    end_time: str


class UnscheduledTask(BaseModel):
    task_id: str
    reason: str


class ConflictInfo(BaseModel):
    id: str
    task_ids: List[str]
    description: str
    severity: str
    section: str


class OptimizationStats(BaseModel):
    status: str
    solve_time_seconds: float = 0.0
    objective_value: float = 0.0
    scheduled_count: int = 0
    unscheduled_count: int = 0


class OptimizationResponse(BaseModel):
    scheduled: List[ScheduledTask]
    unscheduled: List[UnscheduledTask]
    conflicts: List[ConflictInfo]
    stats: OptimizationStats


class PriorityResponse(BaseModel):
    task_id: str
    score: float
    breakdown: Dict[str, float]
    raw_scores: Dict[str, int]
    explanation: List[str]


class DashboardSummaryResponse(BaseModel):
    kpis: Dict[str, Any]
    charts: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    planning_status: Dict[str, Any]


class ApprovalResponse(BaseModel):
    schedule_id: str
    status: str
    approved_by: Optional[str] = None
    comments: str = ""
    timestamp: Optional[str] = None


class ReportResponse(BaseModel):
    report_type: str
    planning_date: str
    generated_at: str
    content: Dict[str, Any]
