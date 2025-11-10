import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 })
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'event_management'

    if (!cloudinaryUrl) {
      // Temporary mock response for testing
      console.log('Cloudinary not configured, using mock response')
      return NextResponse.json({
        public_id: `mock_${Date.now()}`,
        secure_url: `https://via.placeholder.com/400x300/4f46e5/ffffff?text=Mock+Image`,
        width: 400,
        height: 300,
        format: 'jpg',
        resource_type: 'image',
      })
    }

    // Parse the Cloudinary URL to extract credentials
    // Format: cloudinary://api_key:api_secret@cloud_name
    const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/)
    if (!urlMatch) {
      return NextResponse.json({ 
        error: 'Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name' 
      }, { status: 500 })
    }

    const [, apiKey, apiSecret, cloudName] = urlMatch

    console.log('Cloudinary config:', {
      cloudinaryUrl: cloudinaryUrl ? 'Set' : 'Missing',
      uploadPreset: uploadPreset,
      hasFile: !!file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: cloudName
    })

    // Create form data for Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', uploadPreset)
    cloudinaryFormData.append('folder', 'events')

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cloudinary API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        cloudName,
        uploadPreset
      })
      
      // Return detailed error to client
      return NextResponse.json(
        { 
          error: 'Cloudinary upload failed',
          details: errorText,
          status: response.status,
          cloudName,
          uploadPreset
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
