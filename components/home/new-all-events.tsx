'use client'

import React, { useState } from 'react'
import { ProfessionalEventCard } from '@/components/events/professional-event-card'
import { BookingModal } from '@/components/booking/booking-modal'
import { usePublicEvents } from '@/lib/hooks/useEvents'
import { useEventTickets } from '@/lib/hooks/useTickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Filter, Grid, List } from 'lucide-react'

export const NewAllEvents = () => {
  const { data: events = [], isLoading, error } = usePublicEvents()
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: tickets } = useEventTickets(selectedEvent?.id || 0)

  const handleBookClick = (event: any) => {
    setSelectedEvent(event)
    setIsBookingModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsBookingModalOpen(false)
    setSelectedEvent(null)
  }

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(events.map((event: any) => event.category || 'General')))]

  // Filter events
  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (event.address && event.address.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xl font-semibold">Loading events...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">All Events</h2>
            <p className="text-muted-foreground">Failed to load events. Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">All Events</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of events and find your perfect match
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category as string} value={category as string}>
                      {category as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid/List */}
        {filteredEvents.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredEvents.map((event: any) => (
              <ProfessionalEventCard
                key={event.id}
                event={event}
                onBookNow={handleBookClick}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Filter className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Events
            </Button>
          </div>
        )}

        {/* Booking Modal */}
        {selectedEvent && tickets && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleCloseModal}
            event={{
              id: selectedEvent.id,
              title: selectedEvent.title,
              date: selectedEvent.startDate,
              venue: selectedEvent.venue,
              address: selectedEvent.address,
              maxTicketsPerEmail: selectedEvent.maxTicketsPerEmail,
            }}
            tickets={tickets}
            usePaymentIntegration={true} // Enable payment integration
          />
        )}
      </div>
    </section>
  )
}
