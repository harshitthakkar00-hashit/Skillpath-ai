"""Conversation memory and session management service.

Maintains multi-turn context, conversation history, session search,
and active language/competency tracking.
"""

import time
import uuid
from typing import List, Dict, Any, Optional

class ConversationService:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        # Pre-seed a default session
        default_id = "session-default"
        self.sessions[default_id] = {
            "id": default_id,
            "title": "Welcome & Getting Started",
            "mode": "tutor",
            "language": "Python",
            "level": "Intermediate",
            "created_at": int(time.time()),
            "updated_at": int(time.time()),
            "messages": [
                {
                    "id": "msg-1",
                    "role": "assistant",
                    "content": "👋 **Hello! I am your AI Computer Science & Programming Tutor.**\n\nI can help you across **50+ programming languages**, frameworks, databases, system design, and AI/ML topics.\n\n### How I can help you:\n- 🎓 **Tutor Mode**: Concept explanations with real-world analogies, syntax, runnable code, and practice exercises.\n- 🐛 **Debugger Mode**: Diagnose stack traces, explain root causes, provide exact fixes, and show prevention steps.\n- 🔄 **Code Converter**: Convert code between languages while keeping it idiomatic.\n- 🏗️ **Project Architect**: Step-by-step full-stack and backend project blueprints.\n- 🗺️ **Roadmap Builder**: Adaptive learning paths tailored to your level.\n- 🎯 **Practice & Quiz**: MCQs, coding tasks, and automated grading.\n- 💼 **Interview Prep**: Technical interview simulations with constructive feedback.\n\nSelect a mode or ask a question to start!",
                    "ts": int(time.time() * 1000),
                    "metadata": {"mode": "tutor", "level": "Intermediate"}
                }
            ]
        }

    def list_sessions(self) -> List[Dict[str, Any]]:
        """Return list of session summaries sorted by most recently updated."""
        summaries = []
        for s in self.sessions.values():
            summaries.append({
                "id": s["id"],
                "title": s["title"],
                "mode": s.get("mode", "tutor"),
                "language": s.get("language", "Python"),
                "level": s.get("level", "Intermediate"),
                "created_at": s.get("created_at"),
                "updated_at": s.get("updated_at"),
                "message_count": len(s.get("messages", []))
            })
        summaries.sort(key=lambda x: x["updated_at"], reverse=True)
        return summaries

    def create_session(self, title: Optional[str] = None, mode: str = "tutor", language: str = "Python", level: str = "Intermediate") -> Dict[str, Any]:
        """Create a new conversation session."""
        session_id = f"session-{uuid.uuid4().hex[:8]}"
        initial_title = title or f"{mode.title()} in {language}"
        new_session = {
            "id": session_id,
            "title": initial_title,
            "mode": mode,
            "language": language,
            "level": level,
            "created_at": int(time.time()),
            "updated_at": int(time.time()),
            "messages": [
                {
                    "id": f"msg-{uuid.uuid4().hex[:6]}",
                    "role": "assistant",
                    "content": f"Ready to assist with **{language}** in **{mode.replace('-', ' ').title()}** mode. How can I help you?",
                    "ts": int(time.time() * 1000),
                    "metadata": {"mode": mode, "level": level, "language": language}
                }
            ]
        }
        self.sessions[session_id] = new_session
        return new_session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get complete session with messages."""
        return self.sessions.get(session_id)

    def add_message(self, session_id: str, role: str, content: str, attachments: Optional[List[Dict[str, Any]]] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Append a message to the specified session."""
        if session_id not in self.sessions:
            self.create_session(title="New Chat")
            session_id = "session-default" if "session-default" in self.sessions else list(self.sessions.keys())[0]

        session = self.sessions[session_id]
        msg = {
            "id": f"msg-{uuid.uuid4().hex[:6]}",
            "role": role,
            "content": content,
            "attachments": attachments or [],
            "metadata": metadata or {},
            "ts": int(time.time() * 1000)
        }
        session["messages"].append(msg)
        session["updated_at"] = int(time.time())

        # Auto-update session title from first user question if generic
        if role == "user" and len(session["messages"]) <= 3:
            first_words = " ".join(content.split()[:5])
            if len(first_words) > 30:
                first_words = first_words[:30] + "..."
            if first_words and not first_words.startswith("http"):
                session["title"] = first_words

        # Update session language/mode if specified in metadata
        if metadata:
            if metadata.get("language"):
                session["language"] = metadata["language"]
            if metadata.get("mode"):
                session["mode"] = metadata["mode"]
            if metadata.get("level"):
                session["level"] = metadata["level"]

        return msg

    def delete_session(self, session_id: str) -> bool:
        """Delete a conversation session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def rename_session(self, session_id: str, new_title: str) -> Optional[Dict[str, Any]]:
        """Rename a session."""
        if session_id in self.sessions:
            self.sessions[session_id]["title"] = new_title
            self.sessions[session_id]["updated_at"] = int(time.time())
            return self.sessions[session_id]
        return None

    def clear_session_messages(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Clear all messages from a session while keeping metadata."""
        if session_id in self.sessions:
            self.sessions[session_id]["messages"] = []
            self.sessions[session_id]["updated_at"] = int(time.time())
            return self.sessions[session_id]
        return None

    def search_sessions(self, query: str) -> List[Dict[str, Any]]:
        """Search across sessions for matching titles or message contents."""
        q_lower = query.lower()
        results = []
        for s in self.sessions.values():
            title_match = q_lower in s["title"].lower()
            matching_msgs = [m for m in s["messages"] if q_lower in m["content"].lower()]
            if title_match or matching_msgs:
                results.append({
                    "id": s["id"],
                    "title": s["title"],
                    "match_count": len(matching_msgs) + (1 if title_match else 0),
                    "updated_at": s["updated_at"]
                })
        results.sort(key=lambda x: x["updated_at"], reverse=True)
        return results


# Global singleton
conversation_service = ConversationService()
