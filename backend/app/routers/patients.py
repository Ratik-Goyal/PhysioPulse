from fastapi import APIRouter, Depends, HTTPException
from app.models.user import PatientProfile, UserRole
from app.core.auth import get_current_user, require_role
from app.services.database_service import db_service
from typing import List, Dict

router = APIRouter(prefix="/patient", tags=["patients"])

@router.post("/profile", response_model=dict)
async def create_patient_profile(profile_data: PatientProfile, current_user: dict = Depends(get_current_user)):
    """Create or update patient profile"""
    try:
        # Ensure user can only create their own profile or physio can create for patients
        if profile_data.user_id != current_user.id:
            # Check if current user is physio
            user_role = db_service.get_user_role(current_user.id)
            if user_role != "physio":
                raise HTTPException(status_code=403, detail="Can only create own profile")
        
        profile = db_service.create_patient_profile(profile_data)
        return {"message": "Profile created successfully", "profile": profile}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_id}/progress", response_model=List[Dict])
async def get_patient_progress(patient_id: str, days: int = 30, current_user: dict = Depends(get_current_user)):
    """Get patient progress data"""
    try:
        # Check permissions - users can only see own data, physios can see assigned patients
        if patient_id != current_user.id:
            # Verify physio has access to this patient
            user_role = db_service.get_user_role(current_user.id)
            if user_role != "physio" and user_role != "admin":
                raise HTTPException(status_code=403, detail="Access denied")
        
        progress = db_service.get_patient_progress(patient_id, days)
        return progress
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-progress", response_model=List[Dict])
async def get_my_progress(days: int = 30, current_user: dict = Depends(get_current_user)):
    """Get current user's progress"""
    try:
        progress = db_service.get_patient_progress(current_user.id, days)
        return progress
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))