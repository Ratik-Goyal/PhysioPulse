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
  const [usingMock, setUsingMock] = useState(false)
  const [webcamError, setWebcamError] = useState<string | null>(null)
  const [currentReps, setCurrentReps] = useState(0)
  const [aiFeedback, setAiFeedback] = useState<string[]>([])
  const [exerciseStage, setExerciseStage] = useState('ready')
  const [accuracy, setAccuracy] = useState(0)
  const [angleAccuracyState, setAngleAccuracyState] = useState(0)
  const [failedReps, setFailedReps] = useState(0)
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false)
  const [perRepPeaks, setPerRepPeaks] = useState<number[]>([])
  const [leftVis, setLeftVis] = useState<number | null>(null)
  const [rightVis, setRightVis] = useState<number | null>(null)
  const [chosenSideState, setChosenSideState] = useState<'left' | 'right' | null>(null)

  // Calibration state (capture rest/horizontal/full) to map raw angles to normalized 0-100
  const [calibDown, setCalibDown] = useState<number | null>(null)
  const [calibMid, setCalibMid] = useState<number | null>(null)
  const [calibUp, setCalibUp] = useState<number | null>(null)
  const angleBufferRef = useRef<number[]>([])
  const [isCalibrating, setIsCalibrating] = useState(false)

  // Auto threshold application and live angle display
  const [autoApplyThreshold, setAutoApplyThreshold] = useState(true)
  const [currentAnglePercent, setCurrentAnglePercent] = useState<number>(0)
  const [repToast, setRepToast] = useState<string | null>(null)

  // Visibility hinting when landmarks are poor
  const lowVisCounterRef = useRef(0)
  const [visibilityHint, setVisibilityHint] = useState<string | null>(null)

  // Success angle range (degrees) - default 165-180
  const [successMinDeg, setSuccessMinDeg] = useState<number>(165)
  const [successMaxDeg, setSuccessMaxDeg] = useState<number>(180)

  const webcamRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const handlePoseResultsRef = useRef<(results: any) => void>(() => {})

  // Refs to always have latest counts for calculations
  const currentRepsRef = useRef(0)
  const failedRepsRef = useRef(0)
  const perRepPeaksRef = useRef<number[]>([])

  // Shoulder raise state machine
  const phaseRef = useRef<'down' | 'up'>('down')
  const maxAngleRef = useRef(0)
  const consecutiveUpRef = useRef(0)
  const reachedHoldRef = useRef(false)
  const cycleFrameCountRef = useRef(0)

  // Detection constants (default)
  const DEFAULT_SUCCESS_RATIO = 0.85
  const DEFAULT_HOLD_SECONDS = 1.0
  const VISIBILITY_THRESHOLD = 0.6
  const MIN_CYCLE_FRAMES = 6
  const DOWN_THRESHOLD = 35

  // Adjustable controls (UI)
  const [successRatio, setSuccessRatio] = useState(DEFAULT_SUCCESS_RATIO)
  const [holdSeconds, setHoldSeconds] = useState<number>(DEFAULT_HOLD_SECONDS)
  const [showDebug, setShowDebug] = useState(false)

  const SUCCESS_THRESHOLD = Math.round(90 * successRatio)
  const UP_HOLD_FRAMES = Math.max(1, Math.round(holdSeconds * 30)) // fallback to frames for cycle checks

  const holdStartRef = useRef<number | null>(null)

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
    setWebcamError(null)
    setUsingMock(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream
        setWebcamEnabled(true)

        // Start pose detection
        mediaPipeService.startCamera(webcamRef.current, (r: any) => handlePoseResultsRef.current(r))
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err)
      const name = err && err.name ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setWebcamError('Camera permission denied. Please allow camera access in your browser settings and retry.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setWebcamError('No camera found. Please connect a camera and retry.')
      } else {
        setWebcamError('Failed to access camera: ' + (err && err.message ? err.message : String(err)))
      }
    }
  }, [handlePoseResultsRef])

  const stopWebcam = useCallback(() => {
    // Stop real camera
    if (webcamRef.current?.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      webcamRef.current.srcObject = null
    }

    // Stop mock interval if running
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setWebcamEnabled(false)
    setUsingMock(false)
    setWebcamError(null)
    mediaPipeService.stopCamera()
  }, [])

  // Simple mock landmarks generator for testing when camera permission denied
  const generateMockLandmarks = () => {
    return Array.from({ length: 33 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      visibility: 0.9
    }))
  }

  const startMock = () => {
    setUsingMock(true)
    setWebcamError(null)
    // Call handlePoseResults periodically with mock landmarks
    intervalRef.current = setInterval(() => {
      const mockResults = { poseLandmarks: generateMockLandmarks() }
      // call handler via ref (set after handler is defined)
      try { handlePoseResultsRef.current(mockResults) } catch (e) { console.debug('mock handler not ready', e) }
    }, 200)
  }

  const normalizeFeedback = (f: any) => {
    if (typeof f === 'string') return f
    if (!f) return ''
    if (typeof f === 'object' && 'message' in f) return String((f as any).message)
    try { return JSON.stringify(f) } catch (e) { return String(f) }
  }

  const handlePoseResults = useCallback(async (results: any) => {
    // Debug: ensure we know why nothing happens
    if (!results || !results.poseLandmarks) {
      console.debug('handlePoseResults: no poseLandmarks', { usingMock, sessionId })
      return
    }

    if (!sessionId) {
      console.debug('handlePoseResults: pose received before session started', { landmarksCount: results.poseLandmarks.length })
      return
    }

    const angles = mediaPipeService.calculateAngles(results.poseLandmarks)

    // Debug log key values
    const leftDbg = angles.leftShoulder ?? 0
    const rightDbg = angles.rightShoulder ?? 0
    const shoulderDbg = Math.max(leftDbg, rightDbg)
    console.debug('Pose Debug', {
      landmarksCount: results.poseLandmarks.length,
      leftShoulder: leftDbg,
      rightShoulder: rightDbg,
      shoulderAngle: shoulderDbg,
      exerciseType,
      sessionId,
      usingMock
    })

    // Custom robust logic for shoulder raises with success/failed attempts
    if (exerciseType === 'shoulder_raise') {
      // check visibility for left/right sets of landmarks
      const lm = results.poseLandmarks
      const leftIndices = [11, 13, 23] // shoulder, elbow, hip
      const rightIndices = [12, 14, 24]

      const leftVisValues = leftIndices.map(i => (lm[i] && typeof lm[i].visibility === 'number') ? lm[i].visibility : 0)
      const rightVisValues = rightIndices.map(i => (lm[i] && typeof lm[i].visibility === 'number') ? lm[i].visibility : 0)
      const leftVisAvg = leftVisValues.reduce((s, v) => s + v, 0) / leftVisValues.length
      const rightVisAvg = rightVisValues.reduce((s, v) => s + v, 0) / rightVisValues.length

      // update UI debug vis values
      setLeftVis(Number(leftVisAvg.toFixed(2)))
      setRightVis(Number(rightVisAvg.toFixed(2)))

      const leftVisible = leftVisAvg >= VISIBILITY_THRESHOLD
      const rightVisible = rightVisAvg >= VISIBILITY_THRESHOLD

      // low visibility hinting
      if (leftVisAvg < VISIBILITY_THRESHOLD && rightVisAvg < VISIBILITY_THRESHOLD) {
        lowVisCounterRef.current = lowVisCounterRef.current + 1
      } else {
        lowVisCounterRef.current = 0
      }
      if (lowVisCounterRef.current > 10) {
        setVisibilityHint('Low landmark visibility — please center shoulders and improve lighting')
      } else {
        setVisibilityHint(null)
      }

      // pick which side to use; fallback to the side with higher avg visibility
      let chosenSide: 'left' | 'right' | null = null
      if (leftVisible && rightVisible) {
        chosenSide = (angles.leftShoulder ?? 0) >= (angles.rightShoulder ?? 0) ? 'left' : 'right'
      } else if (leftVisible) {
        chosenSide = 'left'
      } else if (rightVisible) {
        chosenSide = 'right'
      } else {
        // fallback: pick side with greater visibility even if below threshold
        chosenSide = leftVisAvg >= rightVisAvg ? 'left' : 'right'
      }
      setChosenSideState(chosenSide)

      const shoulderAngle = chosenSide === 'left' ? (angles.leftShoulder ?? 0) : (angles.rightShoulder ?? 0)

      // record recent angles for calibration averaging
      angleBufferRef.current = [...angleBufferRef.current.slice(-60), shoulderAngle]

      // only update max if visibility was good for chosen side
      if (shoulderAngle > maxAngleRef.current) maxAngleRef.current = shoulderAngle

      // compute current normalized percent for live overlay using calibration if present
      const normalizedCurrent = (calibDown !== null && calibUp !== null && calibUp > calibDown)
        ? Math.round(Math.max(0, Math.min(100, ((shoulderAngle - calibDown) / (calibUp - calibDown)) * 100)))
        : Math.round(Math.max(0, Math.min(100, (shoulderAngle / 90) * 100)))
      setCurrentAnglePercent(normalizedCurrent)

      // sustained up detection: use timestamp-based hold for stability
      if (shoulderAngle >= SUCCESS_THRESHOLD) {
        if (!holdStartRef.current) holdStartRef.current = Date.now()
        const heldMs = Date.now() - (holdStartRef.current || Date.now())
        if (heldMs >= Math.round(holdSeconds * 1000)) {
          reachedHoldRef.current = true
        }
      } else {
        holdStartRef.current = null
        reachedHoldRef.current = false
      }

      // update cycle frame count if in 'up' phase
      if (phaseRef.current === 'up') cycleFrameCountRef.current = cycleFrameCountRef.current + 1

      // Determine current stage for UI
      let stage = 'transition'
      if (shoulderAngle >= SUCCESS_THRESHOLD) stage = 'up'
      else if (shoulderAngle <= DOWN_THRESHOLD) stage = 'down'
      setExerciseStage(stage)

      // Enter up phase
      if (phaseRef.current === 'down' && shoulderAngle >= SUCCESS_THRESHOLD) {
        phaseRef.current = 'up'
        cycleFrameCountRef.current = 0
      }

      // Exit phase and finalize rep when dropping below down threshold
      if (phaseRef.current === 'up' && shoulderAngle <= DOWN_THRESHOLD) {
        // NOTE: do not ignore short cycles here — count every detected peak (range-only success)
        // (previously we ignored noisy cycles based on frame count; that made legitimate reps missed)

        const peakAngle = Math.round(maxAngleRef.current || 0)

        // determine success based on peak within successMinDeg..successMaxDeg (range-only)
        const inRange = peakAngle >= successMinDeg && peakAngle <= successMaxDeg
        const success = inRange // range defines success; hold is optional

        // record peak only when we had a valid cycle
        perRepPeaksRef.current = [...perRepPeaksRef.current, peakAngle]
        setPerRepPeaks([...perRepPeaksRef.current])

        // set rep toast message
        setRepToast(success ? `Good rep — ${peakAngle}° (in ${successMinDeg}-${successMaxDeg})` : `Failed rep — ${peakAngle}°`)

        let newSuccesses = currentRepsRef.current
        let newFails = failedRepsRef.current
        if (success) {
          newSuccesses = currentRepsRef.current + 1
          setCurrentReps(newSuccesses)
        } else {
          newFails = failedRepsRef.current + 1
          setFailedReps(newFails)
        }

        console.debug('Rep completed', { chosenSide, peakAngle, success, newSuccesses, newFails, perRepPeaks: perRepPeaksRef.current, cycleFrames: cycleFrameCountRef.current, holdSeconds })

        // reset cycle trackers
        maxAngleRef.current = 0
        // reset time-based hold
        holdStartRef.current = null
        reachedHoldRef.current = false
        phaseRef.current = 'down'
        cycleFrameCountRef.current = 0

        // compute angle-based accuracy across all recorded peaks
        const angleAccuracy = computeAngleBasedAccuracy(perRepPeaksRef.current)
        setAngleAccuracyState(angleAccuracy)
        // Compute simple success ratio accuracy over total attempts
        const totalAttempts = perRepPeaksRef.current.length
        const successCount = newSuccesses
        const ratioAccuracy = totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 0
        // Use ratioAccuracy as the primary displayed accuracy (reflects total successes vs attempts)
        setAccuracy(ratioAccuracy)

        // Send frame data after counting
        try {
          const frameData = { angles, stage: 'down', rep_count: newSuccesses, timestamp: Date.now() / 1000 }
          const response = await apiClient.submitFrame(sessionId, frameData)
          if (response && response.feedback) {
            const fb = normalizeFeedback(response.feedback)
            setAiFeedback(prev => [...prev.slice(-2), fb])
          }
        } catch (error) {
          console.error('Error submitting frame:', error)
        }
        return
      }

      // Send lightweight frame updates without rep increment
      try {
        const frameData = { angles, stage: exerciseStage, rep_count: currentReps, timestamp: Date.now() / 1000 }
        await apiClient.submitFrame(sessionId, frameData)
      } catch (error) {
        // Do not spam console for transient network issues during streaming
      }
      return
    }

    // Default logic for other exercises
    const { stage, repCount } = mediaPipeService.detectExerciseStage(exerciseType, angles)
    console.debug('Default exercise detection', { stage, repCount, exerciseType })
    setExerciseStage(stage)
    if (repCount > 0) {
      setCurrentReps(prev => prev + repCount)
    }

    try {
      const frameData = {
        angles,
        stage,
        rep_count: currentReps + repCount,
        timestamp: Date.now() / 1000
      }
      const response = await apiClient.submitFrame(sessionId, frameData)
      if (response && response.feedback) {
        const fb = normalizeFeedback(response.feedback)
        setAiFeedback(prev => [...prev.slice(-2), fb])
        // Accuracy computed from per-rep peaks; don't adjust it from feedback
      }
    } catch (error) {
      console.error('Error submitting frame:', error)
    }
  }, [sessionId, exerciseType, currentReps, failedReps, successRatio, holdSeconds])

  // Keep ref updated so startWebcam/startMock can safely call it
  useEffect(() => {
    handlePoseResultsRef.current = handlePoseResults
  }, [handlePoseResults])

  // Keep numeric refs in sync so calculations use latest values
  useEffect(() => { currentRepsRef.current = currentReps }, [currentReps])
  useEffect(() => { failedRepsRef.current = failedReps }, [failedReps])

  const computeAccuracy = (successes: number, fails: number) => {
    const total = successes + fails
    if (total === 0) return 0
    return Math.min(100, Math.round((successes / total) * 100))
  }

  const normalizePeakWithCalibration = (peak: number) => {
    const targetFromCalib = (calibUp !== null && calibDown !== null && calibUp > calibDown) ? calibUp : null
    const target = Math.max(successMaxDeg || 90, targetFromCalib || successMaxDeg || 90)
    const base = (calibDown !== null) ? calibDown : 0
    const denom = target - base
    if (denom <= 0) {
      // fallback
      return Math.max(0, Math.min(100, Math.round((peak / 90) * 100)))
    }
    const ratio = (peak - base) / denom
    return Math.max(0, Math.min(1, ratio)) * 100
  }

  const computeAngleBasedAccuracy = (peaks: number[]) => {
    if (!peaks || peaks.length === 0) return 0
    const ratios = peaks.map(p => normalizePeakWithCalibration(p) / 100)
    const avg = ratios.reduce((s, v) => s + v, 0) / ratios.length
    return Math.round(avg * 100)
  }

  // Calibration capture helpers
  const captureCalibration = (slot: 'down' | 'mid' | 'up') => {
    const buffer = angleBufferRef.current
    if (!buffer || buffer.length === 0) return null
    const avg = Math.round(buffer.reduce((s, v) => s + v, 0) / buffer.length)
    if (slot === 'down') setCalibDown(avg)
    if (slot === 'mid') setCalibMid(avg)
    if (slot === 'up') setCalibUp(avg)
    console.debug('Calibration captured', { slot, avg })
    return avg
  }

  const resetCalibration = () => {
    setCalibDown(null)
    setCalibMid(null)
    setCalibUp(null)
    angleBufferRef.current = []
    setAutoApplyThreshold(true)
  }

  // Auto-apply threshold based on calibration (calibDown + 85% of span)
  useEffect(() => {
    if (!autoApplyThreshold) return
    if (calibDown !== null && calibUp !== null && calibUp > calibDown) {
      const desiredAngle = Math.round(calibDown + 0.85 * (calibUp - calibDown))
      const newRatio = Math.max(0.4, Math.min(1, desiredAngle / 90))
      setSuccessRatio(newRatio)
      console.debug('Auto-applied successRatio from calibration', { desiredAngle, newRatio })
      setAutoApplyThreshold(false)
    }
  }, [calibDown, calibUp, autoApplyThreshold])

  // Rep toast cleanup
  useEffect(() => {
    if (!repToast) return
    const t = setTimeout(() => setRepToast(null), 3000)
    return () => clearTimeout(t)
  }, [repToast])

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
      // clear per-rep data
      perRepPeaksRef.current = []
      setPerRepPeaks([])
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const resetSession = () => {
    setCurrentReps(0)
    setAiFeedback([])
    setAccuracy(0)
    setExerciseStage('ready')
    setFailedReps(0)
    setPerRepPeaks([])
    perRepPeaksRef.current = []
    phaseRef.current = 'down'
    maxAngleRef.current = 0
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
            className="w-full h-96 object-cover rounded-lg bg-muted"
            style={{ minHeight: '480px' }}
          />
          {!webcamEnabled && !usingMock && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Enable camera for AI analysis</p>
                {webcamError && (
                  <div className="mt-3 text-xs text-red-400">
                    <p>{webcamError}</p>
                    <div className="flex gap-2 justify-center mt-2">
                      <Button onClick={startWebcam}>Retry</Button>
                      <Button variant="outline" onClick={() => startMock()}>Use Mock Camera</Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">If permission was denied, open your browser site settings and allow camera access, then retry.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mock camera active */}
          {usingMock && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <CameraOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Mock camera active — simulated pose data.</p>
                <div className="flex gap-2 justify-center mt-2">
                  <Button onClick={stopWebcam}>Stop Mock</Button>
                </div>
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
                Failed: {failedReps}
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Stage: {exerciseStage}
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Accuracy: {Math.round(accuracy)}%
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Side: {chosenSideState ?? '—'}
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Lvis: {leftVis ?? '—'} | Rvis: {rightVis ?? '—'}
              </div>
              <div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                Angle: {currentAnglePercent}%
              </div>
            </div>
          )}

          {/* Rep toast */}
          {repToast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 border border-border rounded px-4 py-2 shadow">
              {repToast}
            </div>
          )}

          {/* Visibility hint */}
          {visibilityHint && (
            <div className="absolute top-2 left-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm">
              {visibilityHint}
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

          <div className="pt-2 flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowFeedbackPanel(prev => !prev)}>
              View Feedback
            </Button>
            <Button variant="ghost" onClick={() => setShowDebug(prev => !prev)}>
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </Button>
          </div>

          {/* Debug & Controls */}
          {showDebug && (
            <div className="mt-4 border border-border rounded-lg p-3 bg-muted">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs">Success Threshold (%)</label>
                  <input
                    type="range"
                    min={0.6}
                    max={1.0}
                    step={0.01}
                    value={successRatio}
                    onChange={(e) => setSuccessRatio(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm">{Math.round(successRatio * 100)}% ({SUCCESS_THRESHOLD}°)</div>
                </div>
                <div>
                  <label className="text-xs">Hold Time (s)</label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={holdSeconds}
                    onChange={(e) => setHoldSeconds(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm">{holdSeconds}s</div>
                </div>
              </div>

              <div className="mt-3 text-xs">
                <div>Left vis: {leftVis ?? '—'}</div>
                <div>Right vis: {rightVis ?? '—'}</div>
                <div>Chosen side: {chosenSideState ?? '—'}</div>
                <div>Peaks: {perRepPeaks.join(', ') || '—'}</div>
              </div>

              <div className="mt-3 border-t pt-3">
                <h5 className="text-sm font-medium">Calibration</h5>
                <p className="text-xs mb-2">Follow steps: Keep arm relaxed → Capture Rest. Raise to horizontal → Capture Mid. Raise fully → Capture Full.</p>
                <div className="flex gap-2 mb-2">
                  <Button onClick={() => { setIsCalibrating(true); captureCalibration('down') }}>Capture Rest</Button>
                  <Button onClick={() => captureCalibration('mid')}>Capture Horizontal</Button>
                  <Button onClick={() => captureCalibration('up')}>Capture Full</Button>
                  <Button variant="outline" onClick={resetCalibration}>Reset</Button>
                </div>
                <div className="text-xs">
                  <div>Rest angle: {calibDown ?? '—'}</div>
                  <div>Horizontal angle: {calibMid ?? '—'}</div>
                  <div>Full angle: {calibUp ?? '—'}</div>
                  <div>Normalized example (full = 100%): {calibDown !== null && calibUp !== null ? Math.round(((calibUp - calibDown) / (calibUp - calibDown)) * 100) : '—'}</div>
                  <div className="mt-2">Success angle range: {successMinDeg}° - {successMaxDeg}°</div>
                  <div className="flex gap-2 mt-1">
                    <input type="number" value={successMinDeg} onChange={(e) => setSuccessMinDeg(Number(e.target.value))} className="w-20 p-1 border rounded" />
                    <input type="number" value={successMaxDeg} onChange={(e) => setSuccessMaxDeg(Number(e.target.value))} className="w-20 p-1 border rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Panel */}
        {showFeedbackPanel && (
          <div className="border border-border rounded-lg p-4 bg-background">
            <h4 className="text-sm font-medium mb-2">Session Feedback</h4>
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold">{currentReps}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{failedReps}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentReps + failedReps}</div>
                <div className="text-sm text-muted-foreground">Total Attempts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy (ratio)</div>
                <div className="text-sm text-muted-foreground mt-1">Angle: {Math.round(angleAccuracyState)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-medium">AI Feedback</h5>
              <div className="space-y-1">
                {aiFeedback.length > 0 ? aiFeedback.map((f, i) => (
                  <div key={i} className="text-sm">{typeof f === 'string' ? f : JSON.stringify(f)}</div>
                )) : <div className="text-sm text-muted-foreground">No AI feedback yet.</div>}
              </div>
            </div>

          </div>
        )}

        {/* AI Feedback */}
        {aiFeedback.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Feedback:</h4>
            <div className="space-y-1">
              {aiFeedback.map((feedback, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {(typeof feedback === 'string' && (feedback.includes('Good') || feedback.includes('Perfect'))) ? (
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                  )}
                  <span>{typeof feedback === 'string' ? feedback : JSON.stringify(feedback)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{currentReps}</div>
            <div className="text-sm text-muted-foreground">Reps</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{failedReps}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
            <div className="text-sm text-muted-foreground">Accuracy (ratio)</div>
            <div className="text-sm text-muted-foreground mt-1">Angle: {Math.round(angleAccuracyState)}%</div>
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
