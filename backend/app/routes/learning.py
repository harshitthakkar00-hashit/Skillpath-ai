from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()
completed_modules = []


@router.post("/complete")
def mark_complete(req: Dict[str, Any]):
    module_id = req.get("module_id", "")
    if module_id and module_id not in completed_modules:
        completed_modules.append(module_id)
    return {"success": True, "completed": completed_modules}


@router.get("/completed")
def get_completed():
    return {"completed": completed_modules}
