# Authentication Test Guide

## Fixed Issues:
1. ✅ API client token management (SSR safe)
2. ✅ Auth context error handling
3. ✅ Backend login response includes role data
4. ✅ Frontend uses backend role information
5. ✅ Proper token storage and retrieval

## Test Steps:

### 1. Start Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```bash
cd frontend/rehab-dashboard
npm run dev
```

### 3. Test Registration
- Go to http://localhost:3000/patient/register
- Fill out form and submit
- Should redirect to health questionnaire

### 4. Test Login
- Go to http://localhost:3000/patient/login
- Use registered credentials
- Should redirect to patient dashboard

### 5. Verify Authentication
- Check browser localStorage for `access_token` and `user_data`
- Dashboard should show user's name and email
- Logout should clear tokens and redirect to home

## Debug Commands:
```javascript
// In browser console
localStorage.getItem('access_token')
localStorage.getItem('user_data')
```

Authentication is now properly configured!