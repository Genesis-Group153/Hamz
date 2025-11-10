'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Calendar, MapPin, Clock, User, Mail, Phone, QrCode, Download, Share2 } from 'lucide-react';
import { useBookingByReference } from '@/lib/hooks/useBookings';
import { toast } from 'sonner';

export default function TicketViewPage() {
  const params = useParams();
  const reference = params.reference as string;
  const { data: booking, isLoading, error } = useBookingByReference(reference);

  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  const handleDownloadTicket = () => {
    // Create a downloadable version of the ticket
    const ticketData = {
      bookingReference: booking?.bookingReference,
      eventTitle: booking?.event?.title || 'Unknown Event',
      customerName: booking?.customerName,
      ticketCodes: booking?.ticketCodes,
    };
    
    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${booking?.bookingReference}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Ticket downloaded successfully!');
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${booking?.event?.title || 'Event'}`,
        text: `Your ticket for ${booking?.event?.title || 'Event'} on ${booking?.event?.date || 'TBA'}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ticket link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-4 bg-white shadow-xl border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-6">
              The ticket you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTicketCode = booking.ticketCodes?.[currentTicketIndex];
  // Use backend-provided QR codes (they're already base64-encoded PNG images)
  const qrCodeBase64 = booking.qrCodes?.[currentTicketIndex];
  const currentQrCode = qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Ticket Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Event Ticket</h1>
          <p className="text-gray-600">Present this QR code at the entrance</p>
        </div>

        {/* Main Ticket Card */}
        <Card className="bg-white shadow-xl border-gray-200 overflow-hidden mb-6">
          {/* Status Badge */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">CONFIRMED</span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {booking.status}
            </Badge>
          </div>

          <CardContent className="p-6">
            {/* QR Code Section */}
            <div className="text-center mb-6 pb-6 border-b border-gray-200">
              {currentQrCode ? (
                <div className="inline-block p-4 bg-white rounded-2xl shadow-md border-4 border-gray-100">
                  <img 
                    src={currentQrCode}
                    alt={`QR Code for ticket ${currentTicketIndex + 1}`}
                    className="w-56 h-56 sm:w-64 sm:h-64"
                  />
                </div>
              ) : (
                <div className="inline-block p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Generating QR Code...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ticket Code */}
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-xs font-medium text-blue-700">TICKET CODE</span>
                <span className="text-lg font-bold text-blue-900 tracking-wider font-mono">
                  {currentTicketCode || 'N/A'}
                </span>
              </div>
            </div>

            {/* Event Info Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Event Details</h3>
              
              {/* Event Title */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Event</p>
                  <p className="text-gray-900 font-semibold">{booking.event?.title || 'Event Name'}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Date & Time</p>
                  <p className="text-gray-900 font-semibold">
                    {booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'TBA'}
                  </p>
                  {booking.event?.date && (
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(booking.event.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Venue</p>
                  <p className="text-gray-900 font-semibold">
                    {booking.event?.venue || booking.event?.location || 'To Be Announced'}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Info Section */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Booking Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Attendees</p>
                  <p className="text-2xl font-bold text-gray-900">{booking.quantity}</p>
                  <p className="text-xs text-gray-600">{booking.quantity === 1 ? 'Person' : 'People'}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">UGX {booking.totalPrice?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-600">Paid</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Booking Reference</p>
                  <p className="text-sm font-mono font-bold text-gray-900">{booking.bookingReference}</p>
                </div>
                <Badge variant="outline" className="font-semibold border-blue-600 text-blue-600">
                  {booking.deliveryMethod || 'EMAIL'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Navigation for Multiple Tickets */}
        {booking.ticketCodes && booking.ticketCodes.length > 1 && (
          <Card className="bg-white shadow-md border-gray-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTicketIndex(Math.max(0, currentTicketIndex - 1))}
                  disabled={currentTicketIndex === 0}
                  className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ← Previous
                </Button>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    Ticket {currentTicketIndex + 1} of {booking.ticketCodes.length}
                  </p>
                  <p className="text-xs text-gray-500">Swipe to view all tickets</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTicketIndex(Math.min(booking.ticketCodes!.length - 1, currentTicketIndex + 1))}
                  disabled={currentTicketIndex === booking.ticketCodes!.length - 1}
                  className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={handleDownloadTicket}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-base font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download
          </Button>
          
          <Button 
            onClick={handleShareTicket}
            variant="outline"
            className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 rounded-xl py-6 text-base font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share
          </Button>
        </div>

        {/* Important Instructions */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span>Save this page or take a screenshot for offline access</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span>Bring a valid ID matching the booking name</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span>Arrive 15-30 minutes before the event starts</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <span>Each QR code is valid for <strong>one-time use only</strong></span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pb-4">
          <p className="text-sm text-gray-500">
            Questions? Contact support at{' '}
            <a href="mailto:support@events.com" className="text-blue-600 hover:underline font-medium">
              support@events.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
