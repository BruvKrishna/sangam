from app.models.task import Task
from typing import Dict, Any, Optional, Tuple
from app.priority_engine.ml_model import ml_risk_model

DEFAULT_WEIGHTS = {
    "criticality": 0.30,
    "urgency": 0.25,
    "overdue_score": 0.20,
    "asset_impact": 0.15,
    "safety_relevance": 0.10,
}

def calculate_priority(task: Task, custom_weights: Optional[Dict[str, float]] = None) -> Tuple[float, Dict[str, float], Dict[str, Any]]:
    weights = dict(DEFAULT_WEIGHTS)
    if custom_weights:
        for k, v in custom_weights.items():
            if k in weights:
                weights[k] = float(v)

    c_score = weights["criticality"] * task.criticality
    u_score = weights["urgency"] * task.urgency
    o_score = weights["overdue_score"] * task.overdue_score
    a_score = weights["asset_impact"] * task.asset_impact
    s_score = weights["safety_relevance"] * task.safety_relevance

    total = c_score + u_score + o_score + a_score + s_score

    breakdown = {
        "criticality": round(c_score, 2),
        "urgency": round(u_score, 2),
        "overdue_score": round(o_score, 2),
        "asset_impact": round(a_score, 2),
        "safety_relevance": round(s_score, 2),
    }

    # Predict ML Failure Risk using Random Forest
    ml_risk = ml_risk_model.predict_risk(
        task.criticality,
        task.urgency,
        task.overdue_score,
        task.asset_impact,
        task.safety_relevance,
    )

    return round(total, 2), breakdown, ml_risk

