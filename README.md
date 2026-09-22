# SkillPath AI — Educational Platform with AI CS Tutor

A full-stack educational platform with an AI-powered Computer Science & Programming tutor supporting 50+ languages, RAG-based knowledge retrieval, conversation memory, file/image analysis, an admin panel, and usage analytics.

---

## Quick Start

### 1. Backend
```bash
cd skillpath-ai/backend
pip install -r requirements.txt

# Create .env (copy from .env.example)
# Set your GEMINI_API_KEY

uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd skillpath-ai/frontend
npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Login
- Email: `demo@skillpath.ai`
- Password: `demo123`

---

## Environment Variables

```env
# skillpath-ai/backend/.env
GEMINI_API_KEY=your_gemini_api_key_here     # Get free key at makersuite.google.com
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:5173
MAX_UPLOAD_SIZE_MB=10
ADMIN_TOKEN=skillpath-admin-2024            # Change this for production!
```

> Get a free Gemini API key at https://makersuite.google.com/app/apikey
> Without a key, the AI runs in **fallback mode** with local responses.

---

## Features

### AI Tutor (`/ai-tutor`)
- **7 modes**: Tutor, Debugger, Project Architect, Code Converter, Roadmap, Practice, Interview Prep
- **50+ languages**: Python, Java, JavaScript, TypeScript, C++, Go, Rust, Dart/Flutter, SQL, React, Spring Boot, Django, FastAPI, etc.
- **Markdown rendering** with syntax-highlighted code blocks
- **Copy & download** buttons on every code block
- **File/image upload**: Analyze PDFs, code files, error screenshots
- **Conversation history**: Sessions saved, searchable, resumable
- **Suggested prompts** by category
- **RAG retrieval**: Knowledge base articles surface relevant context
- **Student-level detection**: Auto-detects Beginner / Intermediate / Advanced
- **Intent detection**: Auto-switches mode based on question type

### Admin Panel (`/admin`)
- **Analytics dashboard**: Query count, success rate, latency, top languages, mode distribution
- **Knowledge Base CRUD**: Add, edit, delete, search RAG documents
- **Conversation management**: View and delete session metadata
- **System config**: AI status, supported languages, categories

### RAG Knowledge Base
- TF-IDF vector search over curated CS/programming documents
- 30+ pre-loaded documents covering: Java, Python, JS, React, SQL, DSA, AI/ML, System Design, OS, Docker, etc.
- Documents persist in `backend/app/data/knowledge_base.json`
- Admin panel lets you add new documents without code changes

### Conversation Memory
- Multi-turn memory within each session
- Sessions survive page refreshes (stored on backend, in-memory)
- Auto-titles sessions from first message

---

## Architecture

```
React (Vite) Frontend
  ├── /ai-tutor          — Full AI chat UI
  ├── /admin             — Admin panel
  └── /api (proxy)       → FastAPI Backend :8000
         ├── POST /ai/chat            — Main chat (RAG + ConversationService + Analytics)
         ├── POST /ai/analyze-file    — File/image analysis
         ├── GET  /ai/sessions        — Session list
         ├── POST /ai/sessions        — Create session
         ├── GET  /ai/sessions/:id    — Load session
         ├── DELETE /ai/sessions/:id  — Delete session
         ├── GET  /ai/suggested-prompts
         ├── GET  /admin/analytics    — Usage stats (requires token)
         ├── GET  /admin/knowledge-base — List KB docs
         ├── POST /admin/knowledge-base — Add KB doc
         ├── PUT  /admin/knowledge-base/:id — Update
         ├── DELETE /admin/knowledge-base/:id — Delete
         └── GET  /admin/system/config

Services:
  ├── gemini_service.py   — LLM calls + 30+ fallback responses + intent/level detection
  ├── rag_service.py      — TF-IDF vector search over knowledge_base.json
  ├── conversation_service.py — Session management + message history
  └── analytics_service.py   — Query tracking + stats
```

---

## API Reference

### Chat
```http
POST /ai/chat
Content-Type: application/json

{
  "message": "What is inheritance in Java?",
  "context": {
    "mode": "tutor",
    "language": "Java",
    "level": "Beginner"
  },
  "session_id": "session-abc123",  // optional
  "history": []                    // optional
}

