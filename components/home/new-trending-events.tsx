'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ProfessionalEventCard } from '@/components/events/professional-event-card'
import { BookingModal } from '@/components/booking/booking-modal'
import { Button } from '@/components/ui/button'
import { usePublicEvents } from '@/lib/hooks/useEvents'
import { useEventTickets } from '@/lib/hooks/useTickets'
import { SkeletonLoader, EventsGridSkeleton } from '@/components/ui/skeleton-loader'
import { TrendingUp } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0
  }
}

export const NewTrendingEvents = () => {
  const { data: events = [], isLoading, error } = usePublicEvents()
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const { data: tickets } = useEventTickets(selectedEvent?.id || 0)

  const handleBookClick = (event: any) => {
    setSelectedEvent(event)
    setIsBookingModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsBookingModalOpen(false)
    setSelectedEvent(null)
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Trending Events</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular events happening near you
            </p>
          </div>
          
          <EventsGridSkeleton count={6} />
          
          <div className="text-center mt-12">
            <div className="inline-block h-10 w-40 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Trending Events</h2>
            <p className="text-muted-foreground">Failed to load events. Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Trending Events</h2>
            <p className="text-muted-foreground">No trending events available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Trending Events</h2>
          </motion.div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular events happening near you
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {events.slice(0, 8).map((event: any, index: number) => (
            <motion.div
              key={event.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <ProfessionalEventCard
                event={event}
                onBookNow={() => handleBookClick(event)}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="lg" onClick={() => window.location.href = '/events'}>
              View All Events
            </Button>
          </motion.div>
        </motion.div>

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
