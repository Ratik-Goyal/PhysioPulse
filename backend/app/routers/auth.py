from fastapi import APIRouter, HTTPException, status
from app.models.user import UserSignup, UserLogin, UserProfile
from app.core.database import supabase, supabase_admin
from app.services.database_service import db_service

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=dict)
async def signup(user_data: UserSignup):
    """Register new user with Supabase Auth"""
    try:
        # Create user in Supabase Auth using admin client
        auth_response = supabase_admin.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,
            "user_metadata": {
                "role": user_data.role.value,
                "full_name": user_data.full_name
            }
        })
        
        if auth_response.user:
            # Insert user profile using admin client to bypass RLS
            profile_data = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "role": user_data.role.value,
                "full_name": user_data.full_name
            }
            
            supabase_admin.table("users").insert(profile_data).execute()
            
            return {
                "message": "User created successfully",
                "user_id": auth_response.user.id,
                "email": user_data.email,
                "role": user_data.role.value
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create user")
            
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if auth_response.user and auth_response.session:
            # Get user role from database
            user_profile = supabase.table("users").select("role, full_name").eq("id", auth_response.user.id).execute()
            role = user_profile.data[0]["role"] if user_profile.data else "patient"
            full_name = user_profile.data[0]["full_name"] if user_profile.data else auth_response.user.email.split('@')[0]
            
            return {
                "access_token": auth_response.session.access_token,
                "token_type": "bearer",
                "user_id": auth_response.user.id,
                "email": auth_response.user.email,
                "role": role,
                "full_name": full_name
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout():
    """Logout user"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))