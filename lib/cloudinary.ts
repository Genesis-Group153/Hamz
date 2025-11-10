// Client-side Cloudinary utilities for Next.js

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

export interface UploadOptions {
  folder?: string
  transformation?: any
  public_id?: string
}

// Upload image to Cloudinary via our API route
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', options.folder || 'events')
  
  if (options.public_id) {
    formData.append('public_id', options.public_id)
  }

  try {
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Upload failed:', error)
      throw new Error(error.details || error.error || `Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

// Delete image from Cloudinary (requires server-side implementation)
export const deleteImage = async (publicId: string): Promise<void> => {
  // This would need to be implemented as an API route
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image')
  }
}

// Get optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string
    format?: string
  } = {}
): string => {
  const { width, height, quality = 'auto', format = 'auto' } = options
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  
  if (!cloudName || cloudName.trim() === '') {
    // Return a placeholder URL during build if Cloudinary is not configured
    return `https://via.placeholder.com/${width || 400}x${height || 300}`
  }

  let url = `https://res.cloudinary.com/${cloudName}/image/upload`
  
  // Add transformations
  const transformations = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (quality !== 'auto') transformations.push(`q_${quality}`)
  if (format !== 'auto') transformations.push(`f_${format}`)
  
  if (transformations.length > 0) {
    url += `/${transformations.join(',')}`
  }
  
  url += `/${publicId}`
  
  return url
}
