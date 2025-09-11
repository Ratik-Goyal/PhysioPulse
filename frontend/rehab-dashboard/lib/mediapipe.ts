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

  async initialize() {
    // Simplified initialization - MediaPipe will be loaded via CDN
    this.isInitialized = true
    return true
  }

  isReady() {
    return this.isInitialized
  }

  startCamera(videoElement: HTMLVideoElement, onResults: (results: PoseResults) => void) {
    this.onResults = onResults
    
    // Simulate pose detection for now
    const interval = setInterval(() => {
      if (this.onResults) {
        // Mock pose landmarks
        const mockResults = {
          poseLandmarks: this.generateMockLandmarks()
        }
        this.onResults(mockResults)
      }
    }, 100)
    
    // Store interval for cleanup
    ;(videoElement as any)._poseInterval = interval
  }

  stopCamera() {
    this.onResults = null
  }

  private generateMockLandmarks(): PoseLandmark[] {
    // Generate 33 mock landmarks for pose detection
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
}

export const mediaPipeService = new MediaPipeService()