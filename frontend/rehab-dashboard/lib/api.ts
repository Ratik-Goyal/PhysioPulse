const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`API Error ${response.status}: ${errorData}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return response.text()
  }

  // Auth endpoints
  async signup(userData: any) {
    console.log('API signup request:', userData)
    try {
      const response = await this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      console.log('API signup response:', response)
      return response
    } catch (error) {
      console.error('API signup error:', error)
      throw error
    }
  }

  async login(credentials: any) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' })
    this.clearToken()
  }

  // Session endpoints
  async startSession(exerciseType: string) {
    return this.request('/session/start', {
      method: 'POST',
      body: JSON.stringify({ exercise_type: exerciseType }),
    })
  }

  async submitFrame(sessionId: string, frameData: any) {
    return this.request(`/session/${sessionId}/frame`, {
      method: 'POST',
      body: JSON.stringify(frameData),
    })
  }

  async getSessionSummary(sessionId: string) {
    return this.request(`/session/${sessionId}/summary`)
  }

  // Patient endpoints
  async getMyProgress(days: number = 30) {
    return this.request(`/patient/my-progress?days=${days}`)
  }

  async createPatientProfile(profileData: any) {
    return this.request('/patient/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }
}

export const apiClient = new ApiClient()