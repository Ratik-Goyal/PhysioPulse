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
      ...(options.headers || {}),
    }

    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Retry fetch on network errors (e.g. "Failed to fetch")
    const maxRetries = 3
    let attempt = 0
    let response: Response | null = null
    while (attempt < maxRetries) {
      try {
        response = await fetch(url, {
          ...options,
          headers,
        })
        break
      } catch (err: any) {
        attempt += 1
        console.warn(`Network request failed (attempt ${attempt}):`, err)
        if (attempt >= maxRetries) {
          throw new Error(`Network Error: Failed to reach ${url}. Please ensure the backend server is running and reachable.`)
        }
        // exponential backoff
        const backoff = 200 * Math.pow(2, attempt)
        await new Promise(res => setTimeout(res, backoff))
      }
    }

    if (!response) {
      throw new Error(`Network Error: No response from ${url}`)
    }

    // Read response body safely once. Some environments can throw if body is already consumed.
    let bodyText = ''
    try {
      bodyText = await response.text()
    } catch (err) {
      // If reading fails, leave bodyText empty and continue
      console.warn('Failed to read response body text:', err)
      bodyText = ''
    }

    if (!response.ok) {
      const parsedError = (() => {
        try {
          const ct = response.headers.get('content-type') || ''
          if (ct.includes('application/json') && bodyText) return JSON.parse(bodyText)
        } catch (e) { /* ignore parse errors */ }
        return bodyText || `Status ${response.status}`
      })()
      throw new Error(`API Error ${response.status}: ${typeof parsedError === 'string' ? parsedError : JSON.stringify(parsedError)}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!bodyText) return null
    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(bodyText)
      } catch (e) {
        return bodyText
      }
    }
    return bodyText
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
