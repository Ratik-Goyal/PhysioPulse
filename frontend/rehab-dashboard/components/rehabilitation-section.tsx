"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  Camera,
  CameraOff,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react"

interface Exercise {
  id: string
  name: string
  description: string
  duration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  targetArea: string
  videoUrl: string
  instructions: string[]
}

interface RehabProgress {
  exerciseId: string
  completedSessions: number
  totalSessions: number
  lastCompleted: string
  streak: number
  accuracy: number
}

const REHAB_EXERCISES: Exercise[] = [
  {
    id: "neck-stretch",
    name: "Gentle Neck Stretches",
    description: "Reduce tension and improve neck mobility",
    duration: 300, // 5 minutes
    difficulty: "beginner",
    targetArea: "Neck & Shoulders",
    videoUrl: "/neck-stretch-exercise-demonstration.jpg",
    instructions: [
      "Sit up straight with shoulders relaxed",
      "Slowly tilt your head to the right",
      "Hold for 15-30 seconds",
      "Return to center and repeat on left side",
      "Perform 3-5 repetitions each side",
    ],
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder Blade Squeezes",
    description: "Strengthen upper back and improve posture",
    duration: 240,
    difficulty: "beginner",
    targetArea: "Shoulders & Upper Back",
    videoUrl: "/shoulder-blade-squeeze-exercise.jpg",
    instructions: [
      "Stand or sit with arms at your sides",
      "Squeeze shoulder blades together",
      "Hold for 5 seconds",
      "Relax and repeat",
      "Perform 10-15 repetitions",
    ],
  },
  {
    id: "back-extension",
    name: "Gentle Back Extensions",
    description: "Improve spinal mobility and reduce stiffness",
    duration: 360,
    difficulty: "intermediate",
    targetArea: "Lower Back",
    videoUrl: "/back-extension-exercise-therapy.jpg",
    instructions: [
      "Lie face down on a mat",
      "Place hands under shoulders",
      "Gently push up, extending your back",
      "Hold for 10 seconds",
      "Lower down slowly and repeat 8-10 times",
    ],
  },
]

interface RehabilitationSectionProps {
  patientCondition: string
}

