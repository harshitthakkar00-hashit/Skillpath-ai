from fastapi import APIRouter

router = APIRouter()

# In-memory progress store
progress_store = {
    "assessments": [
        {"date": "2026-09-01", "overall": 45, "level": "Beginner",
         "topics": {"Python Basics": 60, "Loops": 55, "Functions": 40, "OOP": 20, "File Handling": 25}},
        {"date": "2026-09-08", "overall": 68, "level": "Intermediate",
         "topics": {"Python Basics": 90, "Loops": 82, "Functions": 62, "OOP": 35, "File Handling": 40}},
    ],
    "practice_sessions": []
}


@router.get("/progress")
def get_progress():
    history = progress_store["assessments"]
    improvement = {}
    if len(history) >= 2:
        first = history[0]["topics"]
        latest = history[-1]["topics"]
        for topic in first:
            improvement[topic] = {
                "before": first[topic],
                "after": latest.get(topic, first[topic]),
                "change": latest.get(topic, first[topic]) - first[topic]
            }
    return {
        "history": history,
        "improvement": improvement,
        "practice_sessions": progress_store["practice_sessions"]
    }
