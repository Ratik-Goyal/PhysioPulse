from fastapi import APIRouter, Depends, HTTPException
from app.models.session import SessionCreate, SessionResponse, FrameData, SessionSummary
from app.core.auth import get_current_user
from app.services.database_service import db_service
from app.services.gemini_service import gemini_service
from typing import Dict

router = APIRouter(prefix="/session", tags=["sessions"])

@router.post("/start", response_model=SessionResponse)
async def start_session(session_data: SessionCreate, current_user: dict = Depends(get_current_user)):
    """Start new exercise session"""
    try:
        session = db_service.create_session(current_user.id, session_data)
        if not session:
            raise HTTPException(status_code=400, detail="Failed to create session")
        
        return SessionResponse(**session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/frame")
async def submit_frame(session_id: str, frame_data: FrameData, current_user: dict = Depends(get_current_user)):
    """Submit frame data and get AI feedback"""
    try:
        # Save frame data
        frame = db_service.save_frame_data(session_id, frame_data)
        if not frame:
            raise HTTPException(status_code=400, detail="Failed to save frame data")
        
        # Get session history for context
        session_summary = db_service.get_session_summary(session_id, current_user.id)
        if not session_summary:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Generate AI feedback
        exercise_type = session_summary["session"]["exercise_type"]
        feedback = gemini_service.generate_exercise_feedback(
            exercise_type, frame_data, session_summary["frames"]
        )
        
        # Save feedback
        db_service.save_feedback(session_id, feedback)
        
        return {
            "frame_saved": True,
            "feedback": feedback,
            "rep_count": frame_data.rep_count,
            "stage": frame_data.stage
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{session_id}/summary", response_model=dict)
async def get_session_summary(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get complete session summary"""
    try:
        summary = db_service.get_session_summary(session_id, current_user.id)
        if not summary:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Calculate metrics
        frames = summary["frames"]
        total_reps = max([f["rep_count"] for f in frames]) if frames else 0
        
        return {
            "session_id": session_id,
            "exercise_type": summary["session"]["exercise_type"],
            "total_reps": total_reps,
            "total_frames": len(frames),
            "feedback_count": len(summary["feedback"]),
            "latest_feedback": summary["feedback"][-3:] if summary["feedback"] else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))