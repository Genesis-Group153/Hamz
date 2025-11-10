'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSingleEvent } from '@/lib/hooks/useEvents';
import { useEventTickets } from '@/lib/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft, 
  Share2, 
  Heart,
  Ticket,
  Loader2
} from 'lucide-react';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { useRouter } from 'next/navigation';
import { BookingModal } from '@/components/booking/booking-modal';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: event, isLoading: eventLoading, error: eventError } = useSingleEvent(eventId);
  const { data: tickets, isLoading: ticketsLoading, error: ticketsError } = useEventTickets(eventId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (startTime: string, endTime?: string) => {
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  const handleBookClick = () => {
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ProfessionalHeader />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-foreground text-lg">Loading event details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="min-h-screen bg-background">
        <ProfessionalHeader />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or is no longer available.</p>
            <Button
              onClick={() => router.push('/')}
              variant="default"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <ProfessionalHeader />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Available</h1>
            <p className="text-muted-foreground mb-6">This event is not currently available for viewing.</p>
            <Button
              onClick={() => router.push('/')}
              variant="default"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Event Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Event Image */}
          <div className="lg:col-span-2">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg border border-border">
              <img
                src={event.featuredImage || event.photos?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/90 text-foreground hover:bg-background border-0 backdrop-blur-sm"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background/90 text-foreground hover:bg-background border-0 backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 mb-3">
                  {event.category || 'General'}
                </Badge>
                <h1 className="text-3xl font-bold text-card-foreground mb-4">{event.title}</h1>
                {event.shortDescription && (
                  <p className="text-muted-foreground text-lg leading-relaxed">{event.shortDescription}</p>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-card-foreground font-medium">{formatDate(event.startDate)}</p>
                    {event.endDate && event.endDate !== event.startDate && (
                      <p className="text-muted-foreground text-sm">to {formatDate(event.endDate)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-card-foreground font-medium">
                      {formatTime(event.startTime || 'TBA', event.endTime)}
                    </p>
                    {event.timezone && (
                      <p className="text-muted-foreground text-sm">{event.timezone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-card-foreground font-medium">{event.venue || 'Venue TBA'}</p>
                    <p className="text-muted-foreground text-sm">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-card-foreground font-medium">
                      {event.maxCapacity ? `${event.maxCapacity} capacity` : 'Capacity TBA'}
                    </p>
                    {event.minAge && (
                      <p className="text-muted-foreground text-sm">Age {event.minAge}+</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Organizer */}
              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm mb-2">Organized by</p>
                <p className="text-card-foreground font-medium">{event.vendor?.name || 'Event Organizer'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {event && tickets && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleCloseModal}
            event={{
              id: event.id,
              title: event.title,
              date: event.date,
              venue: event.venue,
              address: event.address,
              maxTicketsPerEmail: event.maxTicketsPerEmail,
            }}
            tickets={tickets}
            usePaymentIntegration={true} // Enable payment integration
          />
        )}

        {/* Event Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-card-foreground">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description || 'No description available for this event.'}
                </p>
              </CardContent>
            </Card>

            {/* Event Photos */}
            {event.photos && event.photos.length > 1 && (
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Event Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.photos.slice(1).map((photo: any, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                        <img
                          src={photo.photoUrl}
                          alt={photo.altText || `Event photo ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-card-foreground">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {event.instructions && (
                  <div>
                    <h4 className="text-card-foreground font-medium mb-2">Instructions</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{event.instructions}</p>
                  </div>
                )}
                
                {event.dressCode && (
                  <div>
                    <h4 className="text-card-foreground font-medium mb-2">Dress Code</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{event.dressCode}</p>
                  </div>
                )}

                {event.requiredItems && (
                  <div>
                    <h4 className="text-card-foreground font-medium mb-2">Required Items</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{event.requiredItems}</p>
                  </div>
                )}

                {event.tags && (
                  <div>
                    <h4 className="text-card-foreground font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(event.tags) 
                        ? event.tags 
                        : event.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
                      ).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-border text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policies */}
            {(event.cancellationPolicy || event.refundPolicy) && (
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {event.cancellationPolicy && (
                    <div>
                      <h4 className="text-card-foreground font-medium mb-2">Cancellation Policy</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{event.cancellationPolicy}</p>
                    </div>
                  )}
                  
                  {event.refundPolicy && (
                    <div>
                      <h4 className="text-card-foreground font-medium mb-2">Refund Policy</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{event.refundPolicy}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tickets Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-border shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Available Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : ticketsError ? (
                  <p className="text-destructive text-sm">Failed to load tickets</p>
                ) : !tickets || tickets.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tickets available</p>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-card-foreground font-medium">{ticket.categoryName}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              ticket.status === 'AVAILABLE' 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : ticket.status === 'SOLD_OUT'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-2xl font-bold text-primary mb-3">
                          UGX {ticket.price.toFixed(2)}
                        </p>
                        
                        {ticket.description && (
                          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{ticket.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                          <span>{ticket.availableQuantity} available</span>
                          <span>{ticket.soldQuantity} sold</span>
                        </div>
                        
                        <Button
                          className="w-full"
                          disabled={ticket.status !== 'AVAILABLE'}
                          onClick={ticket.status === 'AVAILABLE' ? handleBookClick : undefined}
                        >
                          {ticket.status === 'AVAILABLE' ? 'Book Tickets' : 
                           ticket.status === 'SOLD_OUT' ? 'Sold Out' : 'Unavailable'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ProfessionalFooter />
    </div>
  );
}
