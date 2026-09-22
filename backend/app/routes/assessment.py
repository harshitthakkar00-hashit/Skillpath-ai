from fastapi import APIRouter
from typing import Dict, Any
from app.services.scoring import calculate_scores, identify_gaps
from app.services.gemini_service import analyze_skill_gaps

router = APIRouter()


@router.post("/start")
def start_assessment():
    return {"status": "started", "duration_seconds": 180, "total_questions": 10}


@router.post("/submit")
async def submit_assessment(req: Dict[str, Any]):
    answers = req.get("answers", {})
    subject = req.get("subject", "Python Programming")
    result = calculate_scores(answers)
    gaps = identify_gaps(result["topics"])
    return {"success": True, "scores": result, "skill_gaps": gaps, "subject": subject}


@router.post("/analyze")
async def analyze_assessment(req: Dict[str, Any]):
    topic_scores = req.get("topic_scores", {})
    analysis = await analyze_skill_gaps(topic_scores)
    gaps = identify_gaps(topic_scores)
    return {"analysis": analysis, "skill_gaps": gaps, "topic_scores": topic_scores}