Response:
{
  "response": "## Inheritance in Java\n...",
  "session_id": "session-abc123",
  "intent": "tutor",
  "level": "Beginner",
  "language": "Java",
  "rag_sources": [{"id": "...", "title": "..."}],
  "status": "ok"
}
```

### File Upload
```http
POST /ai/analyze-file
Content-Type: multipart/form-data

file: <file>
question: "Explain the main concepts in this file"
session_id: "session-abc123"  // optional
```

### Admin (requires Authorization header)
```http
GET /admin/analytics
Authorization: Bearer skillpath-admin-2024
```

---

## Adding New Knowledge Base Documents

### Via Admin Panel (recommended)
1. Go to `/admin` → Knowledge Base tab
2. Click **+ Add Document**
3. Fill title, category, language, content (Markdown), code example
4. Save — immediately searchable

### Via API
```http
POST /admin/knowledge-base
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "title": "Python Generators",
  "category": "Language Fundamentals",
  "language": "Python",
  "difficulty": "Intermediate",
  "tags": ["python", "generators", "yield"],
  "summary": "Generators are lazy iterators...",
  "content": "## Python Generators\n...",
  "code_example": "def count_up(n):\n    for i in range(n):\n        yield i",
  "practice_question": "Write a generator that yields Fibonacci numbers."
}
```

---

## Supported Technologies

| Category | Technologies |
|----------|-------------|
| **Languages** | Python, Java, JavaScript, TypeScript, C, C++, C#, Go, Rust, Ruby, PHP, Kotlin, Swift, Dart, Scala, R, Lua, Perl |
| **Web** | HTML/CSS, React, Angular, Vue, Next.js, Node.js, Express.js, Svelte |
| **Mobile** | Flutter/Dart, Kotlin, Swift/SwiftUI, React Native |
| **Backend** | Spring Boot, Django, Flask, FastAPI, Laravel, ASP.NET, Rails, NestJS |
| **Databases** | MySQL, PostgreSQL, SQLite, MongoDB, Redis, Firebase, Oracle, MSSQL |
| **AI/ML** | TensorFlow, PyTorch, Scikit-learn, Keras, HuggingFace, LangChain, OpenCV |
| **DevOps** | Docker, Kubernetes, GitHub Actions, CI/CD, AWS, GCP, Azure |
| **CS Subjects** | DSA, OS, Computer Networks, DBMS, OOP, System Design, Cybersecurity, Compiler Design |

---

## Extending the System

### Change AI Model
Edit `backend/app/services/gemini_service.py`:
```python
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
# Change to gemini-1.5-pro, gemini-1.5-flash, etc.
```

### Add More Languages
The system auto-detects any language mentioned in messages. For better RAG coverage, add documents to the knowledge base.

### Add Persistent Storage
Currently all data is in-memory (resets on server restart). To persist:
1. Add `SQLite` or `PostgreSQL` with SQLAlchemy
2. Replace dict-based stores in `conversation_service.py` and `analytics_service.py` with DB models

---

## Security Notes

- `ADMIN_TOKEN` in `.env` controls admin panel access — change default for production
- Gemini API key is never exposed to the frontend
- File uploads are validated by extension and size (10MB default)
- Parameterized inputs throughout — no dynamic query construction
- CORS configured via `ALLOWED_ORIGINS` env var

---

## Project Structure

```
skillpath-ai/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   └── knowledge_base.json      # RAG knowledge base (30+ documents)
│   │   ├── routes/
│   │   │   ├── ai_chat.py               # AI chat + sessions + file upload
│   │   │   ├── edu_admin.py             # Admin panel routes
│   │   │   ├── auth.py
│   │   │   ├── assessment.py
│   │   │   ├── materials.py
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── gemini_service.py        # LLM + CS tutor system prompt + fallbacks
│   │   │   ├── rag_service.py           # TF-IDF vector search
│   │   │   ├── conversation_service.py  # Session + message management
│   │   │   └── analytics_service.py    # Usage tracking
│   │   └── main.py
│   ├── .env
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AITutor.jsx              # Full-featured AI chat UI
    │   │   ├── AdminPanel.jsx           # Admin dashboard
    │   │   ├── AIAssistant.jsx          # Original simple chat
    │   │   └── ...
    │   ├── components/
    │   │   └── Layout.jsx               # Nav + layout shell
    │   ├── services/
    │   │   └── api.js                   # All backend API calls
    │   └── context/
    │       └── AppContext.jsx           # Global state
    ├── vite.config.js
    └── package.json
```
