# Registration Debug Guide

## Changes Made:
1. ✅ Backend now uses `supabase_admin.auth.admin.create_user()` 
2. ✅ Auto-confirms email with `email_confirm: True`
3. ✅ Added error logging to both frontend and backend
4. ✅ Better error handling in API client

## Test Steps:

### 1. Check Backend Logs
Start backend and watch for errors:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test Registration
1. Go to http://localhost:3000/patient/register
2. Fill out form and submit
3. Check browser console for logs
4. Check backend terminal for error messages

### 3. Verify in Supabase
1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Check if user appears in the list

## Debug Commands:
```javascript
// In browser console - check what's being sent
console.log('Registration data:', formData)

// Check API response
fetch('http://localhost:8000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    role: 'patient',
    full_name: 'Test User'
  })
}).then(r => r.json()).then(console.log)
```

## Common Issues:
- **Service role key missing**: Check SUPABASE_SERVICE_KEY in .env
- **Email confirmation**: Now auto-confirmed with admin.create_user()
- **CORS errors**: Backend allows localhost:3000

The registration should now create users in Supabase Auth!