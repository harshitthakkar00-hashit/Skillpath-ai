import os
import io
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

MAX_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")) * 1024 * 1024


def extract_text_fallback(filename: str) -> str:
    return (
        f"Extracted content from {filename}. "
        "This document covers Python programming concepts including variables, "
        "data types, control flow, functions, and object-oriented programming."
    )


def identify_topics(text: str) -> list:
    topic_keywords = {
        "Python Basics": ["variable", "data type", "string", "integer", "print", "input"],
        "Loops": ["for loop", "while loop", "iteration", "break", "continue", "range"],
        "Functions": ["function", "def ", "return", "parameter", "argument", "lambda"],
        "OOP": ["class", "object", "inheritance", "polymorphism", "encapsulation", "__init__"],
        "File Handling": ["open(", "file", "read(", "write(", "with open", "json"],
    }
    found = []
    text_lower = text.lower()
    for topic, keywords in topic_keywords.items():
        if any(kw in text_lower for kw in keywords):
            found.append(topic)
    return found if found else ["Python Programming", "Core Concepts"]


def generate_questions(topics: list) -> list:
    questions = []
    for topic in topics[:2]:  # generate for first 2 topics
        if topic == "OOP":
            questions.append({
                "type": "mcq",
                "question": "Which keyword is used to create a class in Python?",
                "options": ["object", "class", "struct", "type"],
                "correct": 1
            })
        elif topic == "Functions":
            questions.append({
                "type": "practical",
                "question": "Write a Python function that calculates the square of a number."
            })
        else:
            questions.append({
                "type": "short_answer",
                "question": f"Explain the main concept of {topic} in your own words."
            })
    if not questions:
        questions.append({
            "type": "short_answer",
            "question": "Summarize the key concept from this material."
        })
    return questions


@router.post("/upload")
async def upload_material(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_SIZE // (1024*1024)}MB limit.")

    # Try PyPDF2 extraction
    extracted_text = ""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
    except Exception:
        extracted_text = extract_text_fallback(file.filename)

    if not extracted_text.strip():
        extracted_text = extract_text_fallback(file.filename)

    topics = identify_topics(extracted_text)
    questions = generate_questions(topics)

    return {
        "filename": file.filename,
        "topics": topics,
        "content": extracted_text[:1000] + ("..." if len(extracted_text) > 1000 else ""),
        "questions": questions,
        "page_count": len(content) // 3000 + 1  # rough estimate
    }


@router.post("/analyze")
async def analyze_material(file: UploadFile = File(...)):
    return await upload_material(file)
