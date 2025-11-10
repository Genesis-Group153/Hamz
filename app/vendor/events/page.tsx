'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CreateEventForm } from '@/components/vendor/create-event-form'
import { useVendorEvents, usePublishEvent, useUnpublishEvent, useCancelEvent, useDeleteEvent } from '@/lib/hooks/useEvents'
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  EyeOff,
  X,
  Ticket,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  
  const { data: events = [], isLoading, error } = useVendorEvents()
  const publishEvent = usePublishEvent()
  const unpublishEvent = useUnpublishEvent()
  const cancelEvent = useCancelEvent()
  const deleteEvent = useDeleteEvent()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handlePublishEvent = async (eventId: string) => {
    try {
      await publishEvent.mutateAsync(eventId)
      // Force refresh the events list
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to publish event:', error)
    }
  }

  const handleUnpublishEvent = async (eventId: string) => {
    try {
      await unpublishEvent.mutateAsync(eventId)
      // Force refresh the events list
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to unpublish event:', error)
    }
  }

  const handleCancelEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      try {
        await cancelEvent.mutateAsync(eventId)
        // Force refresh the events list
        window.location.reload()
      } catch (error: any) {
        console.error('Failed to cancel event:', error)
      }
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent.mutateAsync(eventId)
        // Force refresh the events list
        window.location.reload()
      } catch (error: any) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  const handleRefreshEvents = () => {
    window.location.reload()
  }

  const handleManageTickets = (eventId: string) => {
    router.push(`/vendor/tickets?eventId=${eventId}`)
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    
    switch (status.toUpperCase()) {
      case 'PUBLISHED':
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-700 border-red-500/30'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' // Default to Draft style
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) return 'Draft';
    
    switch (status.toUpperCase()) {
      case 'PUBLISHED':
        return 'Published'
      case 'DRAFT':
        return 'Draft'
      case 'ACTIVE':
        return 'Active'
      case 'CANCELLED':
        return 'Cancelled'
      case 'COMPLETED':
        return 'Completed'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    }
  }

  if (showCreateForm) {
    return (
      <CreateEventForm
        onSuccess={() => {
          setShowCreateForm(false)
          // Refresh events list
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6 px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600 mt-2">Manage your events and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefreshEvents}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              title="Refresh events data"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/vendor/tickets')}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Manage Tickets
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === 'PUBLISHED').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + (e.totalBookings || 0), 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                UGX {events.reduce((sum, e) => sum + (e.revenue || 0), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
        
        {isLoading ? (
          <Card className="p-8 text-center bg-white border-gray-200 shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 text-blue-600 mb-4 animate-spin" />
            <p className="text-gray-600">Loading events...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center bg-white border-gray-200 shadow-sm">
            <p className="text-red-600 mb-4">Failed to load events</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Try Again
            </Button>
          </Card>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center bg-white border-gray-200 shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to start selling tickets</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              // Debug: Log event data
              console.log(`Event: ${event.title}, Status: ${event.status}, isPublic: ${event.isPublic}`);
              
              // Workaround: If no status field, determine from isPublic
              const effectiveStatus = event.status || (event.isPublic ? 'PUBLISHED' : 'DRAFT');
              console.log(`Effective Status: ${effectiveStatus}`);
              
              return (
              <Card key={event.id} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200 shadow-sm relative overflow-hidden">
                {/* Draft Event Banner */}
                {effectiveStatus.toUpperCase() === 'DRAFT' && (
                  <div className="absolute top-0 left-0 right-0 bg-yellow-100 border-b-2 border-yellow-400 px-4 py-2 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-400 rounded-full p-1">
                        <Eye className="h-3 w-3 text-yellow-900" />
                      </div>
                      <span className="text-xs font-semibold text-yellow-900">
                        Draft Event - Not visible to public
                      </span>
                    </div>
                    <Button
                      onClick={() => handlePublishEvent(event.id)}
                      disabled={publishEvent.isPending}
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700 h-6 text-xs px-3"
                    >
                      {publishEvent.isPending ? 'Publishing...' : 'Publish Now'}
                    </Button>
                  </div>
                )}
                
                {/* Row Layout - Main Content */}
                <div className={`flex flex-row items-start gap-6 ${effectiveStatus.toUpperCase() === 'DRAFT' ? 'mt-8' : ''}`}>
                  {/* Left Side - Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{event.shortDescription || 'No description'}</p>
                      </div>
                      
                      {/* Status Badge and Action Buttons - Top Right */}
                      <div className="flex items-center space-x-2 shrink-0 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {getStatusBadge(effectiveStatus)}
                        </span>
                        
                        {/* Quick Action Buttons */}
                        {event.status === 'DRAFT' && (
                          <Button
                            onClick={() => handlePublishEvent(event.id)}
                            disabled={publishEvent.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-8"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {publishEvent.isPending ? 'Publishing...' : 'Publish'}
                          </Button>
                        )}
                        
                        {event.status === 'PUBLISHED' && (
                          <Button
                            onClick={() => handleUnpublishEvent(event.id)}
                            disabled={unpublishEvent.isPending}
                            size="sm"
                            variant="outline"
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 text-xs px-3 py-1 h-8"
                          >
                            <EyeOff className="h-3 w-3 mr-1" />
                            {unpublishEvent.isPending ? 'Unpublishing...' : 'Unpublish'}
                          </Button>
                        )}
                        
                        {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
                          <Button
                            onClick={() => handleCancelEvent(event.id)}
                            disabled={cancelEvent.isPending}
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-50 text-xs px-3 py-1 h-8"
                            title="Cancel Event"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* More Options Dropdown */}
                        <div className="relative group">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          
                          {/* Dropdown menu */}
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px]">
                            <div className="py-1">
                              <button 
                                onClick={() => handleManageTickets(event.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Ticket className="h-4 w-4 mr-2" />
                                Manage Tickets
                              </button>
                              
                              <button 
                                onClick={() => router.push(`/vendor/analytics?eventId=${event.id}`)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Analytics
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deleteEvent.isPending}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleteEvent.isPending ? 'Deleting...' : 'Delete Event'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Event Information Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-600 block mb-0.5">Location</span>
                          <span className="text-gray-900">{event.venue}, {event.address}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-600 block mb-0.5">Date</span>
                          <span className="text-gray-900">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <Users className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
                        <div className="min-w-0">
                          <span className="font-medium text-gray-600 block mb-0.5">Tickets</span>
                          <span className="text-gray-900">{event.totalBookings || 0} / {event.maxCapacity} sold</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Revenue and Actions Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Revenue: </span>
                          <span className="text-green-600 font-bold text-base">UGX {(event.revenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-2">
                        {/* Primary Action Button */}
                        {effectiveStatus.toUpperCase() === 'DRAFT' ? (
                          <Button
                            onClick={() => handlePublishEvent(event.id)}
                            disabled={publishEvent.isPending}
                            className="bg-green-600 text-white hover:bg-green-700"
                            size="sm"
                          >
                            {publishEvent.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish Event
                              </>
                            )}
                          </Button>
                        ) : (effectiveStatus.toUpperCase() === 'PUBLISHED' || effectiveStatus.toUpperCase() === 'ACTIVE') ? (
                          <Button
                            onClick={() => handleUnpublishEvent(event.id)}
                            disabled={unpublishEvent.isPending}
                            variant="outline"
                            className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                            size="sm"
                          >
                            {unpublishEvent.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Unpublishing...
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            )}
                          </Button>
                        ) : null}
                        
                        {/* Manage Tickets Button */}
                        <Button
                          onClick={() => handleManageTickets(event.id)}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-700 hover:bg-blue-50"
                        >
                          <Ticket className="h-4 w-4 mr-2" />
                          Manage Tickets
                        </Button>
                        
                        {/* View Analytics Button */}
                        <Button
                          onClick={() => router.push(`/vendor/analytics?eventId=${event.id}`)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}