interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

interface FaceLandmark {
  x: number
  y: number
  z: number
}

interface HandLandmark {
  x: number
  y: number
  z: number
}

interface CombinedResults {
  poseLandmarks: PoseLandmark[]
  faceLandmarks?: FaceLandmark[]
  handLandmarks?: HandLandmark[]
}

export class MediaPipeService {
  private onResults: ((results: CombinedResults) => void) | null = null
  private isInitialized = false
  private pose: any = null
  private faceMesh: any = null
  private hands: any = null
  private camera: any = null

  private latestPose: PoseLandmark[] | null = null
  private latestFace: FaceLandmark[] | null = null
  private latestHand: HandLandmark[] | null = null

  async initialize() {
    try {
      await this.loadMediaPipeScripts()

      this.pose = new (window as any).Pose({
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
      this.pose.onResults((results: { poseLandmarks: PoseLandmark[] }) => {
        this.latestPose = results.poseLandmarks
        if (this.onResults) {
          this.onResults({ poseLandmarks: results.poseLandmarks, faceLandmarks: this.latestFace || undefined })
        }
      })

      if ((window as any).FaceMesh) {
        this.faceMesh = new (window as any).FaceMesh({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        })
        this.faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })
        this.faceMesh.onResults((results: { multiFaceLandmarks?: FaceLandmark[][] }) => {
          const face = (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) || null
          this.latestFace = face
          if (this.onResults && this.latestPose) {
            this.onResults({ poseLandmarks: this.latestPose, faceLandmarks: face || undefined, handLandmarks: this.latestHand || undefined })
          }
        })
      }

      if ((window as any).Hands) {
        this.hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })
        this.hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })
        this.hands.onResults((results: { multiHandLandmarks?: HandLandmark[][] }) => {
          const hand = (results.multiHandLandmarks && results.multiHandLandmarks[0]) || null
          this.latestHand = hand
          if (this.onResults && this.latestPose) {
            this.onResults({ poseLandmarks: this.latestPose, faceLandmarks: this.latestFace || undefined, handLandmarks: hand || undefined })
          }
        })
      }

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
        script2.onload = () => {
          const script3 = document.createElement('script')
          script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
          script3.onload = () => {
            const script4 = document.createElement('script')
            script4.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
            script4.onload = () => resolve(true)
            script4.onerror = () => resolve(true)
            document.head.appendChild(script4)
          }
          script3.onerror = () => {
            const script4 = document.createElement('script')
            script4.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
            script4.onload = () => resolve(true)
            script4.onerror = () => resolve(true)
            document.head.appendChild(script4)
          }
          document.head.appendChild(script3)
        }
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

  startCamera(videoElement: HTMLVideoElement, onResults: (results: CombinedResults) => void) {
    this.onResults = onResults

    if (!this.isInitialized || !this.pose) {
      console.error('MediaPipe not initialized')
      return
    }

    try {
      this.camera = new (window as any).Camera(videoElement, {
        onFrame: async () => {
          const image = { image: videoElement }
          if (this.pose) await this.pose.send(image)
          if (this.faceMesh) await this.faceMesh.send(image)
          if (this.hands) await this.hands.send(image)
        },
        width: 1280,
        height: 720
      })

      this.camera.start()
    } catch (error) {
      console.error('Camera start failed:', error)
      this.startMockDetection(onResults)
    }
  }

  private startMockDetection(onResults: (results: CombinedResults) => void) {
    const interval = setInterval(() => {
      const mockResults = {
        poseLandmarks: this.generateMockLandmarks(),
        faceLandmarks: this.generateMockFaceLandmarks(),
        handLandmarks: this.generateMockHandLandmarks()
      }
      onResults(mockResults)
    }, 100)

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
    return Array.from({ length: 33 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      visibility: 0.8
    }))
  }

  private generateMockFaceLandmarks(): FaceLandmark[] {
    return Array.from({ length: 468 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    }))
  }

  private generateMockHandLandmarks(): HandLandmark[] {
    return Array.from({ length: 21 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    }))
  }

  calculateAngles(poseLandmarks: PoseLandmark[], faceLandmarks?: FaceLandmark[], handLandmarks?: HandLandmark[]) {
    if (!poseLandmarks || poseLandmarks.length < 33) return {}

    const angles: any = {
      leftElbow: this.calculateAngle(poseLandmarks[11], poseLandmarks[13], poseLandmarks[15]),
      rightElbow: this.calculateAngle(poseLandmarks[12], poseLandmarks[14], poseLandmarks[16]),
      leftKnee: this.calculateAngle(poseLandmarks[23], poseLandmarks[25], poseLandmarks[27]),
      rightKnee: this.calculateAngle(poseLandmarks[24], poseLandmarks[26], poseLandmarks[28]),
      leftShoulder: this.calculateAngle(poseLandmarks[13], poseLandmarks[11], poseLandmarks[23]),
      rightShoulder: this.calculateAngle(poseLandmarks[14], poseLandmarks[12], poseLandmarks[24]),
      leftHip: this.calculateAngle(poseLandmarks[25], poseLandmarks[23], poseLandmarks[11]),
      rightHip: this.calculateAngle(poseLandmarks[26], poseLandmarks[24], poseLandmarks[12])
    }

    // Wrist signed bend angles (in-plane 2D), using elbow-wrist-index
    try {
      const leftSigned = this.calculateSignedAngle2D(poseLandmarks[13], poseLandmarks[15], poseLandmarks[19])
      const rightSigned = this.calculateSignedAngle2D(poseLandmarks[14], poseLandmarks[16], poseLandmarks[20])
      angles.leftWristSigned = leftSigned
      angles.rightWristSigned = rightSigned
    } catch (e) {
      // ignore if any landmark missing
    }

    // Hip abduction approximation (lateral knee offset normalized by torso length)
    try {
      const dist = (a: PoseLandmark, b: PoseLandmark) => Math.hypot(a.x - b.x, a.y - b.y)
      const leftTorso = dist(poseLandmarks[23], poseLandmarks[11]) || 1
      const rightTorso = dist(poseLandmarks[24], poseLandmarks[12]) || 1
      const leftDx = Math.abs(poseLandmarks[25].x - poseLandmarks[23].x)
      const rightDx = Math.abs(poseLandmarks[26].x - poseLandmarks[24].x)
      angles.leftHipAbduction = Math.round(Math.min(90, (leftDx / leftTorso) * 90))
      angles.rightHipAbduction = Math.round(Math.min(90, (rightDx / rightTorso) * 90))
    } catch (e) { /* ignore */ }

    if (faceLandmarks && faceLandmarks.length >= 264) {
      const head = this.calculateHeadOrientation(faceLandmarks)
      angles.headYaw = head.yaw
      angles.headPitch = head.pitch
      angles.headRoll = head.roll
      angles.neckRotation = Math.abs(head.yaw)
      angles.neckLateralFlexion = Math.abs(head.roll)
      angles.neckFlexionExtension = head.pitch
    }

    if (handLandmarks && handLandmarks.length >= 21) {
      try {
        const hl = handLandmarks
        const dist = (a: HandLandmark, b: HandLandmark) => Math.hypot(a.x - b.x, a.y - b.y)
        const thumbTip = hl[4]
        const pinkyTip = hl[20]
        const wrist = hl[0]
        const indexMcp = hl[5]
        const norm = dist(wrist, indexMcp) || 1
        angles.thumbOppDistance = dist(thumbTip, pinkyTip) / norm

        const angle2D = (a: HandLandmark, b: HandLandmark, c: HandLandmark) => {
          const ux = a.x - b.x
          const uy = a.y - b.y
          const vx = c.x - b.x
          const vy = c.y - b.y
          let ang = Math.abs((Math.atan2(vy, vx) - Math.atan2(uy, ux)) * 180 / Math.PI)
          if (ang > 180) ang = 360 - ang
          return ang
        }

        const mcpPairs: [number, number][] = [
          [5, 6],  // index MCP->PIP
          [9, 10], // middle
          [13, 14], // ring
          [17, 18], // pinky
        ]
        const mcpFlexions = mcpPairs.map(([mcpIdx, pipIdx]) => 180 - angle2D(hl[0], hl[mcpIdx], hl[pipIdx]))
        angles.mcpFlexionAvg = Math.max(0, Math.min(180, Math.round(mcpFlexions.reduce((s, v) => s + v, 0) / mcpFlexions.length)))

        const pipTriples: [number, number, number][] = [
          [5, 6, 7],
          [9, 10, 11],
          [13, 14, 15],
          [17, 18, 19],
        ]
        const pipFlexions = pipTriples.map(([mcp, pip, dip]) => 180 - angle2D(hl[mcp], hl[pip], hl[dip]))
        angles.pipFlexionAvg = Math.max(0, Math.min(180, Math.round(pipFlexions.reduce((s, v) => s + v, 0) / pipFlexions.length)))
      } catch (e) {
        // ignore hand calc errors
      }
    }

    return angles
  }

  private calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180.0) angle = 360 - angle
    return Math.round(angle)
  }

  private calculateSignedAngle2D(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    // Signed angle at b between vectors BA and BC in image plane (x,y)
    const ux = a.x - b.x
    const uy = a.y - b.y
    const vx = c.x - b.x
    const vy = c.y - b.y
    const cross = ux * vy - uy * vx
    const dot = ux * vx + uy * vy
    const angleRad = Math.atan2(cross, dot)
    const deg = (angleRad * 180) / Math.PI
    return Math.round(deg)
  }

  private calculateHeadOrientation(face: FaceLandmark[]) {
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const L = face[33] // left eye outer (subject's left)
    const R = face[263] // right eye outer
    const N = face[1] // nose tip

    const mid = { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2, z: (L.z + R.z) / 2 }

    const vLR = { x: R.x - L.x, y: R.y - L.y, z: R.z - L.z }
    const vNM = { x: N.x - mid.x, y: N.y - mid.y, z: N.z - mid.z }

    // Face normal via cross product
    const n = {
      x: vLR.y * vNM.z - vLR.z * vNM.y,
      y: vLR.z * vNM.x - vLR.x * vNM.z,
      z: vLR.x * vNM.y - vLR.y * vNM.x
    }

    const norm = Math.hypot(n.x, n.y, n.z) || 1
    const nx = n.x / norm
    const ny = n.y / norm
    const nz = n.z / norm

    // Approx Euler angles (camera looking along -Z)
    const yaw = (Math.atan2(nx, nz) * 180) / Math.PI // left/right
    const pitch = (Math.atan2(-ny, nz) * 180) / Math.PI // up/down
    const roll = (Math.atan2(vLR.y, vLR.x) * 180) / Math.PI // ear-to-ear tilt

    return {
      yaw: Math.round(clamp(yaw, -90, 90)),
      pitch: Math.round(clamp(pitch, -90, 90)),
      roll: Math.round(clamp(roll, -90, 90))
    }
  }

  detectExerciseStage(exerciseType: string, angles: any): { stage: string, repCount: number } {
    switch (exerciseType) {
      case 'squat':
        return this.detectSquatStage(angles)
      case 'pushup':
        return this.detectPushupStage(angles)
      case 'shoulder_raise':
        return this.detectShoulderRaiseStage(angles)
      case 'shoulder_flexion':
        return this.detectShoulderRaiseStage(angles)
      case 'shoulder_abduction':
        return this.detectShoulderRaiseStage(angles)
      case 'knee_bend':
        return this.detectSquatStage(angles)
      case 'neck_rotation':
        return this.detectNeckRotationStage(angles)
      case 'neck_rotation_left':
        return this.detectNeckRotationLeftStage(angles)
      case 'neck_rotation_right':
        return this.detectNeckRotationRightStage(angles)
      case 'neck_flexion':
        return this.detectNeckFlexionStage(angles)
      case 'neck_extension':
        return this.detectNeckExtensionStage(angles)
      case 'neck_lateral_left':
        return this.detectNeckLateralLeftStage(angles)
      case 'neck_lateral_right':
        return this.detectNeckLateralRightStage(angles)
      case 'wrist_flexion':
        return this.detectWristFlexionStage(angles)
      case 'wrist_extension':
        return this.detectWristExtensionStage(angles)
      case 'hip_flexion':
        return this.detectHipFlexionStage(angles)
      case 'hip_abduction':
        return this.detectHipAbductionStage(angles)
      case 'hip_adduction':
        return this.detectHipAdductionStage(angles)
      case 'finger_thumb_opposition':
        return this.detectThumbOppositionStage(angles)
      case 'finger_mp_flexion':
        return this.detectFingerMPFlexionStage(angles)
      case 'finger_mp_extension':
        return this.detectFingerMPExtensionStage(angles)
      case 'finger_ip_flexion':
        return this.detectFingerIPFlexionStage(angles)
      case 'elbow_flexion':
        return this.detectElbowFlexionStage(angles)
      case 'elbow_extension':
        return this.detectElbowExtensionStage(angles)
      case 'knee_flexion':
        return this.detectKneeFlexionStage(angles)
      case 'knee_extension':
        return this.detectKneeExtensionStage(angles)
      default:
        return { stage: 'unknown', repCount: 0 }
    }
  }

  private detectSquatStage(angles: any): { stage: string, repCount: number } {
    const avgKneeAngle = (angles.leftKnee + angles.rightKnee) / 2
    if (avgKneeAngle > 160) return { stage: 'up', repCount: 0 }
    if (avgKneeAngle < 90) return { stage: 'down', repCount: 1 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectPushupStage(angles: any): { stage: string, repCount: number } {
    const avgElbowAngle = (angles.leftElbow + angles.rightElbow) / 2
    if (avgElbowAngle > 160) return { stage: 'up', repCount: 0 }
    if (avgElbowAngle < 90) return { stage: 'down', repCount: 1 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectShoulderRaiseStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftShoulder ?? 0
    const right = angles.rightShoulder ?? 0
    const shoulderAngle = Math.max(left, right)
    const upThreshold = 85
    const downThreshold = 35
    if (shoulderAngle >= upThreshold) return { stage: 'up', repCount: 1 }
    if (shoulderAngle <= downThreshold) return { stage: 'down', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckRotationStage(angles: any): { stage: string, repCount: number } {
    const yawAbs = Math.abs(angles.headYaw ?? angles.neckRotation ?? 0)
    if (yawAbs >= 45) return { stage: 'rotated', repCount: 1 }
    if (yawAbs <= 10) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckRotationLeftStage(angles: any): { stage: string, repCount: number } {
    const yaw = (angles.headYaw ?? angles.neckRotation ?? 0)
    if (yaw <= -35) return { stage: 'left', repCount: 1 }
    if (Math.abs(yaw) <= 10) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckRotationRightStage(angles: any): { stage: string, repCount: number } {
    const yaw = (angles.headYaw ?? angles.neckRotation ?? 0)
    if (yaw >= 35) return { stage: 'right', repCount: 1 }
    if (Math.abs(yaw) <= 10) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckFlexionStage(angles: any): { stage: string, repCount: number } {
    const pitch = (angles.headPitch ?? angles.neckFlexionExtension ?? 0)
    if (pitch <= -20) return { stage: 'flexed', repCount: 1 }
    if (Math.abs(pitch) <= 10) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckExtensionStage(angles: any): { stage: string, repCount: number } {
    const pitch = (angles.headPitch ?? angles.neckFlexionExtension ?? 0)
    if (pitch >= 20) return { stage: 'extended', repCount: 1 }
    if (Math.abs(pitch) <= 10) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckLateralLeftStage(angles: any): { stage: string, repCount: number } {
    const roll = (angles.headRoll ?? angles.neckLateralFlexion ?? 0)
    if (roll <= -20) return { stage: 'left_tilt', repCount: 1 }
    if (Math.abs(roll) <= 8) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectNeckLateralRightStage(angles: any): { stage: string, repCount: number } {
    const roll = (angles.headRoll ?? angles.neckLateralFlexion ?? 0)
    if (roll >= 20) return { stage: 'right_tilt', repCount: 1 }
    if (Math.abs(roll) <= 8) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectWristFlexionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftWristSigned ?? 0
    const right = angles.rightWristSigned ?? 0
    const chosen = Math.abs(left) >= Math.abs(right) ? left : right
    if (chosen <= -25) return { stage: 'flexed', repCount: 1 }
    if (Math.abs(chosen) <= 8) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectWristExtensionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftWristSigned ?? 0
    const right = angles.rightWristSigned ?? 0
    const chosen = Math.abs(left) >= Math.abs(right) ? left : right
    if (chosen >= 25) return { stage: 'extended', repCount: 1 }
    if (Math.abs(chosen) <= 8) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectHipFlexionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftHip ?? 180
    const right = angles.rightHip ?? 180
    const hip = Math.min(left, right)
    if (hip <= 120) return { stage: 'flexed', repCount: 1 }
    if (hip >= 165) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectHipAbductionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftHipAbduction ?? 0
    const right = angles.rightHipAbduction ?? 0
    const abd = Math.max(left, right)
    if (abd >= 20) return { stage: 'abducted', repCount: 1 }
    if (abd <= 8) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectHipAdductionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftHipAbduction ?? 0
    const right = angles.rightHipAbduction ?? 0
    const abd = Math.max(left, right)
    if (abd <= 8) return { stage: 'adducted', repCount: 1 }
    if (abd >= 15) return { stage: 'neutral', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectThumbOppositionStage(angles: any): { stage: string, repCount: number } {
    const d = angles.thumbOppDistance
    if (typeof d !== 'number') return { stage: 'unknown', repCount: 0 }
    if (d <= 0.08) return { stage: 'touch', repCount: 1 }
    if (d >= 0.12) return { stage: 'apart', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectFingerMPFlexionStage(angles: any): { stage: string, repCount: number } {
    const flex = angles.mcpFlexionAvg ?? 0
    if (flex >= 40) return { stage: 'flexed', repCount: 1 }
    if (flex <= 10) return { stage: 'extended', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectFingerMPExtensionStage(angles: any): { stage: string, repCount: number } {
    const flex = angles.mcpFlexionAvg ?? 0
    if (flex <= 10) return { stage: 'extended', repCount: 1 }
    if (flex >= 25) return { stage: 'flexed', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectFingerIPFlexionStage(angles: any): { stage: string, repCount: number } {
    const flex = angles.pipFlexionAvg ?? 0
    if (flex >= 40) return { stage: 'flexed', repCount: 1 }
    if (flex <= 10) return { stage: 'extended', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectElbowFlexionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftElbow ?? 180
    const right = angles.rightElbow ?? 180
    const elbow = Math.min(left, right)
    if (elbow <= 60) return { stage: 'flexed', repCount: 1 }
    if (elbow >= 160) return { stage: 'extended', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectElbowExtensionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftElbow ?? 180
    const right = angles.rightElbow ?? 180
    const elbow = Math.max(left, right)
    if (elbow >= 160) return { stage: 'extended', repCount: 1 }
    if (elbow <= 100) return { stage: 'flexed', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectKneeFlexionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftKnee ?? 180
    const right = angles.rightKnee ?? 180
    const knee = Math.min(left, right)
    if (knee <= 70) return { stage: 'flexed', repCount: 1 }
    if (knee >= 165) return { stage: 'extended', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }

  private detectKneeExtensionStage(angles: any): { stage: string, repCount: number } {
    const left = angles.leftKnee ?? 180
    const right = angles.rightKnee ?? 180
    const knee = Math.max(left, right)
    if (knee >= 165) return { stage: 'extended', repCount: 1 }
    if (knee <= 110) return { stage: 'flexed', repCount: 0 }
    return { stage: 'transition', repCount: 0 }
  }
}

export const mediaPipeService = new MediaPipeService()
