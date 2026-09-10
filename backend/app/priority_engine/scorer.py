from app.models.task import Task
from typing import Dict, Any, List

def calculate_priority(task: Task) -> tuple[float, Dict[str, float]]:
    # 0.30*criticality + 0.25*urgency + 0.20*overdue + 0.15*asset_impact + 0.10*safety_relevance
    c_score = 0.30 * task.criticality
    u_score = 0.25 * task.urgency
    o_score = 0.20 * task.overdue_score
    a_score = 0.15 * task.asset_impact
    s_score = 0.10 * task.safety_relevance
    
    total = c_score + u_score + o_score + a_score + s_score
    
    breakdown = {
        "criticality": c_score,
        "urgency": u_score,
        "overdue_score": o_score,
        "asset_impact": a_score,
        "safety_relevance": s_score
    }
    
    return round(total, 2), breakdown
