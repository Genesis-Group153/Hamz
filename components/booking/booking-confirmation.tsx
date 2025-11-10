'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Ticket, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBookingByReference } from '@/lib/hooks/useBookings';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BookingConfirmationProps {
  bookingReference: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingReference,
  eventTitle,
  eventDate,
  eventLocation,
}) => {
  const { data: booking, isLoading, error } = useBookingByReference(bookingReference);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="text-white text-lg">Loading booking details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Booking Not Found</h2>
          <p className="text-gray-400 mb-6">We couldn't find the booking details.</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-orange-500 text-black hover:bg-orange-600"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewEvent = () => {
    // You could navigate back to the event page or implement this
    router.back();
  };

  const handleDownloadTicket = () => {
    // Implement ticket download functionality
    toast.info('Ticket download feature coming soon!');
  };

  const handleShareBooking = () => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `My Booking for ${eventTitle}`,
        text: `I just booked ${booking?.quantity || 1} ticket(s) for ${eventTitle}!`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-500/20 border border-green-500/30 rounded-full p-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-300">
            Your tickets have been successfully booked. You'll receive them via your chosen delivery method.
          </p>
        </div>
        <Badge className="bg-orange-500 text-black hover:bg-orange-600 px-4 py-2">
          Reference: {booking.bookingReference}
        </Badge>
      </div>

      {/* Booking Details */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-medium mb-2">Event Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">
                    {eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Event Date'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-gray-300">{eventLocation || 'Event Location'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Ticket Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Category:</span>
                  <span className="text-white">Ticket Category {booking.ticketCategoryId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quantity:</span>
                  <span className="text-white">{booking.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Price:</span>
                  <span className="text-orange-500 font-semibold">UGX {booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-gray-300">Name:</span>
              <span className="text-white ml-2">{booking.customerName}</span>
            </div>
            
            {booking.customerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">Email:</span>
                <span className="text-white">{booking.customerEmail}</span>
              </div>
            )}
            
            {booking.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">Phone:</span>
                <span className="text-white">{booking.customerPhone}</span>
              </div>
            )}
            
            <div>
              <span className="text-gray-300">Delivery Method:</span>
              <span className="text-white ml-2">{booking.deliveryMethod}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium">Check Your {booking.deliveryMethod === 'EMAIL' ? 'Email' : booking.deliveryMethod === 'SMS' ? 'SMS' : 'Email & SMS'}</p>
                <p className="text-gray-300">Your tickets will be delivered to your chosen contact method shortly.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium">Save Your Booking Reference</p>
                <p className="text-gray-300">Keep this reference number safe: <strong>{booking.bookingReference}</strong></p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium">Arrive Early</p>
                <p className="text-gray-300">Please arrive at the venue 15-30 minutes before the event starts.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleGoHome}
          variant="outline"
          className="flex-1 border-gray-600 text-white hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        
        <Button
          onClick={handleDownloadTicket}
          variant="outline"
          className="flex-1 border-gray-600 text-white hover:bg-gray-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Tickets
        </Button>
        
        <Button
          onClick={handleShareBooking}
          variant="outline"
          className="flex-1 border-gray-600 text-white hover:bg-gray-700"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Booking
        </Button>
      </div>
    </div>
  );
};
