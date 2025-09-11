# PhysioPulse Integration Test

## Quick Start
1. **Run the startup script:**
   ```
   start.bat
   ```

2. **Or manually start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2 - Frontend  
   cd frontend/rehab-dashboard
   npm install
   npm run dev
   ```

## Test Integration

### 1. Check Connection Status
- Go to http://localhost:3000
- Verify "Backend Connected" badge appears

### 2. Test Authentication Flow
- Click "Patient Registration" 
- Fill form and submit
- Should redirect and login automatically

### 3. Test Dashboard
- Access patient dashboard
- Verify user data displays correctly
- Check logout functionality

### 4. Test AI Exercise Session
- Click "Start Exercise with AI Feedback"
- Enable camera (mock pose detection will run)
- Verify session creates in backend
- Check AI feedback appears

## API Endpoints Working
- ✅ `GET /health` - Health check
- ✅ `POST /auth/signup` - User registration  
- ✅ `POST /auth/login` - User login
- ✅ `POST /session/start` - Start exercise session
- ✅ `POST /session/{id}/frame` - Submit frame data
- ✅ `GET /session/{id}/summary` - Get session summary

## Integration Points
- ✅ Frontend ↔ Backend API communication
- ✅ Supabase authentication
- ✅ Real-time session tracking
- ✅ AI feedback integration (Gemini)
- ✅ Progress data storage

Your PhysioPulse application is fully integrated!