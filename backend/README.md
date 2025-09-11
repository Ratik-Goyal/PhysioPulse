# PhysioPulse Backend

AI-powered telerehabilitation system backend built with FastAPI, Supabase, and Google Gemini AI.

## Features

- **Authentication**: Supabase Auth with JWT tokens
- **Role-based Access**: Patient, Physiotherapist, Admin roles
- **Exercise Sessions**: Real-time motion tracking and AI feedback
- **AI Integration**: Google Gemini for personalized exercise corrections
- **Progress Tracking**: Patient progress analytics
- **Secure Database**: Supabase with Row Level Security

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key_here
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the migration script in Supabase SQL editor:
   ```sql
   -- Copy content from migrations/001_initial_schema.sql
   ```

### 3. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Exercise Sessions
- `POST /session/start` - Start new exercise session
- `POST /session/{id}/frame` - Submit motion data frame
- `GET /session/{id}/summary` - Get session summary

### Patient Management
- `POST /patient/profile` - Create/update patient profile
- `GET /patient/{id}/progress` - Get patient progress
- `GET /patient/my-progress` - Get current user's progress

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ENVIRONMENT` | Environment (development/production) | No |

## Architecture

```
app/
├── core/           # Configuration and database
├── models/         # Pydantic models
├── routers/        # FastAPI route handlers
├── services/       # Business logic
└── utils/          # Utility functions
```

## Deployment

### AWS ECS Deployment

1. Set up ECR repository
2. Configure GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - All environment variables
3. Push to main branch to trigger deployment

### Manual Docker Deployment

```bash
# Build image
docker build -t physiopulse-api .

# Run container
docker run -p 8000:8000 --env-file .env physiopulse-api
```

## Security Features

- JWT-based authentication with Supabase
- Row Level Security (RLS) policies
- Role-based access control
- Input validation with Pydantic
- CORS configuration

## AI Integration

The system uses Google Gemini AI to provide real-time exercise feedback:

- Analyzes joint angles and movement patterns
- Provides personalized corrections
- Caches similar feedback for performance
- Supports multiple exercise types

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `pytest tests/`
5. Submit pull request

## License

MIT License