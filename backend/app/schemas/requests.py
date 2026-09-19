from pydantic import BaseModel
from typing import List, Optional, Dict

class OptimizationRequest(BaseModel):
    planning_date: str
    selected_task_ids: Optional[List[str]] = None
    department_filter: Optional[str] = None
    section_filter: Optional[str] = None

class WhatIfRequest(BaseModel):
    planning_date: str
    task_modifications: dict # task_id -> {modified_fields}
    add_tasks: Optional[List[dict]] = None
    remove_tasks: Optional[List[str]] = None

class PriorityRequest(BaseModel):
    task_id: str
    custom_weights: Optional[Dict[str, float]] = None

class UpdateTaskStatusRequest(BaseModel):
    status: str

class ApprovalRequest(BaseModel):
    approved_by: str
    comments: str = ""

class ReportRequest(BaseModel):
    report_type: str
    planning_date: str
