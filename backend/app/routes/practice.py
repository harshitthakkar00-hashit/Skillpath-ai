from fastapi import APIRouter
from typing import Dict, Any
from app.services.scoring import score_question

router = APIRouter()

PRACTICE_QUESTIONS = {
    "OOP": [
        {"id": "p1", "type": "mcq", "correct": 1, "keywords": [],
         "explanation": "__init__ is the constructor, called when an object is created."},
        {"id": "p2", "type": "scenario", "keywords": ["inherit", "Vehicle", "Car", "override"],
         "explanation": "Use inheritance — Car and Motorcycle inherit from Vehicle."},
        {"id": "p3", "type": "practical", "keywords": ["class Circle", "def area", "self.radius", "3.14"],
         "explanation": "class Circle:\\n  def area(self): return 3.14 * self.radius**2"},
    ],
    "File Handling": [
        {"id": "p4", "type": "mcq", "correct": 2, "keywords": [],
         "explanation": "'w' mode clears and overwrites existing content."},
        {"id": "p5", "type": "practical", "keywords": ["open", "for line", "lower", "append", "return"],
         "explanation": "Use with open, loop lines, .lower() for case-insensitive match."},
    ],
    "Functions": [
        {"id": "p6", "type": "mcq", "correct": 1, "keywords": [],
         "explanation": "Lambda with (3,4) returns 7."},
        {"id": "p7", "type": "practical", "keywords": ["def factorial", "if n", "return 1", "return n", "factorial(n-1)"],
         "explanation": "def factorial(n): return 1 if n<=1 else n * factorial(n-1)"},
    ]
}


@router.post("/submit")
def submit_practice(req: Dict[str, Any]):
    topic = req.get("topic", "")
    question_id = req.get("question_id", "")
    answer = req.get("answer")
    questions = PRACTICE_QUESTIONS.get(topic, [])
    q = next((x for x in questions if x["id"] == question_id), None)
    if not q:
        return {"score": 0, "feedback": "Question not found", "explanation": ""}
    s = score_question(q, answer)
    feedback = "Correct!" if s >= 80 else "Partially correct" if s >= 50 else "Needs improvement"
    return {
        "score": s, "feedback": feedback,
        "explanation": q.get("explanation", ""),
        "recommendation": f"Review the {topic} learning module." if s < 70 else "Great work!"
    }
