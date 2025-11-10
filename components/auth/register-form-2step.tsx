'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon, ArrowLeft, ArrowRight, Building2, User, CheckCircle } from 'lucide-react'
import { useRegisterVendor } from '@/lib/hooks/useAuth'

export const RegisterForm2Step = () => {
  const [currentStep, setCurrentStep] = useState(1)
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

  const validateStep1 = () => {
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    
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

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }
    
    const { confirmPassword, ...dataToSend } = formData
    console.log('Sending vendor data:', dataToSend)
    registerVendorMutation.mutate(dataToSend as any)
  }

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="h-1 w-8 bg-gray-200"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600 text-sm">Step 1 of 2 - Tell us about yourself</p>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Contact person name *
        </label>
        <input
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.name ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Business email
        </label>
        <input
          name="email"
          type="email"
          placeholder="business@company.com"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.contact ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Business phone
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.contact ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
        {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Password *
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a secure password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
              errors.password ? 'border-red-500/50' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Confirm password *
        </label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
              errors.confirmPassword ? 'border-red-500/50' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* Next Button */}
      <Button
        type="button"
        onClick={handleNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <span>Continue to Business Info</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div className="h-1 w-8 bg-blue-500"></div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600 text-sm">Step 2 of 2 - Tell us about your business</p>
      </div>

      {/* Company Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Company name *
        </label>
        <input
          name="companyName"
          type="text"
          placeholder="Your company or business name"
          value={formData.companyName}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.companyName ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
        {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
      </div>

      {/* Tax ID Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Tax ID *
        </label>
        <input
          name="taxId"
          type="text"
          placeholder="Business tax identification number"
          value={formData.taxId}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.taxId ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
        {errors.taxId && <p className="text-red-400 text-xs mt-1">{errors.taxId}</p>}
      </div>

      {/* Business Address Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Business address *
        </label>
        <input
          name="businessAddress"
          type="text"
          placeholder="Street address, city, state, zip code"
          value={formData.businessAddress}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.businessAddress ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
        {errors.businessAddress && <p className="text-red-400 text-xs mt-1">{errors.businessAddress}</p>}
      </div>

      {/* Bank Details Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Bank details *</label>
        <input
          name="bankDetails"
          type="text"
          placeholder="Account number, bank name, routing number"
          value={formData.bankDetails || ''}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
            errors.bankDetails ? 'border-red-500/50' : 'border-gray-300'
          }`}
        />
        {errors.bankDetails && (
          <p className="text-red-400 text-xs mt-1">{errors.bankDetails}</p>
        )}
        <p className="text-xs text-gray-500">Include account number, bank name, and routing information</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <Button
          type="button"
          onClick={handlePrevious}
          variant="outline"
          className="flex-1 bg-white border-gray-300 text-white hover:bg-white/20 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <Button
          type="submit"
          disabled={currentMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {currentMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg max-h-[90vh] overflow-y-auto">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Global Error */}
        {currentMutation.error && !Object.values(errors).some(e => e) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {(currentMutation.error as any)?.response?.data?.message || 'Registration failed'}
            </div>
          </div>
        )}

        {/* Render Current Step */}
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </form>
    </div>
  )
}

