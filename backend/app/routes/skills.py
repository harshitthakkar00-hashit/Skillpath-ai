from fastapi import APIRouter
from app.services.scoring import identify_gaps

router = APIRouter()

DEMO_SCORES = {
    "Python Basics": 90,
    "Loops": 82,
    "Functions": 62,
    "OOP": 35,
    "File Handling": 40,
}

LEARNING_PATH_TEMPLATES = {
    "OOP": [
        {"id": "oop-1", "title": "OOP Basics & Concepts", "type": "theory", "duration": "10 min"},
        {"id": "oop-2", "title": "Classes & Objects", "type": "theory", "duration": "15 min"},
        {"id": "oop-3", "title": "Inheritance in Depth", "type": "theory", "duration": "15 min"},
        {"id": "oop-4", "title": "Polymorphism", "type": "theory", "duration": "10 min"},
        {"id": "oop-5", "title": "Practice Challenge", "type": "practice", "duration": "20 min"},
        {"id": "oop-6", "title": "Re-assessment", "type": "reassessment", "duration": "10 min"},
    ],
    "File Handling": [
        {"id": "fh-1", "title": "File Modes & Basics", "type": "theory", "duration": "10 min"},
        {"id": "fh-2", "title": "Reading Files Efficiently", "type": "theory", "duration": "15 min"},
        {"id": "fh-3", "title": "Writing & Appending", "type": "theory", "duration": "10 min"},
        {"id": "fh-4", "title": "JSON & Structured Data", "type": "theory", "duration": "15 min"},
        {"id": "fh-5", "title": "Practice Challenge", "type": "practice", "duration": "20 min"},
        {"id": "fh-6", "title": "Re-assessment", "type": "reassessment", "duration": "10 min"},
    ],
    "Functions": [
        {"id": "fn-1", "title": "Function Basics", "type": "theory", "duration": "10 min"},
        {"id": "fn-2", "title": "Parameters & Return Values", "type": "theory", "duration": "15 min"},
        {"id": "fn-3", "title": "Lambda & Higher-Order", "type": "theory", "duration": "15 min"},
        {"id": "fn-4", "title": "Practice Challenge", "type": "practice", "duration": "20 min"},
    ],
}


@router.get("/skills")
def get_skills():
    return {"topics": DEMO_SCORES, "overall": 68, "level": "Intermediate"}


@router.get("/skill-gaps")
def get_skill_gaps():
    return identify_gaps(DEMO_SCORES)


@router.get("/learning-path")
def get_learning_path():
    gaps = identify_gaps(DEMO_SCORES)
    priority_topics = [g["topic"] for g in gaps["gaps"]] + [g["topic"] for g in gaps["needs_practice"]]
    path = []
    for topic in priority_topics:
        if topic in LEARNING_PATH_TEMPLATES:
            path.append({
                "topic": topic,
                "current_score": DEMO_SCORES.get(topic, 0),
                "steps": LEARNING_PATH_TEMPLATES[topic]
            })
    return {"learning_path": path, "skipped": [t["topic"] for t in gaps["strong"]]}
