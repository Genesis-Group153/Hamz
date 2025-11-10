'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Heart,
  Share2,
  Ticket,
  Star
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  address?: string;
  featuredImage?: string;
  photos?: Array<{
    id: string;
    photoUrl: string;
    altText?: string;
    caption?: string;
    order: number;
  }>;
  ticketCategories?: Array<{
    id: string;
    categoryName: string;
    price: number;
    quantity: number;
  }>;
  vendor?: {
    id: string;
    name: string;
  };
}

interface ProfessionalEventCardProps {
  event: Event;
  onBookNow?: (event: Event) => void;
  viewMode?: 'grid' | 'list';
}

export const ProfessionalEventCard: React.FC<ProfessionalEventCardProps> = ({
  event,
  onBookNow,
  viewMode = 'grid'
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const minPrice = event.ticketCategories?.length 
    ? Math.min(...event.ticketCategories.map(t => t.price))
    : null;

  // Use featuredImage if available, otherwise use first photo's URL, otherwise default
  const imageUrl = event.featuredImage || 
                   event.photos?.[0]?.photoUrl || 
                   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop';
  
  const location = event.venue || event.address || 'Venue TBA';

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Event Image */}
          <div className="relative md:w-72 h-32 overflow-hidden shrink-0">
            <img
              src={imageUrl}
              alt={event.title}
              className="transition-transform duration-300 group-hover:scale-105"
              
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            {event.category && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary/90 text-primary-foreground border-0">
                  {event.category}
                </Badge>
              </div>
            )}
          </div>

          {/* Event Details */}
          <CardContent className="flex-1 p-6">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{location}</span>
                  </div>
                  {minPrice !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="font-bold text-lg text-primary">
                        UGX {minPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
                  <Link href={`/events/${event.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onBookNow?.(event)}
                  className="flex-1 md:flex-none"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid view (default) - Image-focused design to attract customers
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-0 bg-white rounded-xl">
      <Link href={`/events/${event.id}`} className="block">
        {/* Event Image - Prominent and well-fitted */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full max-w-full transition-transform duration-500 group-hover:scale-105"
            style={{ width: '100%', maxWidth: '100%' }}
          />
          
          {/* Category Badge - Top Left */}
          {event.category && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-white text-gray-900 border-0 font-semibold text-xs px-3 py-1 shadow-md">
                {event.category}
              </Badge>
            </div>
          )}

          {/* Price Badge - Top Right */}
          {minPrice !== null && (
            <div className="absolute top-3 right-3 z-10">
              <Badge style={{ backgroundColor: '#0079bf' }} className="text-white border-0 font-bold text-sm px-3 py-1.5 shadow-md">
                UGX {minPrice.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Event Information Section - Below Image */}
      <div className="p-4 bg-white">
        {/* Event Title */}
        <h3 className="font-bold text-lg mb-3 text-gray-900 line-clamp-2 transition-colors group-hover:text-[#0079bf]">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2">
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 shrink-0 text-gray-500" />
            <span>{formatDate(event.startDate)}</span>
            {event.startTime && (
              <>
                <span className="text-gray-400">•</span>
                <Clock className="h-4 w-4 shrink-0 text-gray-500" />
                <span>{event.startTime}</span>
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Vendor Info and Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(to right, #0079bf, #9333ea)' }}>
                {event.vendor?.name?.charAt(0) || 'V'}
              </div>
              <div>
                <p className="text-xs text-gray-500">Hosted by</p>
                <p className="text-sm font-semibold text-gray-900">{event.vendor?.name || 'Event Organizer'}</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-[#0079bf]/10 hover:text-[#0079bf]"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Get Ticket Button */}
          <Button
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookNow?.(event);
            }}
            className="w-full text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            style={{ background: 'linear-gradient(to right, #0079bf, #9333ea)' }}
          >
            <Ticket className="h-5 w-5 mr-2" />
            Get Ticket
          </Button>
        </div>
      </div>
    </Card>
  );
};
