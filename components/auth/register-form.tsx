'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useRegisterVendor } from '@/lib/hooks/useAuth'

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    taxId: '',
    businessAddress: '',
    bankDetails: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const registerVendorMutation = useRegisterVendor()
  const currentMutation = registerVendorMutation
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
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = !formData.confirmPassword ? 'Please confirm your password' : 'Passwords do not match'
    }
    if (!formData.email && !formData.phone) {
      newErrors.contact = 'Please provide either email or phone number'
    }
    // Vendor-specific validation
    if (!formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required'
    }
    if (!formData.taxId?.trim()) {
      newErrors.taxId = 'Tax ID is required'
    }
    if (!formData.businessAddress?.trim()) {
      newErrors.businessAddress = 'Business address is required'
    }
    if (!formData.bankDetails?.trim()) {
      newErrors.bankDetails = 'Bank details are required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    // Prepare vendor data
    const { confirmPassword, ...dataToSend } = formData
    console.log('Sending vendor data:', dataToSend) // Debug log
    registerVendorMutation.mutate(dataToSend as any)
  }
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Global Error */}
        {currentMutation.error && !Object.values(errors).some(e => e) && (
          <div className="bg-red-950/50 border border-red-800/50 text-red-300 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
              {(currentMutation.error as any)?.response?.data?.message || 'Registration failed'}
            </div>
          </div>
        )}
        <div className="space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Contact person name *
            </label>
            <input
              name="name"
              type="text"
              placeholder="Enter contact person name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                errors.name ? 'border-red-500/50' : 'border-gray-600/50'
              }`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          {/* Vendor-specific fields */}
          {/* Vendor Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Company name *</label>
                <input
                  name="companyName"
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                    errors.companyName ? 'border-red-500/50' : 'border-gray-600/50'
                  }`}
                />
                {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Tax ID *</label>
                <input
                  name="taxId"
                  type="text"
                  placeholder="Enter tax ID (e.g., TAX123456789)"
                  value={formData.taxId || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                    errors.taxId ? 'border-red-500/50' : 'border-gray-600/50'
                  }`}
                />
                {errors.taxId && <p className="text-red-400 text-xs mt-1">{errors.taxId}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Business address *</label>
                <input
                  name="businessAddress"
                  type="text"
                  placeholder="Enter complete business address"
                  value={formData.businessAddress || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                    errors.businessAddress ? 'border-red-500/50' : 'border-gray-600/50'
                  }`}
                />
                {errors.businessAddress && <p className="text-red-400 text-xs mt-1">{errors.businessAddress}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bank details *</label>
                <input
                  name="bankDetails"
                  type="text"
                  placeholder="Enter bank account information"
                  value={formData.bankDetails || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                    errors.bankDetails ? 'border-yellow-500/50' : 'border-gray-600/50'
                  }`}
                />
                {errors.bankDetails && (
                  <p className="text-xs text-yellow-400">{errors.bankDetails}</p>
                )}
                <p className="text-xs text-gray-500">Include account number, bank name, and routing information</p>
              </div>
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Business email
            </label>
            <input
              name="email"
              type="email"
              placeholder="business@company.com"
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
              Business phone
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                errors.contact ? 'border-yellow-500/50' : 'border-gray-600/50'
              }`}
            />
          </div>
          {errors.contact && <p className="text-yellow-400 text-xs text-center">{errors.contact}</p>}
          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password *</label>
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
            <p className="text-xs text-gray-500">Password must be 6 characters long</p>
          </div>
          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm password *</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 bg-white/10 border rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-500/50' : 'border-gray-600/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          {/* Terms Agreement */}
          <div className="flex items-start pt-4">
            <input
              id="terms"
              name="terms"
              type="checkbox"              required
            />
            <label htmlFor="terms" className="ml-3 block text-sm text-gray-300">
              I agree to the terms and conditions
            </label>
          </div>
        </div>
        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={currentMutation.isPending}
            className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {currentMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                Creating account...
              </>
            ) : (
              "Create Vendor Account"
            )}
          </Button>
        </div>
        {/* User Type Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-medium text-white mb-2">
            Vendor Account
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Register as a vendor to create events, sell tickets, and manage bookings. Your account will need admin approval before you can start creating events.
          </p>
          <div className="mt-3 p-3 bg-blue-950/30 border border-blue-700/50 rounded-lg">
            <h5 className="text-xs font-medium text-blue-300 mb-1">Vendor Requirements:</h5>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Provide valid business information</li>
              <li>• Admin approval required (usually within 24-48 hours)</li>
              <li>• Upload proper documentation for verification</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  )
}
