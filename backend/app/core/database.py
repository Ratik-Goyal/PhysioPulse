from supabase import create_client, Client
from app.core.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)