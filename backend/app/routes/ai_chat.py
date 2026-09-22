"""
AI Chat Route — Fully wired with RAG, ConversationService, and AnalyticsService.
Supports: multi-turn chat, file/PDF upload, intent detection, analytics tracking.
"""

import time
import base64
from typing import Dict, Any, Optional

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse

from app.services.gemini_service import (
    generate_ai_response,
    get_fallback_response,
    detect_intent,
    detect_student_level,
    detect_language,
)
from app.services.rag_service import rag_service
from app.services.conversation_service import conversation_service
from app.services.analytics_service import analytics_service

router = APIRouter()


# ---------------------------------------------------------------------------
# Main Chat Endpoint
# ---------------------------------------------------------------------------
@router.post("/chat")
async def chat(req: Dict[str, Any]):
    """
    Main AI chat endpoint.
    Body:
      message        str   — student's question
      context        dict  — {topic, subject, competency, language, mode, level}
      session_id     str   — conversation session ID (optional)
      history        list  — recent message history from frontend (optional)
    """
    start_time = time.time()
    message: str = req.get("message", "").strip()
    context: Dict = req.get("context", {})
    session_id: Optional[str] = req.get("session_id")
    frontend_history = req.get("history", [])

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # ---- Auto-detect fields ----
    intent = context.get("mode") or detect_intent(message)
    level = context.get("competency") or context.get("level") or detect_student_level(message, frontend_history)
    language = context.get("language") or context.get("topic") or detect_language(message, context) or "General"

    # ---- Session management ----
    if not session_id:
        session = conversation_service.create_session(
            title=message[:50],
            mode=intent,
            language=language,
            level=level,
        )
        session_id = session["id"]
    else:
        # Ensure session exists
        if not conversation_service.get_session(session_id):
            session = conversation_service.create_session(
                title=message[:50],
                mode=intent,
                language=language,
                level=level,
            )
            session_id = session["id"]

    # ---- Add user message to session ----
    conversation_service.add_message(
        session_id, "user", message,
        metadata={"mode": intent, "language": language, "level": level}
    )

    # ---- RAG retrieval ----
    rag_docs = []
    try:
        rag_docs = rag_service.search(
            query=message,
            top_k=3,
            language_filter=language if language not in ("General", "general") else None
        )
    except Exception:
        rag_docs = []

    # ---- Build conversation history for the AI ----
    session_data = conversation_service.get_session(session_id)
    messages_history = []
    if session_data:
        msgs = session_data.get("messages", [])
        # Exclude the message we just added (last one), take last 8
        history_msgs = msgs[:-1][-8:]
        messages_history = [
            {"role": m["role"], "content": m["content"]}
            for m in history_msgs
        ]

    # Also merge in any history sent from frontend
    if frontend_history and not messages_history:
        messages_history = frontend_history[-8:]

    # ---- Enrich context ----
    enriched_context = {
        **context,
        "mode": intent,
        "level": level,
        "language": language,
        "session_id": session_id,
    }

    # ---- Call AI ----
    error_type = None
    success = True
    try:
        response_text = await generate_ai_response(
            message=message,
            context=enriched_context,
            conversation_history=messages_history,
            rag_docs=rag_docs,
        )
    except Exception as exc:
        response_text = get_fallback_response(message, enriched_context, rag_docs)
        success = False
        error_type = type(exc).__name__

    # ---- Add assistant message to session ----
    conversation_service.add_message(
        session_id, "assistant", response_text,
        metadata={"mode": intent, "language": language, "level": level, "rag_used": len(rag_docs) > 0}
    )

    # ---- Analytics ----
    latency_ms = (time.time() - start_time) * 1000
    analytics_service.record_query(
        language=language,
        mode=intent,
        latency_ms=latency_ms,
        success=success,
        error_type=error_type,
    )

    return {
        "response": response_text,
        "session_id": session_id,
        "intent": intent,
        "level": level,
        "language": language,
        "rag_sources": [{"id": d.get("id"), "title": d.get("title")} for d in rag_docs],
        "status": "ok",
    }


# ---------------------------------------------------------------------------
# Session Management Endpoints
# ---------------------------------------------------------------------------
@router.get("/sessions")
async def list_sessions():
    """List all conversation sessions."""
    return {"sessions": conversation_service.list_sessions()}


@router.post("/sessions")
async def create_session(req: Dict[str, Any]):
    """Create a new conversation session."""
    session = conversation_service.create_session(
        title=req.get("title"),
        mode=req.get("mode", "tutor"),
        language=req.get("language", "Python"),
        level=req.get("level", "Intermediate"),
    )
    return session


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a specific session with its messages."""
    session = conversation_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a conversation session."""
    deleted = conversation_service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"success": True}


@router.patch("/sessions/{session_id}/rename")
async def rename_session(session_id: str, req: Dict[str, Any]):
    """Rename a session."""
    title = req.get("title", "")
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty.")
    updated = conversation_service.rename_session(session_id, title)
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found.")
    return updated


@router.post("/sessions/{session_id}/clear")
async def clear_session(session_id: str):
    """Clear messages from a session."""
    updated = conversation_service.clear_session_messages(session_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"success": True, "session_id": session_id}


@router.get("/sessions/search/{query}")
async def search_sessions(query: str):
    """Search sessions by title or content."""
    results = conversation_service.search_sessions(query)
    return {"results": results}


