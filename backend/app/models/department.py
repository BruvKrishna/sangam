from pydantic import BaseModel
from typing import Optional

class Department(BaseModel):
    id: str
    name: str
    description: str
    head: Optional[str] = None
