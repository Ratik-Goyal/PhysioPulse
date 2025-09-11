@echo off
echo Installing AI dependencies...

echo.
echo [1/2] Installing backend dependencies...
cd backend
pip install google-generativeai

echo.
echo [2/2] Restarting servers recommended...
echo.
echo ✅ AI dependencies installed!
echo.
echo Next steps:
echo 1. Restart backend server
echo 2. Test exercise session with real AI feedback
echo.
pause