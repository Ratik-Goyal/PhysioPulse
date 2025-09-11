from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings
from app.core.database import supabase
from app.models.user import UserRole
from typing import Optional

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        # Verify with Supabase
        user = supabase.auth.get_user(credentials.credentials)
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(user_data: dict = Depends(verify_token)) -> dict:
    return user_data

def require_role(required_role: UserRole):
    def role_checker(user: dict = Depends(get_current_user)) -> dict:
        # Get user role from database
        result = supabase.table("users").select("role").eq("id", user.id).execute()
        if not result.data or result.data[0]["role"] != required_role.value:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker