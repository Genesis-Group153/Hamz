'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadImage, CloudinaryUploadResult } from '@/lib/cloudinary'
import { CreateEventDto, EventPhotoDto } from '@/lib/api/events'
import { useCreateEvent } from '@/lib/hooks/useEvents'
import { toast } from 'sonner'
import { 
  Upload, 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Tag, 
  Image as ImageIcon,
  Plus,
  Trash2
} from 'lucide-react'

interface CreateEventFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const CreateEventForm = ({ onSuccess, onCancel }: CreateEventFormProps) => {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    shortDescription: '',
    description: '',
    venue: '',
    address: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    timezone: 'UTC',
    maxCapacity: 100,
    minAge: undefined,
    maxTicketsPerEmail: undefined,
    category: '',
    tags: [],
    instructions: '',
    dressCode: '',
    requiredItems: '',
    cancellationPolicy: '',
    refundPolicy: '',
    featuredImage: '',
    isPublic: true,
    photos: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const createEventMutation = useCreateEvent()

  // Event categories
  const categories = [
    'Music', 'Sports', 'Technology', 'Business', 'Education', 'Health',
    'Food & Drink', 'Arts & Culture', 'Entertainment', 'Community',
    'Fashion', 'Travel', 'Gaming', 'Photography', 'Other'
  ]

  // Timezones
  const timezones = [
    'UTC', 'EST', 'PST', 'CST', 'MST', 'GMT', 'CET', 'JST', 'AEST', 'IST'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploadingImages(true)
    
    try {
      const uploadPromises = Array.from(files).slice(0, 5 - formData.photos.length).map(async (file, index) => {
        const result: CloudinaryUploadResult = await uploadImage(file, {
          folder: 'events',
          public_id: `event_${Date.now()}_${index}`
        })

        return {
          photoUrl: result.secure_url,
          altText: `Event photo ${formData.photos.length + index + 1}`,
          caption: '',
          order: formData.photos.length + index + 1
        }
      })

      const newPhotos = await Promise.all(uploadPromises)
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }))

      toast.success(`${newPhotos.length} image(s) uploaded successfully!`)
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload images. Please try again.')
    } finally {
      setUploadingImages(false)
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Event title is required'
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.maxCapacity < 1) newErrors.maxCapacity = 'Max capacity must be at least 1'

    // Photo validation
    if (formData.photos.length === 0) newErrors.photos = 'At least 1 photo is required'

    // Date validation
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started', { formData })
    
    if (!validateForm()) {
      console.log('Validation failed', { errors })
      toast.error('Please fix the errors in the form')
      return
    }

    console.log('Validation passed, submitting form...')
    createEventMutation.mutate(formData, {
      onSuccess: (data) => {
        console.log('Event created successfully', data)
        onSuccess?.()
      },
      onError: (error) => {
        console.error('Event creation failed', error)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="p-8 bg-white border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.title ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-600 text-xs font-medium">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.category ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-xs font-medium">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Short Description *</label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief description of the event"
                className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                  errors.shortDescription ? 'border-red-500/50' : 'border-gray-300'
                }`}
              />
              {errors.shortDescription && <p className="text-red-600 text-xs font-medium">{errors.shortDescription}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the event"
                rows={4}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 resize-none ${
                  errors.description ? 'border-red-500/50' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-600 text-xs font-medium">{errors.description}</p>}
            </div>
          </div>

          {/* Location & Time */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-600" />
              Location & Time
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter venue name"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.venue ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.venue && <p className="text-red-600 text-xs font-medium">{errors.venue}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.address ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.address && <p className="text-red-600 text-xs font-medium">{errors.address}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.startDate ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-600 text-xs font-medium">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.endDate ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-600 text-xs font-medium">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.startTime ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && <p className="text-red-600 text-xs font-medium">{errors.startTime}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.endTime ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && <p className="text-red-600 text-xs font-medium">{errors.endTime}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Capacity & Requirements */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Capacity & Requirements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Capacity *</label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  placeholder="100"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 ${
                    errors.maxCapacity ? 'border-red-500/50' : 'border-gray-300'
                  }`}
                />
                {errors.maxCapacity && <p className="text-red-600 text-xs font-medium">{errors.maxCapacity}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Minimum Age (optional)</label>
                <input
                  type="number"
                  name="minAge"
                  value={formData.minAge || ''}
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.select()}
                  min="0"
                  placeholder="No age restriction"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Tickets Per Email (optional)</label>
              <input
                type="number"
                name="maxTicketsPerEmail"
                value={formData.maxTicketsPerEmail || ''}
                onChange={handleInputChange}
                onFocus={(e) => e.target.select()}
                min="1"
                placeholder="No limit (e.g., 4 for max 4 tickets per contact)"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200"
              />
              <p className="text-xs text-gray-500">Limit how many tickets one contact (email OR phone) can purchase for this event</p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Make this event public (visible to everyone)
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Tag className="mr-2 h-5 w-5 text-blue-600" />
              Tags
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 border border-blue-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-300 hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ImageIcon className="mr-2 h-5 w-5 text-blue-600" />
              Event Photos ({formData.photos.length}/5)
            </h2>

            {errors.photos && <p className="text-red-600 text-xs font-medium">{errors.photos}</p>}

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-500/50 transition-colors">
              <input
                type="file"
                id="imageUpload"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                disabled={uploadingImages || formData.photos.length >= 5}
              />
              <label
                htmlFor="imageUpload"
                className={`cursor-pointer ${(uploadingImages || formData.photos.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-500 mb-2">
                  {uploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  {formData.photos.length >= 5 
                    ? 'Maximum 5 images reached' 
                    : `PNG, JPG, GIF up to 10MB each (${formData.photos.length}/5)`
                  }
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.photoUrl}
                      alt={photo.altText}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="Special instructions for attendees"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dress Code</label>
                <input
                  type="text"
                  name="dressCode"
                  value={formData.dressCode}
                  onChange={handleInputChange}
                  placeholder="e.g., Formal, Casual, Black Tie"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Required Items</label>
              <input
                type="text"
                name="requiredItems"
                value={formData.requiredItems}
                onChange={handleInputChange}
                placeholder="Items attendees should bring"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cancellation Policy</label>
                <textarea
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  placeholder="Cancellation terms and conditions"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Refund Policy</label>
                <textarea
                  name="refundPolicy"
                  value={formData.refundPolicy}
                  onChange={handleInputChange}
                  placeholder="Refund terms and conditions"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-50 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={createEventMutation.isPending || uploadingImages}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createEventMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