# ---------------------------------------------------------------------------
# File / Image Upload + Analysis
# ---------------------------------------------------------------------------
@router.post("/analyze-file")
async def analyze_file(
    file: UploadFile = File(...),
    question: str = Form(default="Summarize this file and explain the key concepts."),
    session_id: str = Form(default=""),
):
    """
    Upload a file (PDF, code file, image screenshot) and ask a question about it.
    """
    MAX_SIZE = 10 * 1024 * 1024  # 10 MB
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")

    filename = file.filename or "uploaded_file"
    file_ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    extracted_text = ""

    # ---- PDF extraction ----
    if file_ext == "pdf":
        try:
            import io
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            pages_text = []
            for page in reader.pages[:20]:  # Limit to 20 pages
                pages_text.append(page.extract_text() or "")
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            extracted_text = f"[PDF extraction failed: {e}]"

    # ---- Code / text file extraction ----
    elif file_ext in ("py", "js", "ts", "jsx", "tsx", "java", "cpp", "c", "cs",
                      "php", "rb", "go", "rs", "kt", "swift", "dart", "html",
                      "css", "sql", "sh", "bash", "txt", "md", "json", "yaml", "yml"):
        try:
            extracted_text = content.decode("utf-8", errors="replace")
        except Exception:
            extracted_text = "[Could not decode file as text]"

    # ---- Image (screenshot) — describe for analysis ----
    elif file_ext in ("png", "jpg", "jpeg", "gif", "webp", "bmp"):
        # Encode as base64, include in prompt as context
        b64 = base64.b64encode(content).decode()
        extracted_text = f"[IMAGE FILE: {filename}, base64 data available, size: {len(content)} bytes]\nThis appears to be a screenshot or image. Analyze it as an error screenshot or code screenshot."

    else:
        try:
            extracted_text = content.decode("utf-8", errors="replace")
        except Exception:
            raise HTTPException(status_code=415, detail=f"Unsupported file type: {file_ext}")

    if not extracted_text.strip():
        extracted_text = f"[No readable text extracted from {filename}]"

    # ---- Build context and call AI ----
    file_context = {
        "mode": "debugger" if "error" in question.lower() else "tutor",
        "language": detect_language(extracted_text[:500] + " " + question),
        "level": "Intermediate",
        "file_name": filename,
        "file_type": file_ext,
    }

    # Truncate extracted text for the AI prompt
    truncated = extracted_text[:4000]
    combined_message = f"""The student has uploaded a file: `{filename}`

File content:
```
{truncated}
```

Student's question: {question}

Please analyze this file content and answer the student's question."""

    start_time = time.time()
    try:
        response_text = await generate_ai_response(
            message=combined_message,
            context=file_context,
        )
    except Exception:
        response_text = get_fallback_response(combined_message, file_context)

    latency_ms = (time.time() - start_time) * 1000
    analytics_service.record_query(
        language=file_context["language"],
        mode="file-analysis",
        latency_ms=latency_ms,
        success=True,
    )

    # Save to session if provided
    if session_id and conversation_service.get_session(session_id):
        conversation_service.add_message(
            session_id, "user",
            f"📎 Uploaded file: `{filename}`\n\n**Question:** {question}",
            attachments=[{"name": filename, "type": file_ext, "size": len(content)}]
        )
        conversation_service.add_message(session_id, "assistant", response_text)

    return {
        "response": response_text,
        "filename": filename,
        "file_type": file_ext,
        "extracted_length": len(extracted_text),
        "status": "ok",
    }


# ---------------------------------------------------------------------------
# Suggested Prompts
# ---------------------------------------------------------------------------
@router.get("/suggested-prompts")
async def get_suggested_prompts():
    """Return categorized suggested prompts for the UI."""
    return {
        "prompts": [
            {"category": "Explain", "icon": "📘", "prompts": [
                "What is inheritance in Java?",
                "Explain how recursion works with examples",
                "What is Big O notation?",
                "Explain the difference between Stack and Queue",
                "What is a REST API?",
                "Explain SQL JOINS with examples",
            ]},
            {"category": "Debug", "icon": "🐛", "prompts": [
                "Why am I getting NullPointerException in Java?",
                "Fix this Python IndexError",
                "Why does my JavaScript code return undefined?",
                "Explain this SQL syntax error",
                "My React component is not re-rendering, why?",
                "Fix this segmentation fault in C++",
            ]},
            {"category": "Code", "icon": "💻", "prompts": [
                "Write a binary search in Python",
                "Create a linked list implementation in Java",
                "Build a REST API with FastAPI",
                "Write a React component with hooks",
                "Create a database schema for a school system",
                "Implement quicksort in C++",
            ]},
            {"category": "Project", "icon": "🏗️", "prompts": [
                "Create a Student Management System using Spring Boot",
                "Build a full-stack Todo app with React and Node.js",
                "Create a Chat application using WebSockets",
                "Build a REST API with authentication using FastAPI",
                "Create a machine learning project for image classification",
            ]},
            {"category": "Learn", "icon": "🗺️", "prompts": [
                "How can I learn Python from scratch?",
                "Give me a JavaScript learning roadmap",
                "What should I learn to become a backend developer?",
                "How do I start learning machine learning?",
                "What is the roadmap for React development?",
            ]},
            {"category": "Practice", "icon": "🎯", "prompts": [
                "Give me 5 Python MCQ questions",
                "Ask me Java OOP interview questions",
                "Give me DSA coding challenges",
                "Test me on SQL with 3 questions",
                "Give me a debugging exercise in JavaScript",
            ]},
        ]
    }
