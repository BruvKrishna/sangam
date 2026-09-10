from app.data.data_store import store
from typing import List, Dict, Optional


def get_all_tasks(department: Optional[str] = None, section: Optional[str] = None, status: Optional[str] = None) -> List[Dict]:
    tasks = list(store.tasks.values())
    if department:
        tasks = [t for t in tasks if t.department_id == department]
    if section:
        tasks = [t for t in tasks if t.section == section]
    if status:
        tasks = [t for t in tasks if t.status == status]
    return sorted(tasks, key=lambda t: t.priority_score or 0, reverse=True)


def get_task_by_id(task_id: str):
    return store.tasks.get(task_id)


def update_task_status(task_id: str, new_status: str) -> bool:
    task = store.tasks.get(task_id)
    if task:
        task.status = new_status
        return True
    return False
