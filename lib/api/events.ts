import { apiClient } from './client'

// Types for event creation
export interface EventPhotoDto {
  photoUrl: string
  altText?: string
  caption?: string
  order: number
}

export interface CreateEventDto {
  title: string
  shortDescription: string
  description: string
  venue: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone: string
  maxCapacity: number
  minAge?: number
  maxTicketsPerEmail?: number
  category: string
  tags: string[]
  instructions?: string
  dressCode?: string
  requiredItems?: string
  cancellationPolicy?: string
  refundPolicy?: string
  featuredImage?: string
  isPublic: boolean
  photos: EventPhotoDto[]
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'

export interface Event {
  id: string
  title: string
  description: string
  shortDescription: string
  venue: string
  address: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone: string
  maxCapacity: number
  minAge?: number
  maxTicketsPerEmail?: number
  category: string
  tags: string[]
  instructions?: string
  dressCode?: string
  requiredItems?: string
  cancellationPolicy?: string
  refundPolicy?: string
  featuredImage?: string
  isPublic: boolean
  status: EventStatus
  createdAt: string
  updatedAt: string
  photos: EventPhotoDto[]
  // Analytics fields
  totalBookings?: number
  revenue?: number
  // Vendor information
  vendor?: {
    id: string
    name: string
  }
}

export interface UpdateEventDto {
  title?: string
  shortDescription?: string
  description?: string
  venue?: string
  address?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  timezone?: string
  maxCapacity?: number
  minAge?: number
  maxTicketsPerEmail?: number
  category?: string
  tags?: string[]
  instructions?: string
  dressCode?: string
  requiredItems?: string
  cancellationPolicy?: string
  refundPolicy?: string
  featuredImage?: string
  isPublic?: boolean
}

// Event API endpoints
export const eventsApi = {
  // Create a new event
  createEvent: async (eventData: CreateEventDto): Promise<Event> => {
    const response = await apiClient.post('/vendors/events', eventData)
    return response.data
  },

  // Update an event
  updateEvent: async (eventId: string, eventData: UpdateEventDto): Promise<Event> => {
    const response = await apiClient.put(`/vendors/events/${eventId}`, eventData)
    return response.data
  },

  // Get all vendor events
  getVendorEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get('/vendors/events')
    return response.data
  },

  // Get event analytics
  getEventAnalytics: async (eventId: string) => {
    const response = await apiClient.get(`/vendors/events/${eventId}/analytics`)
    return response.data
  },

  // Publish an event
  publishEvent: async (eventId: string) => {
    const response = await apiClient.put(`/vendors/events/${eventId}/publish`)
    return response.data
  },


  // Unpublish an event
  unpublishEvent: async (eventId: string) => {
    const response = await apiClient.put(`/vendors/events/${eventId}/unpublish`)
    return response.data
  },
  

  // Cancel an event
  cancelEvent: async (eventId: string) => {
    const response = await apiClient.put(`/vendors/events/${eventId}/cancel`)
    return response.data
  },

  // Delete an event
  deleteEvent: async (eventId: string) => {
    const response = await apiClient.delete(`/vendors/events/${eventId}`)
    return response.data
  },
 
  // Get all public events (for customers)
  getPublicEvents: async () => {
    console.log('API: Calling /end-users/events endpoint')
    try {
      const response = await apiClient.get('/end-users/events')
      console.log('API: Response received:', response.data)
      return response.data
    } catch (error) {
      console.error('API: Error calling /end-users/events:', error)
      throw error
    }
  },

  // Get event details
  getEventDetails: async (eventId: string) => {
    const response = await apiClient.get(`/end-users/events/${eventId}`)
    return response.data
  },

  // Get single event
  getSingleEvent: async (eventId: string) => {
    const response = await apiClient.get(`/events/${eventId}`)
    return response.data
  }
}
