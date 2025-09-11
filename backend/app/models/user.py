from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    PATIENT = "patient"
    PHYSIO = "physio"
    ADMIN = "admin"

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    role: UserRole
    full_name: str
    created_at: datetime

class PatientProfile(BaseModel):
    user_id: str
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    injury_info: Optional[str] = None
    physio_id: Optional[str] = None