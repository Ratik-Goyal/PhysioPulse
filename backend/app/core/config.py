from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    supabase_service_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    jwt_secret: Optional[str] = None
    environment: str = "development"
    disable_ssl: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
