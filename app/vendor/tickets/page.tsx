'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketManagement } from '@/components/vendor/ticket-management';
import { useVendorEvents } from '@/lib/hooks/useEvents';
import { ArrowLeft, Calendar, MapPin, Users, Eye, Ticket, Plus, Loader2, AlertCircle, Clock } from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromQuery = searchParams.get('eventId');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventIdFromQuery || null);
  const { data: events, isLoading, error } = useVendorEvents();

  const selectedEvent = events?.find(event => event.id === selectedEventId);

  // Update selectedEventId when query parameter changes
  useEffect(() => {
    if (eventIdFromQuery) {
      setSelectedEventId(eventIdFromQuery);
    }
  }, [eventIdFromQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your events...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load events</h3>
              <p className="text-gray-600 text-sm mb-6">There was an error loading your events. Please try again.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shadow-sm hover:shadow active:scale-95 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Ticket Management</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage ticket categories for your events
              </p>
            </div>
          </div>
        </div>

        {!selectedEventId ? (
          /* Event Selection */
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="p-4 sm:p-6 border-b bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 shrink-0" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Select an Event</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      Choose an event to manage its ticket categories
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {!events || events.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                    Create an event first to start managing tickets and ticket categories.
                  </p>
                  <Button
                    onClick={() => router.push('/vendor/events')}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98] bg-gradient-to-r from-blue-50 to-purple-50"
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <CardContent className="p-5 sm:p-6 relative">
                      {/* Row Layout */}
                      <div className="flex flex-row items-start gap-6">
                        {/* Left Side - Event Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header with Title and Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0 pr-4">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                {event.title}
                              </h3>
                              {event.shortDescription && (
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {event.shortDescription}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={`shrink-0 ${
                                event.status === 'PUBLISHED'
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                              }`}
                            >
                              {event.status}
                            </Badge>
                          </div>

                          {/* Event Information Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-gray-600 block mb-0.5 text-xs">Date</span>
                                <span className="text-gray-900 text-sm">
                                  {new Date(event.startDate).toLocaleDateString()} at {event.startTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                                <MapPin className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-gray-600 block mb-0.5 text-xs">Location</span>
                                <span className="text-gray-900 text-sm truncate">{event.venue || event.address}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-gray-700">
                              <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-gray-600 block mb-0.5 text-xs">Bookings</span>
                                <span className="text-gray-900 text-sm">{event.totalBookings || 0} tickets sold</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm group-hover:shadow-md transition-all"
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            Manage Tickets
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Ticket Management for Selected Event */
          <div className="space-y-6">
            {/* Event Header */}
            <Card className="border-0 shadow-md relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-5 sm:p-6 relative">
                <div className="flex flex-col gap-5">
                  {/* Back Button & Status */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => {
                        setSelectedEventId(null);
                        router.push('/vendor/tickets');
                      }}
                      variant="outline"
                      size="sm"
                      className="shadow-sm hover:shadow active:scale-95 transition-all"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Events
                    </Button>
                    <Badge
                      className={`${
                        selectedEvent?.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      }`}
                    >
                      {selectedEvent?.status || 'DRAFT'}
                    </Badge>
                  </div>

                  {/* Event Info Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {selectedEvent?.title}
                      </h2>
                      
                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-600 block mb-1 text-xs">Date</span>
                            <span className="text-gray-900">
                              {selectedEvent?.startDate && new Date(selectedEvent.startDate).toLocaleDateString()}
                              {selectedEvent?.startTime && ` at ${selectedEvent.startTime}`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                            <MapPin className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-600 block mb-1 text-xs">Location</span>
                            <span className="text-gray-900 truncate">{selectedEvent?.venue || selectedEvent?.address || 'TBA'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <div className="p-2 bg-green-100 rounded-lg shrink-0">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-600 block mb-1 text-xs">Bookings</span>
                            <span className="text-gray-900">{selectedEvent?.totalBookings || 0} tickets sold</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
              </CardContent>
            </Card>

            {/* Ticket Management Component */}
            {selectedEvent && (
              <TicketManagement
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
