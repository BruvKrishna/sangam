from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class Task(BaseModel):
    id: str
    name: str
    department_id: str
    asset_id: str
    section: str

    criticality: int = Field(ge=0, le=100)
    urgency: int = Field(ge=0, le=100)
    overdue_score: int = Field(ge=0, le=100)
    asset_impact: int = Field(ge=0, le=100)
    safety_relevance: int = Field(ge=0, le=100)

    required_duration_minutes: int
    preferred_window_start: int  # 0-23
    preferred_window_end: int  # 0-23

    status: str  # pending, scheduled, in_progress, completed, overdue, cancelled
    dependencies: List[str] = []
    compatibility_group: Optional[str] = None
    planning_date: str

    priority_score: Optional[float] = None
    priority_breakdown: Optional[Dict[str, float]] = None
    explanation: Optional[List[str]] = None
