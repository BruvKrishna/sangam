from app.models.task import Task
from typing import Dict, List, Optional, Any

def generate_explanation(task: Task, breakdown: Dict[str, float], ml_risk: Optional[Dict[str, Any]] = None) -> List[str]:
    explanations = []

    if task.criticality >= 80:
        explanations.append(f"High task criticality ({task.criticality}/100) — critical for safe operations.")
    if task.urgency >= 80:
        explanations.append(f"High urgency ({task.urgency}/100) — requires immediate corridor block allocation.")
    if task.overdue_score >= 50:
        explanations.append(f"Task is overdue (score {task.overdue_score}/100) — maintenance cycle limit exceeded.")
    if task.asset_impact >= 80:
        explanations.append(f"High asset impact ({task.asset_impact}/100) — key track section / signalling asset.")
    if task.safety_relevance >= 80:
        explanations.append(f"High safety relevance ({task.safety_relevance}/100) — vital for passenger safety compliance.")

    if ml_risk:
        risk_score = ml_risk.get("failure_risk_score", 0)
        risk_lvl = ml_risk.get("risk_level", "LOW")
        if risk_score >= 60:
            explanations.append(f"🤖 Scikit-Learn Random Forest predicted high breakdown risk ({risk_score}% - {risk_lvl}).")

    if not explanations:
        explanations.append("Routine maintenance task with baseline priority.")

    return explanations

