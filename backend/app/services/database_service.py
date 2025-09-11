from app.core.database import supabase, supabase_admin
from app.models.user import UserSignup, PatientProfile
from app.models.session import SessionCreate, FrameData, ExerciseType
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid

class DatabaseService:
    
    def create_user_profile(self, user_id: str, signup_data: UserSignup) -> Dict:
        """Create user profile in database"""
        user_data = {
            "id": user_id,
            "email": signup_data.email,
            "role": signup_data.role.value,
            "full_name": signup_data.full_name,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("users").insert(user_data).execute()
        return result.data[0] if result.data else None
    
    def get_user_role(self, user_id: str) -> Optional[str]:
        """Get user role from database"""
        result = supabase.table("users").select("role").eq("id", user_id).execute()
        return result.data[0]["role"] if result.data else None
    
    def create_patient_profile(self, patient_data: PatientProfile) -> Dict:
        """Create patient-specific profile"""
        result = supabase.table("patients").insert(patient_data.dict()).execute()
        return result.data[0] if result.data else None
    
    def create_session(self, user_id: str, session_data: SessionCreate) -> Dict:
        """Create new exercise session"""
        session = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "exercise_type": session_data.exercise_type.value,
            "start_time": datetime.utcnow().isoformat(),
            "total_reps": 0,
            "avg_score": 0.0
        }
        
        result = supabase.table("sessions").insert(session).execute()
        return result.data[0] if result.data else None
    
    def save_frame_data(self, session_id: str, frame_data: FrameData) -> Dict:
        """Save frame data for session"""
        frame = {
            "session_id": session_id,
            "angles": frame_data.angles,
            "stage": frame_data.stage,
            "rep_count": frame_data.rep_count,
            "timestamp": frame_data.timestamp,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("frames").insert(frame).execute()
        return result.data[0] if result.data else None
    
    def save_feedback(self, session_id: str, feedback: str) -> Dict:
        """Save AI feedback for session"""
        feedback_data = {
            "session_id": session_id,
            "feedback_text": feedback,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("feedback").insert(feedback_data).execute()
        return result.data[0] if result.data else None
    
    def get_session_summary(self, session_id: str, user_id: str) -> Dict:
        """Get complete session summary"""
        # Get session data
        session = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
        
        if not session.data:
            return None
        
        # Get frames and feedback
        frames = supabase.table("frames").select("*").eq("session_id", session_id).execute()
        feedback = supabase.table("feedback").select("*").eq("session_id", session_id).execute()
        
        return {
            "session": session.data[0],
            "frames": frames.data,
            "feedback": [f["feedback_text"] for f in feedback.data]
        }
    
    def get_patient_progress(self, user_id: str, days: int = 30) -> List[Dict]:
        """Get patient progress over specified days"""
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        result = supabase.table("sessions").select("*").eq("user_id", user_id).gte(
            "start_time", cutoff_date
        ).execute()
        
        return result.data

db_service = DatabaseService()