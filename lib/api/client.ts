import axios, { AxiosInstance } from 'axios'

// Ensure API_BASE_URL is never empty - handle empty strings during build
const getApiBaseUrl = (): string => {
  // During build time, environment variables might be empty or undefined
  // Always provide a valid fallback URL
  let url: string | undefined
  
  // Try multiple ways to get the URL
  try {
    url = process.env.NEXT_PUBLIC_API_URL
  } catch {
    url = undefined
  }
  
  // Also try from next.config if available
  if ((!url || typeof url !== 'string' || url.trim() === '') && typeof process !== 'undefined' && process.env) {
    try {
      url = process.env.NEXT_PUBLIC_API_URL
    } catch {
      // Ignore
    }
  }
  
  // Check for empty string, null, undefined, or whitespace-only strings
  if (!url || typeof url !== 'string' || url.trim() === '') {
    // Return a valid default URL that won't cause build errors - use production URL
    return 'https://api.genesistickets.net/'
  }
  
  // Ensure the URL is valid
  const trimmedUrl = url.trim()
  try {
    // Validate URL format - this might throw during build if URL is invalid
    const testUrl = new URL(trimmedUrl)
    // Return the validated URL
    return testUrl.href.replace(/\/$/, '') // Remove trailing slash
    } catch {
      // If URL is invalid, return default - use production URL
      return 'https://api.genesistickets.net/'
    }
}

// Get API base URL with fallback - ensure it's always a valid string
const getValidBaseUrl = (): string => {
  try {
    const url = getApiBaseUrl()
    // Final safety check - ensure it's never empty - use production URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return 'https://api.genesistickets.net/'
    }
    // Validate it's a proper URL
    try {
      new URL(url.trim())
      return url.trim()
    } catch {
      return 'https://api.genesistickets.net/'
    }
  } catch {
    return 'https://api.genesistickets.net/'
  }
}

// Create axios instance with validation
// Ensure baseURL is always a valid non-empty string
const createApiClient = (): AxiosInstance => {
  // Get a guaranteed valid baseURL
  let baseURL = getValidBaseUrl()
  
  // Double-check baseURL is valid before creating axios instance
  if (!baseURL || typeof baseURL !== 'string' || baseURL.trim() === '') {
    baseURL = 'https://api.genesistickets.net/'
  }
  
  // Validate URL one more time - ensure it's a proper URL
  try {
    const testUrl = new URL(baseURL)
    baseURL = testUrl.href.replace(/\/$/, '') // Remove trailing slash
  } catch {
    // If URL is invalid, use default - use production URL
    baseURL = 'https://api.genesistickets.net/'
  }
  
  // Final check - ensure baseURL is never empty
  if (!baseURL || baseURL.trim() === '') {
    baseURL = 'https://api.genesistickets.net/'
  }
  
  // Create axios instance with validated baseURL
  // Wrap in try-catch to handle any edge cases during build
  try {
    // Double-check baseURL is valid before passing to axios
    if (!baseURL || baseURL.trim() === '') {
      baseURL = 'https://api.genesistickets.net/'
    }
    
    // Validate URL one more time before creating axios instance
    try {
      new URL(baseURL)
    } catch {
      baseURL = 'https://api.genesistickets.net/'
    }
    
    const client = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    // Verify the client was created successfully
    if (!client || !client.defaults) {
      throw new Error('Failed to create axios client')
    }
    
    // Ensure baseURL is set on the client - use production URL
    if (!client.defaults.baseURL || client.defaults.baseURL.trim() === '') {
      client.defaults.baseURL = 'https://api.genesistickets.net/'
    }
    
    return client
  } catch (error) {
    // Fallback: create with default URL if initialization fails
    // This should never happen, but handle it gracefully
    try {
      const fallbackClient = axios.create({
        baseURL: 'https://api.genesistickets.net/',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // Ensure baseURL is set - use production URL
      if (!fallbackClient.defaults.baseURL) {
        fallbackClient.defaults.baseURL = 'https://api.genesistickets.net/'
      }
      return fallbackClient
    } catch (fallbackError) {
      // Last resort: create without baseURL (will be set in interceptor)
      const minimalClient = axios.create({
        headers: {
          'Content-Type': 'application/json',
        },
      }) as AxiosInstance
      // Set baseURL explicitly - use production URL
      minimalClient.defaults.baseURL = 'https://api.genesistickets.net/'
      return minimalClient
    }
  }
}

// Create the axios client instance with ultimate safety
let apiClient: AxiosInstance

// Wrap in try-catch to handle any build-time errors
try {
  apiClient = createApiClient()
  // Verify the client was created and has a valid baseURL
  if (!apiClient || !apiClient.defaults || !apiClient.defaults.baseURL) {
    throw new Error('Invalid client created')
  }
  // Ensure baseURL is never empty - use production URL as default
  if (apiClient.defaults.baseURL && typeof apiClient.defaults.baseURL === 'string' && apiClient.defaults.baseURL.trim() === '') {
    apiClient.defaults.baseURL = 'https://api.genesistickets.net/'
  }
  // Also ensure it's set if missing
  if (!apiClient.defaults.baseURL) {
    apiClient.defaults.baseURL = 'https://api.genesistickets.net/'
  }
} catch (error) {
  // Ultimate fallback - create a minimal axios instance with guaranteed valid baseURL
  try {
    apiClient = axios.create({
      baseURL: 'https://api.genesistickets.net/',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    // Set baseURL explicitly to ensure it's never empty - use production URL
    if (!apiClient.defaults.baseURL) {
      apiClient.defaults.baseURL = 'https://api.genesistickets.net/'
    }
  } catch (fallbackError) {
    // Last resort - create without baseURL (will be handled in interceptor)
    apiClient = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    }) as AxiosInstance
    // Ensure baseURL is set - use production URL
    if (!apiClient.defaults.baseURL) {
      apiClient.defaults.baseURL = 'https://api.genesistickets.net/'
    }
  }
}

// Request interceptor to add auth token and validate baseURL
apiClient.interceptors.request.use(
  (config) => {
    // CRITICAL: Ensure baseURL is never empty (safety check)
    // This is critical during build time when env vars might be empty
    // Get a valid baseURL
    let validBaseURL = 'https://api.genesistickets.net/'
    
    try {
      const envUrl = process.env.NEXT_PUBLIC_API_URL
      if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
        try {
          new URL(envUrl.trim())
          validBaseURL = envUrl.trim().replace(/\/$/, '')
        } catch {
          // Invalid URL, use default
          validBaseURL = 'https://api.genesistickets.net/'
        }
      }
    } catch {
      // If anything fails, use default
      validBaseURL = 'https://api.genesistickets.net/'
    }
    
    // Always set baseURL to ensure it's never empty
    if (!config.baseURL || (typeof config.baseURL === 'string' && config.baseURL.trim() === '')) {
      config.baseURL = validBaseURL
    }
    
    // Also set it on the defaults to ensure consistency
    if (apiClient.defaults.baseURL !== validBaseURL) {
      apiClient.defaults.baseURL = validBaseURL
    }
    
    // If config.url is relative and baseURL is missing, construct full URL
    if (config.url && config.url.startsWith('/') && (!config.baseURL || config.baseURL.trim() === '')) {
      config.baseURL = validBaseURL
    }
    
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
