from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routes import auth, assessment, skills, learning, practice, ai_chat, materials, progress, edu_admin

app = FastAPI(
    title="SkillPath AI API",
    description="AI-Powered Competency Assessment & Personalized Learning Platform",
    version="1.0.0"
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
app.include_router(skills.router, prefix="", tags=["skills"])
app.include_router(learning.router, prefix="/learning", tags=["learning"])
app.include_router(practice.router, prefix="/practice", tags=["practice"])
app.include_router(ai_chat.router, prefix="/ai", tags=["ai"])
app.include_router(materials.router, prefix="/materials", tags=["materials"])
app.include_router(progress.router, prefix="", tags=["progress"])
app.include_router(edu_admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
def root():
    return {"message": "SkillPath AI API is running", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}
