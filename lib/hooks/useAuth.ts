import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, AuthResponse } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

// Types
export interface LoginCredentials {
  email?: string
  phone?: string
  password: string
}

// End-user registration removed - only vendors can register/login

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

export interface User {
  id: number
  name: string
  email?: string
  phone?: string
  role: string
  bankDetails?: string
  isApproved: boolean
}


// Custom hooks for authentication
export const useLogin = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: ({ email, phone, password }) => authApi.login({ email, phone, password }),
    onSuccess: (data) => {
      // Store token and user data
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_type', data.user.role.toLowerCase())
      localStorage.setItem('user_id', data.user.id.toString())
      localStorage.setItem('user_data', JSON.stringify(data.user))
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      // Only allow vendor and admin login
      if (data.user.role.toLowerCase().includes('vendor')) {
        router.push('/vendor')
        toast.success('Welcome to your vendor dashboard!')
      } else if (data.user.role.toLowerCase().includes('admin')) {
        router.push('/dashboard/admin')
        toast.success('Welcome to admin dashboard!')
      } else {
        // Reject end-user login attempts
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_type')
        localStorage.removeItem('user_id')
        toast.error('Only vendors and admins can login. End-users can book tickets without an account.')
        router.push('/auth/login')
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      toast.error('Login failed. Please check your credentials.')
    }
  })
}

// End-user registration removed - only vendors can register

export const useRegisterVendor = () => {
  const router = useRouter()

  return useMutation<any, Error, RegisterVendorData>({
    mutationFn: authApi.registerVendor,
    onSuccess: () => {
      toast.success('Vendor registration successful! Please login.')
      router.push('/auth/login')
    },
    onError: (error: any) => {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    }
  })
}

export const useUser = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  return useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      // Get user data from localStorage instead of API call
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user_data')
        if (userData) {
          return JSON.parse(userData)
        }
      }
      throw new Error('No user data found')
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return () => {
    authApi.logout()
    queryClient.clear()
    router.push('/auth/login')
  }
}

export const useAuth = () => {
  const { data: user, isLoading, error } = useUser()
  const logout = useLogout()

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error,
    logout
  }
}
