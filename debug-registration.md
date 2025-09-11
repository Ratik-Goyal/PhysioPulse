# Registration Debug Steps

## 1. Check Backend Status
Make sure your backend is running:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit: http://localhost:8000/health
Should show: `{"status": "healthy"}`

## 2. Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Try registering
4. Look for error messages

## 3. Test API Directly
```javascript
// In browser console
fetch('http://localhost:8000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    role: 'patient',
    full_name: 'Test User'
  })
}).then(r => r.text()).then(console.log).catch(console.error)
```

## 4. Common Issues:
- ❌ Backend not running
- ❌ CORS errors
- ❌ Missing environment variables (.env file)
- ❌ Supabase connection issues
- ❌ Database not set up

## 5. Check Environment Variables
Make sure backend/.env has:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

Try registering again and check the console for detailed error messages.