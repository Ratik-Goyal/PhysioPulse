@echo off
echo Setting up PhysioPulse on new system...

echo.
echo [1/4] Creating backend .env file...
cd backend
if not exist .env (
    echo SUPABASE_URL=https://rhfszbspwiamzsiguyrw.supabase.co > .env
    echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZnN6YnNwd2lhbXpzaWd1eXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMDc5MDEsImV4cCI6MjA3Mjg4MzkwMX0.kFjny-wYXj1VJ5E3BBe9haeqfV3x9Pu39gOO2zQ8V0Q >> .env
    echo SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZnN6YnNwd2lhbXpzaWd1eXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMwNzkwMSwiZXhwIjoyMDcyODgzOTAxfQ.gSvFIUhIz8WsYKrIOo1CAR_SOWcwJFK3TeLlhOORJiQ >> .env
    echo GEMINI_API_KEY=AIzaSyACqKLpRy1y5F7gJr3deNzl1EF3aIxnLTM >> .env
    echo JWT_SECRET=USjdsXYqB8nhHol9U_J9aG2zP5VmGSyfydgWo2uKhmk >> .env
    echo ENVIRONMENT=development >> .env
    echo DISABLE_SSL=true >> .env
    echo ✅ Backend .env created
) else (
    echo ✅ Backend .env already exists
)

echo.
echo [2/4] Installing backend dependencies...
pip install -r requirements.txt

echo.
echo [3/4] Creating frontend .env.local...
cd ..\frontend\rehab-dashboard
if not exist .env.local (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
    echo ✅ Frontend .env.local created
) else (
    echo ✅ Frontend .env.local already exists
)

echo.
echo [4/4] Installing frontend dependencies...
call npm install

echo.
echo ✅ Setup complete! 
echo.
echo To start the application:
echo 1. Backend: cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo 2. Frontend: cd frontend/rehab-dashboard && npm run dev
echo.
pause