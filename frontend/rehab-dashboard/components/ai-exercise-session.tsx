"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Camera, CameraOff, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { mediaPipeService } from "@/lib/mediapipe"

interface AIExerciseSessionProps {
  exerciseType: 'squat' | 'pushup' | 'shoulder_raise' | 'knee_bend'
  onComplete: (sessionData: any) => void
}

export function AIExerciseSession({ exerciseType, onComplete }: AIExerciseSessionProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [webcamEnabled, setWebcamEnabled] = useState(false)
  const [currentReps, setCurrentReps] = useState(0)
  const [aiFeedback, setAiFeedback] = useState<string[]>([])
  const [exerciseStage, setExerciseStage] = useState('ready')
  const [accuracy, setAccuracy] = useState(0)
  
  const webcamRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startSession = async () => {
    try {
      const response = await apiClient.startSession(exerciseType)
      setSessionId(response.id)
      setIsActive(true)
      setCurrentReps(0)
      setAiFeedback([])
      
      // Initialize MediaPipe
      await mediaPipeService.initialize()
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream
        setWebcamEnabled(true)
        
        // Start pose detection
        mediaPipeService.startCamera(webcamRef.current, handlePoseResults)
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
    }
  }, [])

  const stopWebcam = useCallback(() => {
    if (webcamRef.current?.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      webcamRef.current.srcObject = null
    }
    setWebcamEnabled(false)
    mediaPipeService.stopCamera()
  }, [])

  const handlePoseResults = useCallback(async (results: any) => {
    if (!results.poseLandmarks || !sessionId) return

    const angles = mediaPipeService.calculateAngles(results.poseLandmarks)
    const { stage, repCount } = mediaPipeService.detectExerciseStage(exerciseType, angles)
    
    setExerciseStage(stage)
    if (repCount > 0) {
      setCurrentReps(prev => prev + repCount)
    }

    // Send frame data to backend for AI analysis
    try {
      const frameData = {
        angles,
        stage,
        rep_count: currentReps + repCount,
        timestamp: Date.now() / 1000
      }
      
      const response = await apiClient.submitFrame(sessionId, frameData)
      
      if (response.feedback) {
        setAiFeedback(prev => [...prev.slice(-2), response.feedback])
      }
      
      // Update accuracy based on AI feedback
      if (response.feedback.includes('Good') || response.feedback.includes('Perfect')) {
        setAccuracy(prev => Math.min(100, prev + 2))
      }
    } catch (error) {
      console.error('Error submitting frame:', error)
    }
  }, [sessionId, exerciseType, currentReps])

  const endSession = async () => {
    try {
      if (sessionId) {
        const summary = await apiClient.getSessionSummary(sessionId)
        onComplete(summary)
      }
      
      setIsActive(false)
      setSessionId(null)
      stopWebcam()
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const resetSession = () => {
    setCurrentReps(0)
    setAiFeedback([])
    setAccuracy(0)
    setExerciseStage('ready')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AI Exercise Session - {exerciseType.replace('_', ' ').toUpperCase()}
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Ready"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startSession}>
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          ) : (
            <Button onClick={endSession} variant="destructive">
              End Session
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={webcamEnabled ? stopWebcam : startWebcam}
            disabled={!isActive}
          >
            {webcamEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {webcamEnabled ? "Stop Camera" : "Start Camera"}
          </Button>
          
          <Button variant="outline" onClick={resetSession} disabled={!isActive}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Webcam Feed */}
        <div className="relative">
          <video 
            ref={webcamRef} 
            autoPlay 
            muted 
            className="w-full h-64 object-cover rounded-lg bg-muted"
          />
          {!webcamEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Enable camera for AI analysis</p>
              </div>
            </div>
          )}
          
          {/* Overlay Stats */}
          {webcamEnabled && (
            <div className="absolute top-2 right-2 space-y-1">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Reps: {currentReps}
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Stage: {exerciseStage}
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Accuracy: {Math.round(accuracy)}%
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Exercise Accuracy</span>
            <span>{Math.round(accuracy)}%</span>
          </div>
          <Progress value={accuracy} />
        </div>

        {/* AI Feedback */}
        {aiFeedback.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Feedback:</h4>
            <div className="space-y-1">
              {aiFeedback.map((feedback, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {feedback.includes('Good') || feedback.includes('Perfect') ? (
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                  )}
                  <span>{feedback}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{currentReps}</div>
            <div className="text-sm text-muted-foreground">Reps</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{aiFeedback.length}</div>
            <div className="text-sm text-muted-foreground">Feedback</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}