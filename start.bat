@echo off
echo Starting PhysioPulse Application...

echo.
echo [1/3] Starting Backend Server...
start "Backend" cmd /k "cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/3] Installing Frontend Dependencies...
cd frontend\rehab-dashboard
call npm install

echo [3/3] Starting Frontend Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ PhysioPulse is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
pause