export function RehabilitationSection({ patientCondition }: RehabilitationSectionProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [webcamEnabled, setWebcamEnabled] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [rehabProgress, setRehabProgress] = useState<RehabProgress[]>([])
  const [postureFeedback, setPostureFeedback] = useState<string[]>([])
  const [exerciseAccuracy, setExerciseAccuracy] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const webcamRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock progress data
  useEffect(() => {
    const mockProgress: RehabProgress[] = REHAB_EXERCISES.map((exercise) => ({
      exerciseId: exercise.id,
      completedSessions: Math.floor(Math.random() * 10) + 5,
      totalSessions: 20,
      lastCompleted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      streak: Math.floor(Math.random() * 7) + 1,
      accuracy: Math.floor(Math.random() * 30) + 70,
    }))
    setRehabProgress(mockProgress)
  }, [])

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream
        setWebcamEnabled(true)

        // Simulate posture analysis
        const feedbackInterval = setInterval(() => {
          const feedbacks = [
            "✓ Good posture alignment",
            "⚠ Keep your shoulders relaxed",
            "✓ Excellent neck position",
            "⚠ Slow down the movement",
            "✓ Perfect form!",
            "⚠ Maintain steady breathing",
          ]
          setPostureFeedback((prev) => {
            const newFeedback = [...prev, feedbacks[Math.floor(Math.random() * feedbacks.length)]]
            return newFeedback.slice(-3) // Keep only last 3 feedback items
          })
          setExerciseAccuracy((prev) => Math.min(100, prev + Math.random() * 10))
        }, 3000)

        return () => clearInterval(feedbackInterval)
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
    }
  }, [])

  const stopWebcam = useCallback(() => {
    if (webcamRef.current?.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      webcamRef.current.srcObject = null
    }
    setWebcamEnabled(false)
    setPostureFeedback([])
    setExerciseAccuracy(0)
  }, [])

  const startExercise = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise)
    setCurrentTime(0)
    setIsPlaying(true)
    setExerciseAccuracy(0)

    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= exercise.duration) {
          setIsPlaying(false)
          return exercise.duration
        }
        return prev + 1
      })
    }, 1000)
  }, [])

  const pauseExercise = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const resetExercise = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setExerciseAccuracy(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const completeExercise = useCallback(() => {
    if (selectedExercise) {
      setRehabProgress((prev) =>
        prev.map((progress) =>
          progress.exerciseId === selectedExercise.id
            ? {
                ...progress,
                completedSessions: progress.completedSessions + 1,
                lastCompleted: new Date().toISOString(),
                streak: progress.streak + 1,
                accuracy: Math.round((progress.accuracy + exerciseAccuracy) / 2),
              }
            : progress,
        ),
      )
      resetExercise()
      setSelectedExercise(null)
    }
  }, [selectedExercise, exerciseAccuracy, resetExercise])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalProgress = rehabProgress.reduce((acc, curr) => acc + curr.completedSessions, 0)
  const averageAccuracy = rehabProgress.reduce((acc, curr) => acc + curr.accuracy, 0) / rehabProgress.length || 0
  const currentStreak = Math.max(...rehabProgress.map((p) => p.streak), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Rehabilitation & Recovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-4">
            <div className="grid gap-4">
              {REHAB_EXERCISES.map((exercise) => {
                const progress = rehabProgress.find((p) => p.exerciseId === exercise.id)
                return (
                  <div key={exercise.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={exercise.videoUrl || "/placeholder.svg"}
                        alt={exercise.name}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{exercise.name}</h4>
                          <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>⏱ {formatTime(exercise.duration)}</span>
                          <span>🎯 {exercise.targetArea}</span>
                          {progress && (
                            <span>
                              📈 {progress.completedSessions}/{progress.totalSessions} sessions
                            </span>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => startExercise(exercise)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="practice" className="space-y-4">
            {selectedExercise ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedExercise.name}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={webcamEnabled ? stopWebcam : startWebcam}>
                      {webcamEnabled ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                      {webcamEnabled ? "Stop Camera" : "Enable Camera"}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Exercise Video */}
                  <div className="space-y-2">
                    <img
                      src={selectedExercise.videoUrl || "/placeholder.svg"}
                      alt="Exercise demonstration"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={isPlaying ? pauseExercise : () => startExercise(selectedExercise)}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetExercise}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <div className="flex-1">
                        <Progress value={(currentTime / selectedExercise.duration) * 100} />
                      </div>
                      <span className="text-sm font-mono">
                        {formatTime(currentTime)} / {formatTime(selectedExercise.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Webcam Feed */}
                  <div className="space-y-2">
                    <div className="relative">
                      <video ref={webcamRef} autoPlay muted className="w-full h-48 object-cover rounded-lg bg-muted" />
                      {!webcamEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                          <div className="text-center">
                            <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Enable camera for posture analysis</p>
                          </div>
                        </div>
                      )}
                      {webcamEnabled && exerciseAccuracy > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          Accuracy: {Math.round(exerciseAccuracy)}%
                        </div>
                      )}
                    </div>

                    {/* Real-time Feedback */}
                    {postureFeedback.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Real-time Feedback:</h4>
                        {postureFeedback.map((feedback, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {feedback.startsWith("✓") ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                            <span>{feedback.substring(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <h4 className="font-medium">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                {/* Complete Exercise */}
                {currentTime >= selectedExercise.duration && (
                  <div className="text-center space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="font-medium">Exercise Complete!</p>
                    <Button onClick={completeExercise}>Mark as Completed</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select an exercise from the Exercises tab to start practicing</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{totalProgress}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{Math.round(averageAccuracy)}%</div>
                  <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Exercise Progress */}
            <div className="space-y-4">
              <h4 className="font-medium">Exercise Progress</h4>
              {rehabProgress.map((progress) => {
                const exercise = REHAB_EXERCISES.find((e) => e.id === progress.exerciseId)
                if (!exercise) return null

                return (
                  <div key={progress.exerciseId} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{exercise.name}</h5>
                      <Badge variant="outline">{progress.streak} day streak</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {progress.completedSessions}/{progress.totalSessions} sessions
                        </span>
                      </div>
                      <Progress value={(progress.completedSessions / progress.totalSessions) * 100} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Accuracy: {progress.accuracy}%</span>
                        <span>Last: {new Date(progress.lastCompleted).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
