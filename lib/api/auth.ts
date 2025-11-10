import apiClient from './client'

// Types for our API
export interface LoginCredentials {
  email?: string
  phone?: string
  password: string
}

// End-user registration removed - only vendors can register

export interface RegisterVendorData {
  name: string
  email?: string
  phone?: string
  password: string
  companyName: string
  taxId: string
  businessAddress: string
  bankDetails: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    name: string
    email?: string
    phone?: string
    role: string
    bankDetails?: string
    isApproved: boolean
  }
}

// Auth API endpoints
export const authApi = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/users/login', credentials)
      return response.data
    } catch (error: any) {
      // Enhanced error logging for network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Ensure baseURL is never empty
        const envUrl = process.env.NEXT_PUBLIC_API_URL
        const baseURL = (!envUrl || envUrl.trim() === '') ? 'http://localhost:8500' : envUrl
        console.error('Network Error - Unable to reach API server')
        console.error('API Base URL:', baseURL)
        console.error('Full URL:', `${baseURL}/users/login`)
        console.error('Error details:', error)
        
        // Provide user-friendly error message
        const networkError = new Error(
          `Cannot connect to API server. Please ensure the backend is running at ${baseURL}`
        ) as any
        networkError.isNetworkError = true
        networkError.apiUrl = baseURL
        throw networkError
      }
      throw error
    }
  },

  // Register as Vendor
  registerVendor: async (userData: RegisterVendorData) => {
    const response = await apiClient.post('/users/register/vendor', userData)
    return response.data
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile')
    return response.data
  },

  // Logout (clear local storage)
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_type')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_data')
      localStorage.removeItem('refresh_token')
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token')
    }
    return false
  },

  // Get stored user type
  getUserType: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_type') as 'customer' | 'vendor' | null
    }
    return null
  },

  // Get stored user ID
  getUserId: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id')
    }
    return null
  }
}
