import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsApi, CreateEventDto, UpdateEventDto, Event, EventStatus } from '@/lib/api/events'
import { toast } from 'sonner'

// Custom hooks for event management
export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation<Event, Error, CreateEventDto>({
    mutationFn: async (eventData) => {
      console.log('Calling createEvent API with data:', eventData)
      try {
        const result = await eventsApi.createEvent(eventData)
        console.log('API call successful:', result)
        return result
      } catch (error) {
        console.error('API call failed:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data)
      // Invalidate and refetch events queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] })
      toast.success('Event created successfully!')
    },
    onError: (error: any) => {
      console.error('Mutation error:', error)
      toast.error(error.response?.data?.message || 'Failed to create event')
    }
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation<Event, Error, { eventId: string; eventData: UpdateEventDto }>({
    mutationFn: async ({ eventId, eventData }) => {
      console.log('Calling updateEvent API with data:', { eventId, eventData })
      try {
        const result = await eventsApi.updateEvent(eventId, eventData)
        console.log('API call successful:', result)
        return result
      } catch (error) {
        console.error('API call failed:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data)
      // Invalidate and refetch events queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] })
      queryClient.invalidateQueries({ queryKey: ['eventDetails', data.id] })
      toast.success('Event updated successfully!')
    },
    onError: (error: any) => {
      console.error('Mutation error:', error)
      toast.error(error.response?.data?.message || 'Failed to update event')
    }
  })
}

export const useVendorEvents = () => {
  return useQuery<Event[]>({
    queryKey: ['vendorEvents'],
    queryFn: eventsApi.getVendorEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useEventAnalytics = (eventId: string) => {
  return useQuery({
    queryKey: ['eventAnalytics', eventId],
    queryFn: () => eventsApi.getEventAnalytics(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCancelEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsApi.cancelEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] })
      toast.success('Event cancelled successfully!')
    },
    onError: (error: any) => {
      console.error('Event cancellation error:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel event')
    }
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] })
      toast.success('Event deleted successfully!')
    },
    onError: (error: any) => {
      console.error('Event deletion error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete event')
    }
  })
}

export const usePublishEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsApi.publishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] })
      toast.success('Event published successfully!')
    },
    onError: (error: any) => {
      console.error('Event publish error:', error)
      toast.error(error.response?.data?.message || 'Failed to publish event')
    }
  })
}

export const useUnpublishEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsApi.unpublishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] })
      toast.success('Event unpublished successfully!')
    },
    onError: (error: any) => {
      console.error('Event unpublish error:', error)
      toast.error(error.response?.data?.message || 'Failed to unpublish event')
    }
  })
}

export const usePublicEvents = () => {
  return useQuery({
    queryKey: ['publicEvents'],
    queryFn: async () => {
      console.log('Fetching public events...')
      try {
        const result = await eventsApi.getPublicEvents()
        console.log('Public events fetched:', result)
        
        // Filter to only show PUBLISHED events from "Nakivubo stadium" vendor
        // Events with status DRAFT, COMPLETED, or CANCELLED will be hidden
        // Workaround: If status is missing, use isPublic as fallback
        const publishedEvents = result.filter((event: any) => {
          // Use isPublic fallback if status is missing (backend issue)
          const effectiveStatus = event.status || (event.isPublic ? 'PUBLISHED' : 'DRAFT')
          const isPublished = effectiveStatus === 'PUBLISHED'
          
          // Filter by vendor name "Nakivubo stadium"
          const vendorName = event.vendor?.name || event.vendorName || event.vendor?.vendorName || ''
          const vendorNameLower = vendorName.toLowerCase().trim()
          const isNakivuboStadium = vendorNameLower === 'nakivubo stadium' || 
                                     vendorNameLower.includes('nakivubo stadium')
          
          const shouldShow = isPublished && isNakivuboStadium
          console.log(`Event "${event.title}" - Status: ${event.status || 'undefined'}, Effective: ${effectiveStatus}, Vendor: ${vendorName}, Showing: ${shouldShow}`)
          return shouldShow
        })
        
        console.log(`Total events: ${result.length}, Published events from Nakivubo stadium: ${publishedEvents.length}`)
        
        // Log maxTicketsPerEmail for each event
        publishedEvents.forEach((event: Event) => {
          if (event.maxTicketsPerEmail) {
            console.log(`✓ Event "${event.title}" has maxTicketsPerEmail: ${event.maxTicketsPerEmail}`)
          } else {
            console.log(`⚠ Event "${event.title}" has no maxTicketsPerEmail limit`)
          }
        })
        
        return publishedEvents
      } catch (error) {
        console.error('Error fetching public events:', error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useEventDetails = (eventId: string) => {
  return useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: () => eventsApi.getEventDetails(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSingleEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['singleEvent', eventId],
    queryFn: () => eventsApi.getSingleEvent(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
