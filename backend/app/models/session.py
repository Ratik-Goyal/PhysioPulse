from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class SessionCreate(BaseModel):
    exercise_type: str

class SessionResponse(BaseModel):
    id: str
    user_id: str
    exercise_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    total_reps: int = 0
    avg_score: Optional[float] = None

class FrameData(BaseModel):
    angles: Dict[str, float]
    stage: str
    rep_count: int
    timestamp: float
    side: Optional[str] = None

class SessionSummary(BaseModel):
    session: SessionResponse
    total_reps: int
    avg_score: float
    feedback_messages: List[str]
    progress_data: List[Dict]
