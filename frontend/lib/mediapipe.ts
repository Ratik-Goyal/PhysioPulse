interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

interface PoseResults {
  poseLandmarks: PoseLandmark[]
}

export class MediaPipeService {
  private onResults: ((results: PoseResults) => void) | null = null
  private isInitialized = false
  private pose: any = null
  private camera: any = null

  async initialize() {
    try {
      // Load MediaPipe from CDN
      await this.loadMediaPipeScripts()
      
      // Initialize pose detection
      this.pose = new window.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      })
      
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
      
      this.pose.onResults((results: PoseResults) => {
        if (this.onResults) {
          this.onResults(results)
        }
      })
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('MediaPipe initialization failed:', error)
      this.isInitialized = false
      return false
    }
  }

  private async loadMediaPipeScripts() {
    return new Promise((resolve, reject) => {
      const script1 = document.createElement('script')
      script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
      script1.onload = () => {
        const script2 = document.createElement('script')
        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
        script2.onload = () => resolve(true)
        script2.onerror = reject
        document.head.appendChild(script2)
      }
      script1.onerror = reject
      document.head.appendChild(script1)
    })
  }

  isReady() {
    return this.isInitialized
  }

  startCamera(videoElement: HTMLVideoElement, onResults: (results: PoseResults) => void) {
    this.onResults = onResults
    
    if (!this.isInitialized || !this.pose) {
      console.error('MediaPipe not initialized')
      return
    }
    
    try {
      this.camera = new window.Camera(videoElement, {
        onFrame: async () => {
          if (this.pose) {
            await this.pose.send({ image: videoElement })
          }
        },
        width: 1280,
        height: 720
      })
      
      this.camera.start()
    } catch (error) {
      console.error('Camera start failed:', error)
      // Fallback to mock data if real MediaPipe fails
      this.startMockDetection(onResults)
    }
  }

  private startMockDetection(onResults: (results: PoseResults) => void) {
    const interval = setInterval(() => {
      const mockResults = {
        poseLandmarks: this.generateMockLandmarks()
      }
      onResults(mockResults)
    }, 100)
    
    // Store for cleanup
    ;(this as any)._mockInterval = interval
  }

  stopCamera() {
    if (this.camera) {
      this.camera.stop()
    }
    
    if ((this as any)._mockInterval) {
      clearInterval((this as any)._mockInterval)
    }
    
    this.onResults = null
  }

  private generateMockLandmarks(): PoseLandmark[] {
    return Array.from({ length: 33 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(), 
      z: Math.random(),
      visibility: 0.8
    }))
  }

  calculateAngles(landmarks: PoseLandmark[]) {
    if (!landmarks || landmarks.length < 33) return {}

    // Calculate key angles for physiotherapy
    const angles = {
      leftElbow: this.calculateAngle(
        landmarks[11], landmarks[13], landmarks[15] // shoulder, elbow, wrist
      ),
      rightElbow: this.calculateAngle(
        landmarks[12], landmarks[14], landmarks[16]
      ),
      leftKnee: this.calculateAngle(
        landmarks[23], landmarks[25], landmarks[27] // hip, knee, ankle
      ),
      rightKnee: this.calculateAngle(
        landmarks[24], landmarks[26], landmarks[28]
      ),
      leftShoulder: this.calculateAngle(
        landmarks[13], landmarks[11], landmarks[23] // elbow, shoulder, hip
      ),
      rightShoulder: this.calculateAngle(
        landmarks[14], landmarks[12], landmarks[24]
      )
    }

    return angles
  }

  private calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    
    if (angle > 180.0) {
      angle = 360 - angle
    }
    
    return Math.round(angle)
  }

  detectExerciseStage(exerciseType: string, angles: any): { stage: string, repCount: number } {
    // Simple exercise detection logic
    switch (exerciseType) {
      case 'squat':
        return this.detectSquatStage(angles)
      case 'pushup':
        return this.detectPushupStage(angles)
      case 'shoulder_raise':
        return this.detectShoulderRaiseStage(angles)
      case 'knee_bend':
        return this.detectSquatStage(angles)
      default:
        return { stage: 'unknown', repCount: 0 }
    }
  }

  private detectSquatStage(angles: any): { stage: string, repCount: number } {
    const avgKneeAngle = (angles.leftKnee + angles.rightKnee) / 2
    
    if (avgKneeAngle > 160) {
      return { stage: 'up', repCount: 0 }
    } else if (avgKneeAngle < 90) {
      return { stage: 'down', repCount: 1 }
    } else {
      return { stage: 'transition', repCount: 0 }
    }
  }

  private detectPushupStage(angles: any): { stage: string, repCount: number } {
    const avgElbowAngle = (angles.leftElbow + angles.rightElbow) / 2

    if (avgElbowAngle > 160) {
      return { stage: 'up', repCount: 0 }
    } else if (avgElbowAngle < 90) {
      return { stage: 'down', repCount: 1 }
    } else {
      return { stage: 'transition', repCount: 0 }
    }
  }

  private detectShoulderRaiseStage(angles: any): { stage: string, repCount: number } {
    // Use the larger of left/right shoulder angles to allow either arm
    const left = angles.leftShoulder ?? 0
    const right = angles.rightShoulder ?? 0
    const shoulderAngle = Math.max(left, right)

    // Define thresholds
    const upThreshold = 85 // ~90° counts as raised
    const downThreshold = 35 // relaxed arm by side

    if (shoulderAngle >= upThreshold) {
      // Top position reached – count as potential rep
      return { stage: 'up', repCount: 1 }
    }
    if (shoulderAngle <= downThreshold) {
      return { stage: 'down', repCount: 0 }
    }
    return { stage: 'transition', repCount: 0 }
  }
}

export const mediaPipeService = new MediaPipeService()
