# Setup PhysioPulse on New System

## 1. Prerequisites
- Python 3.8+
- Node.js 16+
- Git

## 2. Clone & Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

## 3. Create .env File
Create `backend/.env` with YOUR Supabase credentials:
```
SUPABASE_URL=https://rhfszbspwiamzsiguyrw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZnN6YnNwd2lhbXpzaWd1eXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMDc5MDEsImV4cCI6MjA3Mjg4MzkwMX0.kFjny-wYXj1VJ5E3BBe9haeqfV3x9Pu39gOO2zQ8V0Q
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZnN6YnNwd2lhbXpzaWd1eXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMwNzkwMSwiZXhwIjoyMDcyODgzOTAxfQ.gSvFIUhIz8WsYKrIOo1CAR_SOWcwJFK3TeLlhOORJiQ
GEMINI_API_KEY=AIzaSyACqKLpRy1y5F7gJr3deNzl1EF3aIxnLTM
JWT_SECRET=USjdsXYqB8nhHol9U_J9aG2zP5VmGSyfydgWo2uKhmk
ENVIRONMENT=development
DISABLE_SSL=true
```

## 4. Setup Frontend
```bash
cd frontend/rehab-dashboard
npm install
```

## 5. Create frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 6. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend/rehab-dashboard
npm run dev
```

## 7. Test Registration
- Go to http://localhost:3000/patient/register
- Fill form and submit
- Check Supabase dashboard for new user

## Common Issues:
- ❌ Missing .env files
- ❌ Wrong Supabase credentials
- ❌ SSL certificate errors (add DISABLE_SSL=true)
- ❌ RLS policies not set up

The .env file is CRITICAL - without it, registration won't work!