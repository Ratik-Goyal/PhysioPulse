from app.core.ssl_fix import *  # Apply SSL fix first
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, sessions, patients
from app.core.config import settings

app = FastAPI(
    title="PhysioPulse API",
    description="AI-powered telerehabilitation system",
    version="1.0.0"
)

# CORS middleware
# Allow all origins in development (use restrictive origins in production)
if settings.environment == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(patients.router)

@app.get("/")
async def root():
    return {"message": "PhysioPulse API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.environment}
