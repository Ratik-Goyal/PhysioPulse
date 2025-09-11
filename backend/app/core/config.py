from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    gemini_api_key: str
    jwt_secret: str
    environment: str = "development"
    disable_ssl: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()