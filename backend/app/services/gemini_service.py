import google.generativeai as genai
from app.core.config import settings
from app.models.session import ExerciseType, FrameData
from typing import Dict, List
import json

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.feedback_cache = {}
    
    def generate_exercise_feedback(self, exercise_type: ExerciseType, frame_data: FrameData, 
                                 session_history: List[Dict]) -> str:
        """Generate personalized feedback using Gemini AI"""
        
        # Create cache key for similar scenarios
        cache_key = f"{exercise_type}_{frame_data.stage}_{frame_data.rep_count}"
        
        if cache_key in self.feedback_cache:
            return self.feedback_cache[cache_key]
        
        prompt = self._build_prompt(exercise_type, frame_data, session_history)
        
        try:
            response = self.model.generate_content(prompt)
            feedback = response.text.strip()
            
            # Cache for similar scenarios
            self.feedback_cache[cache_key] = feedback
            return feedback
            
        except Exception as e:
            return f"Keep going! You're doing great with your {exercise_type.value} exercise."
    
    def _build_prompt(self, exercise_type: ExerciseType, frame_data: FrameData, 
                     session_history: List[Dict]) -> str:
        """Build dynamic prompt for Gemini based on exercise data"""
        
        base_prompt = f"""
        You are an AI physiotherapy assistant analyzing a {exercise_type.value} exercise.
        
        Current Exercise Data:
        - Exercise: {exercise_type.value}
        - Current Stage: {frame_data.stage}
        - Rep Count: {frame_data.rep_count}
        - Joint Angles: {json.dumps(frame_data.angles)}
        
        Session History: {json.dumps(session_history[-5:]) if session_history else "First exercise"}
        
        Provide concise, encouraging feedback (max 50 words) focusing on:
        1. Form correction if angles are suboptimal
        2. Encouragement for good performance
        3. Specific tips for {exercise_type.value} technique
        
        Response should be motivational and actionable.
        """
        
        return base_prompt

gemini_service = GeminiService()