"""
Admin Panel Routes — Knowledge base management, analytics, system config.
Protected with a simple admin token via environment variable.
"""

import os
from typing import Dict, Any, List, Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.rag_service import rag_service
from app.services.analytics_service import analytics_service
from app.services.conversation_service import conversation_service

router = APIRouter()
security = HTTPBearer(auto_error=False)

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "skillpath-admin-2024")


def verify_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Simple token-based admin auth."""
    if not credentials or credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing admin token. Set Authorization: Bearer <ADMIN_TOKEN>."
        )
    return True


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------
@router.get("/analytics")
async def get_analytics(_: bool = Depends(verify_admin)):
    """Get platform usage analytics."""
    return analytics_service.get_stats()


@router.get("/analytics/public")
async def get_public_analytics():
    """Public analytics summary (no auth required) — aggregate stats only."""
    stats = analytics_service.get_stats()
    return {
        "total_queries": stats["total_queries"],
        "success_rate": stats["success_rate"],
        "top_languages": stats["top_languages"][:5],
        "mode_distribution": stats["mode_distribution"],
    }


# ---------------------------------------------------------------------------
# Knowledge Base Management
# ---------------------------------------------------------------------------
@router.get("/knowledge-base")
async def list_documents(_: bool = Depends(verify_admin)):
    """List all knowledge base documents."""
    docs = rag_service.documents
    return {
        "total": len(docs),
        "documents": [
            {
                "id": d.get("id"),
                "title": d.get("title"),
                "category": d.get("category"),
                "language": d.get("language"),
                "difficulty": d.get("difficulty"),
                "tags": d.get("tags", []),
                "summary": d.get("summary", "")[:150],
            }
            for d in docs
        ]
    }


@router.get("/knowledge-base/{doc_id}")
async def get_document(doc_id: str, _: bool = Depends(verify_admin)):
    """Get a specific document by ID."""
    doc = next((d for d in rag_service.documents if d.get("id") == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


@router.post("/knowledge-base")
async def add_document(doc: Dict[str, Any], _: bool = Depends(verify_admin)):
    """Add a new document to the knowledge base."""
    required = ["title", "content"]
    for field in required:
        if not doc.get(field):
            raise HTTPException(status_code=400, detail=f"Field '{field}' is required.")
    
    # Set defaults
    doc.setdefault("category", "General CS")
    doc.setdefault("language", "General")
    doc.setdefault("difficulty", "Intermediate")
    doc.setdefault("tags", [])
    doc.setdefault("summary", doc["content"][:200])
    
    new_doc = rag_service.add_document(doc)
    return {"success": True, "document": new_doc}


@router.put("/knowledge-base/{doc_id}")
async def update_document(doc_id: str, doc: Dict[str, Any], _: bool = Depends(verify_admin)):
    """Update an existing document."""
    existing = next((d for d in rag_service.documents if d.get("id") == doc_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    doc["id"] = doc_id
    updated = rag_service.add_document(doc)  # upsert by ID
    return {"success": True, "document": updated}


@router.delete("/knowledge-base/{doc_id}")
async def delete_document(doc_id: str, _: bool = Depends(verify_admin)):
    """Delete a document from the knowledge base."""
    deleted = rag_service.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"success": True, "deleted_id": doc_id}


@router.get("/knowledge-base/search/{query}")
async def search_knowledge_base(query: str, language: Optional[str] = None, _: bool = Depends(verify_admin)):
    """Search the knowledge base."""
    results = rag_service.search(query, top_k=10, language_filter=language)
    return {"results": results, "count": len(results)}


@router.get("/knowledge-base/export/finetuning")
async def export_finetuning_dataset(_: bool = Depends(verify_admin)):
    """Export knowledge base as fine-tuning dataset."""
    dataset = rag_service.export_finetuning_dataset()
    return {"dataset": dataset, "total": len(dataset)}


# ---------------------------------------------------------------------------
# Session / Conversation Management (metadata only)
# ---------------------------------------------------------------------------
@router.get("/conversations")
async def list_conversations(_: bool = Depends(verify_admin)):
    """List all conversation session metadata (no message content)."""
    sessions = conversation_service.list_sessions()
    return {
        "total": len(sessions),
        "sessions": sessions  # Already excludes message content
    }


@router.delete("/conversations/{session_id}")
async def delete_conversation(session_id: str, _: bool = Depends(verify_admin)):
    """Delete a specific conversation."""
    deleted = conversation_service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"success": True}


# ---------------------------------------------------------------------------
# System Configuration
# ---------------------------------------------------------------------------
@router.get("/system/config")
async def get_system_config(_: bool = Depends(verify_admin)):
    """Get current system configuration (non-sensitive)."""
    import os
    has_api_key = bool(os.getenv("GEMINI_API_KEY")) and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here"
    return {
        "ai_provider": "Google Gemini Pro",
        "ai_available": has_api_key,
        "rag_enabled": True,
        "conversation_memory": True,
        "analytics_enabled": True,
        "max_upload_mb": int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")),
        "allowed_origins": os.getenv("ALLOWED_ORIGINS", "http://localhost:5173"),
        "knowledge_base_size": len(rag_service.documents),
        "active_sessions": len(conversation_service.sessions),
        "supported_languages": [
            "Python", "Java", "JavaScript", "TypeScript", "C++", "C", "C#",
            "Go", "Rust", "Ruby", "PHP", "Kotlin", "Swift", "Dart", "Flutter",
            "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express.js",
            "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", ".NET",
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes",
            "TensorFlow", "PyTorch", "Scikit-learn", "HTML/CSS", "Bash", "PowerShell",
            "R", "Scala", "Lua", "Perl", "Shell"
        ],
        "supported_categories": [
            "Language Fundamentals", "OOP", "Data Structures & Algorithms",
            "Web Development", "Mobile Development", "Backend", "Databases",
            "AI & Machine Learning", "DevOps & Cloud", "Computer Science Subjects",
            "Errors", "System Design", "Security"
        ]
    }


@router.get("/system/health")
async def system_health():
    """Detailed health check."""
    import os
    has_api_key = bool(os.getenv("GEMINI_API_KEY")) and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here"
    return {
        "status": "healthy",
        "services": {
            "api": "ok",
            "rag": "ok" if rag_service.documents else "empty",
            "conversation": "ok",
            "analytics": "ok",
            "ai_provider": "connected" if has_api_key else "fallback_mode",
        },
        "stats": {
            "knowledge_docs": len(rag_service.documents),
            "active_sessions": len(conversation_service.sessions),
            "total_queries": analytics_service.total_queries,
        }
    }
