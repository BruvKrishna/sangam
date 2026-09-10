from fastapi import APIRouter, HTTPException
from app.schemas.requests import PriorityRequest
from app.data.data_store import store
from app.priority_engine.scorer import calculate_priority
from app.priority_engine.explainer import generate_explanation

router = APIRouter()


@router.post("/priority/calculate")
def calculate_task_priority(req: PriorityRequest):
    task = store.tasks.get(req.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    score, breakdown = calculate_priority(task)
    explanation = generate_explanation(task, breakdown)

    return {
        "task_id": task.id,
        "task_name": task.name,
        "score": round(score, 2),
        "breakdown": breakdown,
        "raw_scores": {
            "criticality": task.criticality,
            "urgency": task.urgency,
            "overdue_score": task.overdue_score,
            "asset_impact": task.asset_impact,
            "safety_relevance": task.safety_relevance,
        },
        "weights": {
            "criticality": 0.30,
            "urgency": 0.25,
            "overdue_score": 0.20,
            "asset_impact": 0.15,
            "safety_relevance": 0.10,
        },
        "explanation": explanation,
    }


@router.get("/priority/formula")
def get_formula():
    return {
        "formula": "Priority Score = 0.30 × Criticality + 0.25 × Urgency + 0.20 × Overdue + 0.15 × Asset Impact + 0.10 × Safety Relevance",
        "weights": [
            {"factor": "Criticality", "weight": 0.30, "description": "How critical the asset/task is for train operations"},
            {"factor": "Urgency", "weight": 0.25, "description": "How urgently the maintenance must be performed"},
            {"factor": "Overdue", "weight": 0.20, "description": "How overdue the maintenance activity is"},
            {"factor": "Asset Impact", "weight": 0.15, "description": "Impact on the associated asset if not maintained"},
            {"factor": "Safety Relevance", "weight": 0.10, "description": "Relevance to safety-critical operations"},
        ],
        "note": "These are illustrative prototype weights and do not represent official Indian Railways policy.",
        "scale": "All components normalized to 0-100 scale",
    }
