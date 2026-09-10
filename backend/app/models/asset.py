from pydantic import BaseModel
from typing import Optional

class Asset(BaseModel):
    id: str
    type: str
    section: str
    name: str
    description: Optional[str] = None
    department_id: Optional[str] = None
    criticality: int = 50  # 0-100
    condition: str = "Good"  # Good, Fair, Poor, Critical
    last_maintenance: Optional[str] = None  # ISO date
    next_maintenance: Optional[str] = None  # ISO date
    maintenance_status: str = "Up to Date"  # Up to Date, Due Soon, Overdue
