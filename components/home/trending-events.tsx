'use client'

import React from 'react'
import { EventCard } from '@/components/events/event-card'
import { CalendarIcon, LocationIcon, MapIcon } from '@/components/ui/icons'
import { usePublicEvents } from '@/lib/hooks/useEvents'
import { Loader2 } from 'lucide-react'

interface EventDetails {
  title: string
  date: string
  time: string
  location: string
}

export const TrendingEvents = () => {
  const { data: events = [], isLoading, error } = usePublicEvents()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (startTime: string, endTime?: string) => {
    if (endTime) {
      return `${startTime} - ${endTime}`
    }
    return startTime
  }

  // Get the first event as featured, next 2 as small events
  const featuredEvent = events[0]
  const smallEvents = events.slice(1, 3)

  // Fallback data if no events are available
  const defaultFeaturedEvent = {
    id: 0,
    title: "Welcome to Our Event Platform",
    category: "General",
    date: formatDate(new Date().toISOString()),
    time: "TBA",
    location: "Various Locations",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    imageAlt: "Event platform welcome",
  }

  const currentFeaturedEvent = featuredEvent || defaultFeaturedEvent

  if (isLoading) {
    return (
      <div className="bg-black py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-white text-3xl font-bold mb-8">Trending Events</h2>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="text-white">Loading trending events...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-white text-3xl font-bold mb-8">Trending Events</h2>
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Failed to load trending events</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-white text-3xl font-bold mb-8">Trending Events</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Large Featured Event - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div 
              className="relative h-[45vh] rounded-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300"
              onClick={() => currentFeaturedEvent.id && window.open(`/events/${currentFeaturedEvent.id}`, '_blank')}
            >
              <img 
                src={currentFeaturedEvent.featuredImage || currentFeaturedEvent.photos?.[0]?.photoUrl || currentFeaturedEvent.imageUrl}
                alt={currentFeaturedEvent.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Animated Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/60 via-transparent to-red-500/60" />
              
              {/* Text Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <div className="space-y-4">
                  {/* Category Badge */}
                  <span className="inline-block bg-orange-500 text-black px-3 py-1 rounded text-sm font-medium">
                    {currentFeaturedEvent.category || 'Event'}
                  </span>
                  
                  {/* Main Banner Text */}
                  <div className="space-y-2">
                    <p className="text-sm md:text-base opacity-90">
                      {currentFeaturedEvent.shortDescription || 'Join us for an amazing event experience!'}
                    </p>
                    <div className="flex items-center gap-4">
                      <h1 className="text-4xl md:text-6xl font-bold text-yellow-400">
                        {currentFeaturedEvent.title}
                      </h1>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <span className="text-sm font-bold">LIVE</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Details at Bottom */}
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="font-medium">{currentFeaturedEvent.title}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarIcon />
                        <span className="ml-2">{formatDate(currentFeaturedEvent.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarIcon />
                        <span className="ml-2">{formatTime(currentFeaturedEvent.startTime || 'TBA', currentFeaturedEvent.endTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <LocationIcon />
                        <span className="ml-2">{currentFeaturedEvent.venue || currentFeaturedEvent.address || 'Location TBA'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Small Events + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Small Events */}
            {smallEvents.length > 0 ? (
              smallEvents.map((event: any, index: number) => (
                <div 
                  key={event.id || index} 
                  className="flex gap-4 cursor-pointer hover:bg-gray-800/50 rounded-lg p-2 transition-colors"
                  onClick={() => event.id && window.open(`/events/${event.id}`, '_blank')}
                >
                  <div className="w-48 h-42 relative overflow-hidden rounded-lg">
                    <img 
                      src={event.featuredImage || event.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className={`absolute inset-0 ${index === 0 ? 'bg-blue-600/20' : 'bg-orange-500/20'}`} />
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">{event.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <CalendarIcon />
                        <span className="ml-2">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <CalendarIcon />
                        <span className="ml-2">{formatTime(event.startTime || 'TBA', event.endTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <LocationIcon />
                        <span className="ml-2">{event.venue || event.address || 'Location TBA'}</span>
                      </div>
                      <div className="flex items-center text-orange-500 mt-2">
                        <MapIcon />
                        <span className="ml-1 text-xs">View Map</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4">
                <div className="w-48 h-42 relative overflow-hidden rounded-lg bg-gray-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No events yet</span>
                  </div>
                </div>
                <div className="flex-1 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">More Events Coming Soon</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <CalendarIcon />
                      <span className="ml-2">Stay tuned for updates</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-8 h-2 bg-orange-500 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
