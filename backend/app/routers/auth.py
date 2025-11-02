from fastapi import APIRouter, HTTPException, status, Query
from app.models.user import UserSignup, UserLogin, UserProfile
from app.core.database import supabase, supabase_admin
from app.services.database_service import db_service

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=dict)
async def signup(user_data: UserSignup):
    """Register new user with Supabase Auth and send confirmation email"""
    try:
        # Create user in Supabase Auth - this will send confirmation email
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "role": user_data.role.value,
                    "full_name": user_data.full_name
                },
                "email_redirect_to": "http://localhost:3000/auth/confirm"
            }
        })
        
        if auth_response.user:
            return {
                "message": "Registration successful! Please check your email to confirm your account.",
                "user_id": auth_response.user.id,
                "email": user_data.email,
                "confirmation_sent": True,
                "email_confirmed": auth_response.user.email_confirmed_at is not None
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

@router.get("/confirm")
async def confirm_email(token_hash: str = Query(...), type: str = Query("signup")):
    """Confirm user email with token from URL"""
    try:
        auth_response = supabase.auth.verify_otp({
            "token_hash": token_hash,
            "type": type
        })
        
        if auth_response.user and auth_response.session:
            return {
                "message": "Email confirmed successfully",
                "user_id": auth_response.user.id,
                "email": auth_response.user.email,
                "access_token": auth_response.session.access_token,
                "confirmed": True
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid confirmation token")
            
    except Exception as e:
        print(f"Email confirmation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Email confirmation failed: {str(e)}")

@router.post("/resend-confirmation")
async def resend_confirmation(email: str = Query(...)):
    """Resend confirmation email"""
    try:
        response = supabase.auth.resend({
            "type": "signup",
            "email": email,
            "options": {
                "email_redirect_to": "http://localhost:3000/auth/confirm"
            }
        })
        
        return {"message": "Confirmation email sent successfully"}
        
    except Exception as e:
        print(f"Resend confirmation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to resend confirmation: {str(e)}")

@router.post("/logout")
async def logout():
    """Logout user"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))