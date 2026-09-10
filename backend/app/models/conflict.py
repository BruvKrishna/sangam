from pydantic import BaseModel
from typing import List

class Conflict(BaseModel):
    id: str
    task_ids: List[str]
    description: str
    severity: str
    section: str
