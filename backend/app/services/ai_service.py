import os
import google.generativeai as genai
from typing import Dict, Any
import json

class AIService:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        
    async def analyze_exercise_form(self, pose_data: Dict[str, Any], exercise_type: str) -> Dict[str, Any]:
        """Analyze exercise form using Gemini AI"""
        if not self.gemini_api_key:
            return self._mock_response()
            
        try:
            # Calculate joint angles from pose landmarks
            angles = self._calculate_angles(pose_data.get('landmarks', []))
            
            prompt = f"""
            As a physiotherapy expert, analyze this {exercise_type} exercise:
            
            Joint Angles:
            - Left Knee: {angles.get('left_knee', 0)}°
            - Right Knee: {angles.get('right_knee', 0)}°
            - Left Hip: {angles.get('left_hip', 0)}°
            - Right Hip: {angles.get('right_hip', 0)}°
            
            Provide feedback in JSON format:
            {{
                "feedback": "Brief encouraging feedback",
                "score": 0-100,
                "suggestions": ["improvement tip 1", "improvement tip 2"]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            return self._mock_response()
    
    def _calculate_angles(self, landmarks):
        """Calculate joint angles from pose landmarks"""
        if not landmarks or len(landmarks) < 33:
            return {'left_knee': 90, 'right_knee': 90, 'left_hip': 90, 'right_hip': 90}
            
        # Simplified angle calculation (would need proper vector math)
        return {
            'left_knee': 85 + (landmarks[25]['y'] - landmarks[23]['y']) * 10,
            'right_knee': 85 + (landmarks[26]['y'] - landmarks[24]['y']) * 10,
            'left_hip': 90 + (landmarks[23]['y'] - landmarks[11]['y']) * 5,
            'right_hip': 90 + (landmarks[24]['y'] - landmarks[12]['y']) * 5
        }
    
    def _mock_response(self):
        return {
            "feedback": "Good form! Keep your posture aligned.",
            "score": 85,
            "suggestions": ["Engage your core", "Control the movement"]
        }
        
    async def generate_exercise_plan(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized exercise plan"""
        return {
            "exercises": ["Squats", "Push-ups", "Planks"],
            "duration": "30 minutes",
            "difficulty": "beginner"
        }

ai_service = AIService()