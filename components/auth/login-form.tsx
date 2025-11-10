'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useLogin } from '@/lib/hooks/useAuth'

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const loginMutation = useLogin()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (!formData.email && !formData.phone) {
      newErrors.contact = 'Please provide either email or phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Use email if provided, otherwise use phone (backend expects email)
    const emailToUse = formData.email ? formData.email : formData.phone

    loginMutation.mutate({
      email: emailToUse,
      password: formData.password
    })
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-xl">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Global Error */}
        {loginMutation.error && (
          <div className="bg-red-950/50 border border-red-800/50 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              {(loginMutation.error as any)?.response?.data?.message || 'Login failed'}.
            </div>
          </div>
        )}

        {/* Contact Method Error */}
        {errors.contact && (
          <div className="bg-yellow-950/50 border border-yellow-800/50 text-yellow-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              {errors.contact}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Business Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter business email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                errors.contact ? 'border-yellow-500/50' : 'border-gray-600/50'
              }`}
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Business Phone
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter business phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                errors.contact ? 'border-yellow-500/50' : 'border-gray-600/50'
              }`}
            />
          </div>

          <div className="text-xs text-gray-400 text-center py-2 bg-white/5 rounded-lg p-3 border border-white/10">
            💡 Provide either email or phone number to sign in
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                  errors.password ? 'border-red-500/50' : 'border-gray-600/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-white focus:ring-white/20 border-gray-600 bg-white/5 rounded transition-colors accent-white"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/auth/forgot-password" className="text-gray-300 hover:text-white transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {loginMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                Signing you in...
              </>
            ) : (
              <>
                Sign in as Vendor
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </Button>
        </div>

        {/* User Type Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-medium text-white mb-2">
            Vendor Portal
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Manage your events, track sales analytics, and handle customer bookings.
          </p>
        </div>

        {/* Anonymous Booking Info */}
        <div className="bg-blue-950/50 rounded-xl p-4 border border-blue-800/50">
          <h4 className="text-sm font-medium text-blue-300 mb-2">
            📱 For Customers
          </h4>
          <p className="text-xs text-blue-200 leading-relaxed">
            Customers can book tickets without creating an account! Just browse events and book directly.
          </p>
        </div>
      </form>
    </div>
  )
}
