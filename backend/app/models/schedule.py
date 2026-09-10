from pydantic import BaseModel
from typing import List

class ScheduleEntry(BaseModel):
    id: str
    task_id: str
    planning_date: str
    start_time: str # HH:MM
    end_time: str # HH:MM
    status: str

class Block(BaseModel):
    id: str
    section: str
    start_time: str
    end_time: str
    tasks: List[str]
    department_id: str

class ApprovalRecord(BaseModel):
    id: str
    schedule_id: str
    status: str
    approved_by: str
    comments: str
