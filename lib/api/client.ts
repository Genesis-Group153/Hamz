import axios, { AxiosInstance } from 'axios'

// Production API URL - always use this as fallback to prevent build errors
const PRODUCTION_API_URL = 'https://api.genesistickets.net/'

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
  // ALWAYS return a valid URL - never return empty string
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PRODUCTION_API_URL
  }
  
  // Ensure the URL is valid
  const trimmedUrl = url.trim()
  try {
    // Validate URL format - this might throw during build if URL is invalid
    const testUrl = new URL(trimmedUrl)
    // Return the validated URL (ensure it ends with /)
    const validatedUrl = testUrl.href.endsWith('/') ? testUrl.href : testUrl.href + '/'
    return validatedUrl || PRODUCTION_API_URL
  } catch {
    // If URL is invalid, return default - use production URL
    return PRODUCTION_API_URL
  }
}

// Get API base URL with fallback - ensure it's always a valid string
// This function ALWAYS returns a valid URL - never empty string
const getValidBaseUrl = (): string => {
  try {
    const url = getApiBaseUrl()
    // Final safety check - ensure it's never empty
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return PRODUCTION_API_URL
    }
    // Validate it's a proper URL
    const trimmed = url.trim()
    try {
      new URL(trimmed)
      // Ensure it ends with / for consistency
      return trimmed.endsWith('/') ? trimmed : trimmed + '/'
    } catch {
      return PRODUCTION_API_URL
    }
  } catch {
    return PRODUCTION_API_URL
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

// Create the axios client instance lazily to avoid build-time errors
let apiClientInstance: AxiosInstance | null = null
let interceptorsSetup = false

// Lazy getter function - only creates the client when actually needed
const getApiClient = (): AxiosInstance => {
  if (apiClientInstance) {
    return apiClientInstance
  }

  // Get a guaranteed valid baseURL first - ALWAYS use production URL as default
  // This constant ensures we NEVER have an empty URL
  const DEFAULT_URL = PRODUCTION_API_URL
  let guaranteedBaseURL = DEFAULT_URL
  
  try {
    const url = getValidBaseUrl()
    if (url && typeof url === 'string' && url.trim() !== '') {
      // Validate URL before using it
      try {
        new URL(url.trim())
        guaranteedBaseURL = url.trim()
      } catch {
        // Invalid URL, use default
        guaranteedBaseURL = DEFAULT_URL
      }
    }
  } catch {
    // If anything fails, use default
    guaranteedBaseURL = DEFAULT_URL
  }
  
  // Final check - ensure baseURL is never empty
  if (!guaranteedBaseURL || guaranteedBaseURL.trim() === '') {
    guaranteedBaseURL = DEFAULT_URL
  }

  // Create the client with ultimate safety - always use a valid URL
  try {
    // Validate URL one more time before creating - this is critical
    let finalBaseURL = DEFAULT_URL
    try {
      new URL(guaranteedBaseURL)
      finalBaseURL = guaranteedBaseURL
    } catch {
      // If invalid, use default
      finalBaseURL = DEFAULT_URL
    }
    
    // Ensure finalBaseURL is never empty
    if (!finalBaseURL || finalBaseURL.trim() === '') {
      finalBaseURL = DEFAULT_URL
    }
    
    // CRITICAL: Ensure finalBaseURL is never empty before passing to axios.create()
    // This is the last chance to prevent empty URL errors
    // Multiple checks to ensure we NEVER pass an empty string to axios.create()
    if (!finalBaseURL || typeof finalBaseURL !== 'string' || finalBaseURL.trim() === '') {
      finalBaseURL = DEFAULT_URL
    }
    
    // Validate URL one final time before creating axios instance
    let validatedURL = DEFAULT_URL
    try {
      const testUrl = new URL(finalBaseURL)
      validatedURL = testUrl.href
      // Ensure it ends with / for consistency
      if (!validatedURL.endsWith('/')) {
        validatedURL = validatedURL + '/'
      }
    } catch {
      // If still invalid, force use default
      validatedURL = DEFAULT_URL
    }
    
    // Final check - ensure validatedURL is never empty
    if (!validatedURL || validatedURL.trim() === '') {
      validatedURL = DEFAULT_URL
    }
    
    // Now create the axios instance with guaranteed valid URL
    // This should NEVER fail because we've validated the URL multiple times
    // Wrap in try-catch as final safety net
    try {
      // Double-check validatedURL is never empty before passing to axios.create()
      if (!validatedURL || validatedURL.trim() === '') {
        validatedURL = DEFAULT_URL
      }
      
      apiClientInstance = axios.create({
        baseURL: validatedURL,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // Verify the client was created and has a valid baseURL
      if (!apiClientInstance || !apiClientInstance.defaults) {
        throw new Error('Invalid client created')
      }
      
      // Ensure baseURL is never empty - use production URL as default
      if (!apiClientInstance.defaults.baseURL || 
          (typeof apiClientInstance.defaults.baseURL === 'string' && apiClientInstance.defaults.baseURL.trim() === '')) {
        apiClientInstance.defaults.baseURL = DEFAULT_URL
      }
    } catch (createError: any) {
      // If axios.create() fails for any reason (including invalid URL), use fallback
      console.warn('Failed to create axios client with validated URL, using fallback:', createError?.message)
      // Force create with production URL
      apiClientInstance = axios.create({
        baseURL: PRODUCTION_API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      apiClientInstance.defaults.baseURL = PRODUCTION_API_URL
    }
  } catch (error) {
    // Ultimate fallback - create a minimal axios instance with guaranteed valid baseURL
    try {
      apiClientInstance = axios.create({
        baseURL: PRODUCTION_API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // Set baseURL explicitly to ensure it's never empty - use production URL
      if (!apiClientInstance.defaults.baseURL) {
        apiClientInstance.defaults.baseURL = PRODUCTION_API_URL
      }
    } catch (fallbackError) {
      // Last resort - create without baseURL (will be handled in interceptor)
      apiClientInstance = axios.create({
        headers: {
          'Content-Type': 'application/json',
        },
      }) as AxiosInstance
      // Ensure baseURL is set - use production URL
      if (!apiClientInstance.defaults.baseURL) {
        apiClientInstance.defaults.baseURL = PRODUCTION_API_URL
      }
    }
  }

  // Set up interceptors only once
  if (!interceptorsSetup) {
    setupInterceptors(apiClientInstance)
    interceptorsSetup = true
  }
  
  return apiClientInstance
}

// Setup interceptors function
const setupInterceptors = (client: AxiosInstance) => {
  // Request interceptor to add auth token and validate baseURL
  client.interceptors.request.use(
  (config) => {
    // CRITICAL: Ensure baseURL is never empty (safety check)
    // This is critical during build time when env vars might be empty
    // Get a valid baseURL
    let validBaseURL = PRODUCTION_API_URL
    
    try {
      const envUrl = process.env.NEXT_PUBLIC_API_URL
      if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
        try {
          new URL(envUrl.trim())
          validBaseURL = envUrl.trim().replace(/\/$/, '')
        } catch {
          // Invalid URL, use default
          validBaseURL = PRODUCTION_API_URL
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
    if (client.defaults.baseURL !== validBaseURL) {
      client.defaults.baseURL = validBaseURL
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
  client.interceptors.response.use(
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
}

// Create a proxy object that forwards all calls to the lazy-loaded client
// Only access the client when actually needed (not during build analysis)
const apiClient = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    // Only create client when actually accessing a property (not during build analysis)
    // Skip if we're in a build environment and prop is a symbol or internal property
    if (typeof prop === 'symbol' || prop === 'constructor' || prop === 'toString' || prop === 'valueOf') {
      // Return a safe default for build-time analysis
      if (prop === Symbol.toStringTag) {
        return 'AxiosInstance'
      }
    }
    
    try {
      const client = getApiClient()
      const value = (client as any)[prop]
      if (typeof value === 'function') {
        return value.bind(client)
      }
      return value
    } catch (error) {
      // If client creation fails during build, return a safe default
      if (typeof prop === 'string' && ['get', 'post', 'put', 'delete', 'patch'].includes(prop)) {
        return () => Promise.reject(new Error('API client not initialized'))
      }
      return undefined
    }
  },
  set(_target, prop, value) {
    try {
      const client = getApiClient()
      ;(client as any)[prop] = value
      return true
    } catch {
      return false
    }
  },
  has(_target, prop) {
    try {
      const client = getApiClient()
      return prop in client
    } catch {
      return false
    }
  },
  ownKeys(_target) {
    try {
      const client = getApiClient()
      return Object.keys(client)
    } catch {
      return []
    }
  },
  getOwnPropertyDescriptor(_target, prop) {
    try {
      const client = getApiClient()
      return Object.getOwnPropertyDescriptor(client, prop)
    } catch {
      return undefined
    }
  },
})

export default apiClient
