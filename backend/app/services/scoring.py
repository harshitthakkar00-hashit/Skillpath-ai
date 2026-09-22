"""Deterministic scoring engine — no external API dependency."""

from typing import Dict, Any, Optional

THRESHOLDS = {"advanced": 70, "intermediate": 40, "beginner": 0}

DIAGNOSTIC_QUESTIONS = [
    {"id": 1, "type": "mcq", "topic": "Python Basics", "correct": 1, "keywords": []},
    {"id": 2, "type": "mcq", "topic": "Python Basics", "correct": 2, "keywords": []},
    {"id": 3, "type": "mcq", "topic": "Loops", "correct": 1, "keywords": []},
    {"id": 4, "type": "short_answer", "topic": "Functions", "keywords": ["returns", "value", "output", "result", "sends back", "caller"]},
    {"id": 5, "type": "scenario", "topic": "Loops", "keywords": ["for", "while", "break", "stop", "early exit", "efficient", "iteration"]},
    {"id": 6, "type": "mcq", "topic": "OOP", "correct": 2, "keywords": []},
    {"id": 7, "type": "short_answer", "topic": "OOP", "keywords": ["parent", "child", "base", "derived", "extends", "inherit", "reuse", "class"]},
    {"id": 8, "type": "practical", "topic": "Functions", "keywords": ["def", "find_max", "for", "if", "return", "largest", "greater", "loop"]},
    {"id": 9, "type": "mcq", "topic": "File Handling", "correct": 2, "keywords": []},
    {"id": 10, "type": "scenario", "topic": "File Handling", "keywords": ["with open", "readline", "iterator", "line by line", "memory", "generator", "context manager", "lazy"]},
]


def get_competency_level(score: float) -> str:
    if score >= THRESHOLDS["advanced"]:
        return "Advanced"
    if score >= THRESHOLDS["intermediate"]:
        return "Intermediate"
    return "Beginner"


def score_mcq(question: Dict, answer: Any) -> float:
    if answer is None:
        return 0.0
    try:
        return 100.0 if int(answer) == question["correct"] else 0.0
    except (ValueError, TypeError):
        return 0.0


def score_text(question: Dict, answer: str) -> float:
    if not answer or len(answer.strip()) < 5:
        return 0.0

    text = answer.lower()
    keywords = question.get("keywords", [])

    if not keywords:
        words = len(answer.strip().split())
        if words >= 30:
            return 80.0
        if words >= 15:
            return 60.0
        if words >= 8:
            return 40.0
        return 20.0

    matched = sum(1 for kw in keywords if kw.lower() in text)
    ratio = matched / len(keywords)

    if ratio >= 0.8:
        return 90.0
    if ratio >= 0.6:
        return 75.0
    if ratio >= 0.4:
        return 55.0
    if ratio >= 0.2:
        return 35.0
    if matched >= 1:
        return 20.0
    return 10.0


def score_practical(question: Dict, answer: str) -> float:
    if not answer or len(answer.strip()) < 10:
        return 0.0

    text = answer.lower()
    keywords = question.get("keywords", [])
    has_code = any(kw in text for kw in ["def ", "class ", "return ", "for ", "while "])

    matched = sum(1 for kw in keywords if kw.lower() in text)
    ratio = matched / max(len(keywords), 1)

    score = 20.0 if has_code else 0.0
    score += ratio * 80.0
    return min(round(score), 100.0)


def score_question(question: Dict, answer: Any) -> float:
    qtype = question.get("type", "mcq")
    if qtype == "mcq":
        return score_mcq(question, answer)
    if qtype == "practical":
        return score_practical(question, str(answer) if answer else "")
    return score_text(question, str(answer) if answer else "")


def calculate_scores(answers: Dict[str, Any]) -> Dict:
    topic_scores: Dict[str, list] = {}

    for q in DIAGNOSTIC_QUESTIONS:
        qid = str(q["id"])
        ans = answers.get(qid)
        score = score_question(q, ans)
        topic = q["topic"]
        topic_scores.setdefault(topic, []).append(score)

    final_topics = {
        topic: round(sum(scores) / len(scores))
        for topic, scores in topic_scores.items()
    }

    values = list(final_topics.values())
    overall = round(sum(values) / len(values)) if values else 0

    return {
        "topics": final_topics,
        "overall": overall,
        "level": get_competency_level(overall)
    }


def identify_gaps(topic_scores: Dict[str, float]):
    strong, needs_practice, gaps = [], [], []
    for topic, score in topic_scores.items():
        if score >= 70:
            strong.append({"topic": topic, "score": score})
        elif score >= 40:
            needs_practice.append({"topic": topic, "score": score})
        else:
            gaps.append({"topic": topic, "score": score})
    return {"strong": strong, "needs_practice": needs_practice, "gaps": gaps}
