from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

if settings.supabase_url and settings.supabase_key:
    supabase = create_client(settings.supabase_url, settings.supabase_key)

if settings.supabase_url and settings.supabase_service_key:
    supabase_admin = create_client(settings.supabase_url, settings.supabase_service_key)
