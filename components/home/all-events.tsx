'use client'

import React, { useState } from 'react'
import { EventCard } from '@/components/events/event-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CategoryFilters } from '@/components/home/category-filters'
import { usePublicEvents } from '@/lib/hooks/useEvents'
import { Loader2 } from 'lucide-react'

export const AllEvents = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
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

  // Filter events by category
  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter((event:any) => event.category === selectedCategory)

  // Get unique categories for filter
  const categories = ['All', ...new Set(events.map((event:any) => event.category).filter(Boolean))]

  return (
    <div className="bg-black py-12">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-3xl font-bold">All Events</h2>
            <Badge className="bg-orange-500 text-black hover:bg-orange-600">
              {filteredEvents.length}
            </Badge>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category:any) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category as string)}
                className={
                  selectedCategory === category
                    ? "bg-orange-500 text-black hover:bg-orange-600"
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="text-white">Loading events...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Failed to load events</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event:any) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  category={event.category || 'General'}
                  date={formatDate(event.startDate)}
                  time={formatTime(event.startTime || 'TBA', event.endTime)}
                  location={event.venue || event.address || 'Location TBA'}
                  imageUrl={event.featuredImage || event.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'}
                  imageAlt={event.title}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">
                  {selectedCategory === 'All' 
                    ? 'No events available at the moment.' 
                    : `No events found in the ${selectedCategory} category.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-end items-center gap-2">
          {[1, 2, 12, 13].map((page, index) => (
            <Button
              key={index}
              variant={page === 1 ? "default" : "outline"}
              className={page === 1 
                ? "bg-orange-500 text-black hover:bg-orange-600 w-8 h-8 p-0" 
                : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700 w-8 h-8 p-0"
              }
            >
              {page}
            </Button>
          ))}
          {[1, 2, 12, 13].indexOf(12) === -1 && (
            <>
              <span className="text-gray-400">....</span>
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 w-8 h-8 p-0"
              >
                12
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
