from app.models.task import Task
from typing import Dict, List

def generate_explanation(task: Task, breakdown: Dict[str, float]) -> List[str]:
    explanations = []
    
    if task.criticality >= 80:
        explanations.append(f"High task criticality ({task.criticality}/100) - this task is critical for operations.")
    if task.urgency >= 80:
        explanations.append(f"High urgency ({task.urgency}/100) - requires immediate attention.")
    if task.overdue_score >= 50:
        explanations.append(f"Task is overdue (score {task.overdue_score}/100) - needs to be prioritized.")
    if task.asset_impact >= 80:
        explanations.append(f"High asset impact ({task.asset_impact}/100) - associated asset is vital.")
    if task.safety_relevance >= 80:
        explanations.append(f"High safety relevance ({task.safety_relevance}/100) - critical for safety compliance.")
        
    if not explanations:
        explanations.append("Routine maintenance task with standard priority.")
        
    return explanations
