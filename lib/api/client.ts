import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8500'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Check for staff token first, then regular token
      const staffToken = localStorage.getItem('staff_access_token')
      const token = localStorage.getItem('access_token')
      
      if (staffToken) {
        config.headers.Authorization = `Bearer ${staffToken}`
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const staffToken = localStorage.getItem('staff_access_token')
        const token = localStorage.getItem('access_token')
        
        if (staffToken) {
          // Staff authentication error
          localStorage.removeItem('staff_access_token')
          localStorage.removeItem('staff_data')
          window.location.href = '/staff/login'
        } else if (token) {
          // Regular authentication error
          localStorage.removeItem('access_token')
          localStorage.removeItem('user_type')
          localStorage.removeItem('user_id')
          localStorage.removeItem('user_data')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
