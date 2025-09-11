# PhysioPulse - AI-Powered Physiotherapy System

An intelligent telerehabilitation platform that combines AI-powered exercise analysis with real-time feedback for physiotherapy patients.

## 🚀 Features

- **Real AI Exercise Analysis** - Live pose detection with Google Gemini AI feedback
- **HD Camera Integration** - 1280x720 resolution for accurate full-body tracking
- **Smart Patient Matching** - Automated doctor assignment based on symptoms
- **Comprehensive Health Assessment** - 4-step symptom evaluation
- **Progress Tracking** - Detailed analytics and session history
- **Secure Authentication** - Supabase-powered user management
- **Real-time AI Coaching** - Instant form correction and exercise guidance

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Supabase** - Database and authentication
- **Google Gemini AI** - Exercise analysis and feedback
- **MediaPipe** - Pose detection and tracking
- **JWT** - Secure token-based authentication

### Frontend
- **Next.js 14** - React framework with TypeScript
- **Tailwind CSS** - Modern styling
- **Shadcn/ui** - Component library
- **Real-time Camera Integration** - Exercise monitoring

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Supabase account
- Google Gemini API key

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/physio-pulse.git
cd physio-pulse
```

### 2. Automated Setup
```bash
setup.bat
```

### 3. Manual Setup (Alternative)

**Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
ENVIRONMENT=development
DISABLE_SSL=true
```

**Frontend Setup:**
```bash
cd frontend/rehab-dashboard
npm install
```

Create `frontend/rehab-dashboard/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Install AI Dependencies
```bash
install-ai-deps.bat
```

### 5. Start Application
```bash
# Quick start
start.bat

# Or manually:
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend/rehab-dashboard
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📱 User Flow

1. **Registration** → Complete patient profile
2. **Health Assessment** → 4-step symptom evaluation
3. **Doctor Assignment** → AI-powered matching
4. **Exercise Sessions** → Real-time AI feedback
5. **Progress Tracking** → Analytics and insights

## 🏗️ Project Structure

```
physio-pulse/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   └── core/           # Configuration
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   └── rehab-dashboard/
│       ├── app/            # Pages and routing
│       ├── components/     # UI components
│       ├── lib/            # Utilities
│       └── contexts/       # State management
└── setup.bat              # Automated setup
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Exercise Sessions
- `POST /session/start` - Start exercise session
- `POST /session/{id}/frame` - Submit pose data
- `GET /session/{id}/summary` - Get session results

### Patient Data
- `GET /patient/my-progress` - Get progress data
- `POST /patient/profile` - Create patient profile

## 🤖 AI Features

- **Real-time Pose Detection** - MediaPipe CDN integration with HD camera support
- **Joint Angle Analysis** - Calculates precise body mechanics from pose landmarks
- **Gemini AI Coaching** - Google's AI analyzes form and provides instant feedback
- **Exercise Recognition** - Automatically detects squats, push-ups, and other exercises
- **Progress Analytics** - AI-powered insights and personalized recommendations
- **Adaptive Feedback** - Learns from your movement patterns for better guidance

## 🔒 Security

- JWT-based authentication
- Row Level Security (RLS) with Supabase
- Environment variable protection
- CORS configuration for secure API access

## 🚀 Deployment

The application is designed for easy deployment with:
- Docker support (coming soon)
- Vercel frontend deployment
- Railway/Heroku backend deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ for improving physiotherapy accessibility through AI technology.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**PhysioPulse** - Revolutionizing physiotherapy with AI-powered insights and real-time feedback.