from fastapi import APIRouter, HTTPException
from typing import Dict, Any

router = APIRouter()

USERS = {
    "demo@skillpath.ai": {"password": "demo123", "name": "Demo Student", "id": "demo-001"},
}


@router.post("/login")
def login(req: Dict[str, Any]):
    email = req.get("email", "")
    password = req.get("password", "")
    user = USERS.get(email)
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"success": True, "user": {"id": user["id"], "name": user["name"], "email": email}}


@router.post("/register")
def register(req: Dict[str, Any]):
    email = req.get("email", "")
    password = req.get("password", "")
    name = req.get("name") or email.split("@")[0]
    if email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    USERS[email] = {"password": password, "name": name, "id": f"user-{len(USERS)+1:03d}"}
    return {"success": True, "message": "Account created successfully"}
