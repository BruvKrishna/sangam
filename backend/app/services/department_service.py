from app.data.data_store import store
from typing import List, Dict

def get_all_departments() -> List[Dict]:
    return [d.dict() for d in store.departments.values()]

def get_department(dept_id: str) -> Dict:
    dept = store.departments.get(dept_id)
    return dept.dict() if dept else None
