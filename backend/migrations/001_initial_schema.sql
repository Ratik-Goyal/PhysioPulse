-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'physio', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (additional patient-specific data)
CREATE TABLE patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    injury_info TEXT,
    physio_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_reps INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Frame data for each session
CREATE TABLE frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    angles JSONB NOT NULL, -- Store joint angles as JSON
    stage VARCHAR(50) NOT NULL,
    rep_count INTEGER NOT NULL,
    timestamp DECIMAL(15,3) NOT NULL, -- Timestamp within session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI feedback for sessions
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_frames_session_id ON frames(session_id);
CREATE INDEX idx_feedback_session_id ON feedback(session_id);
CREATE INDEX idx_patients_physio_id ON patients(physio_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Patients can see their own data, physios can see assigned patients
CREATE POLICY "Patients can view own data" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Physios can view assigned patients" ON patients FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'physio')
);

-- Sessions access control
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Frames access control
CREATE POLICY "Users can view own session frames" ON frames FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE id = frames.session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own session frames" ON frames FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE id = frames.session_id AND user_id = auth.uid())
);

-- Feedback access control
CREATE POLICY "Users can view own session feedback" ON feedback FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE id = feedback.session_id AND user_id = auth.uid())
);
CREATE POLICY "System can insert feedback" ON feedback FOR INSERT WITH CHECK (true);