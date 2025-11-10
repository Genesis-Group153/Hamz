'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStaffProfile, useStaffEvents, useStaffLogout } from '@/lib/hooks/useStaff';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  QrCode,
  LogOut,
  User,
  Building2,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Ticket,
  Scan,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StaffPortal() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const router = useRouter();
  const logout = useStaffLogout();

  const { data: staffProfile, isLoading: profileLoading, error: profileError } = useStaffProfile();
  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useStaffEvents();

  useEffect(() => {
    // Check if staff is logged in
    const token = localStorage.getItem('staff_access_token');
    if (!token) {
      router.push('/staff/login');
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  const handleScanTickets = (eventId: string) => {
    router.push(`/staff/scan-tickets?event=${eventId}`);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Loading staff portal...</p>
        </div>
      </div>
    );
  }

  if (profileError || !staffProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Unable to load your staff profile. Please try logging in again.
            </p>
            <Button 
              onClick={() => router.push('/staff/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 shadow-md active:scale-95 transition-all"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md shrink-0">
                <Scan className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">Staff Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600">Welcome, {staffProfile.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1 px-3 py-1">
                <Shield className="h-3 w-3" />
                {staffProfile.position || 'Staff Member'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="shadow-sm hover:shadow active:scale-95 transition-all"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Staff Info */}
        <Card className="mb-6 sm:mb-8 border-0 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-600/10"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Your Profile</h2>
                <p className="text-xs sm:text-sm text-gray-600">Staff member information and permissions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">{staffProfile.name}</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="truncate">{staffProfile.vendor?.companyName || staffProfile.vendor?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>{staffProfile.position || 'Staff Member'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {staffProfile.permissions.map((permission) => (
                    <Badge key={permission} className="bg-green-100 text-green-700 border-green-300 text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="border-0 shadow-md">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Your Events</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Select an event to start scanning tickets
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">Loading events...</p>
                </div>
              </div>
            ) : eventsError ? (
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-bold text-red-900 mb-2">Failed to load events</h3>
                <p className="text-red-700 text-sm mb-4">
                  There was an error loading your events. Please try again.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Events Available</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  There are currently no events assigned to you for ticket scanning. Contact your manager for access.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-5 sm:p-6 relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-gray-900 line-clamp-2 flex-1 pr-2 text-base sm:text-lg">{event.title}</h3>
                        <Badge className={`shrink-0 ${
                          event.status === 'ACTIVE' || event.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      {/* Event Details */}
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                          <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                          <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                          </div>
                          <span>
                            {event.startTime || 'TBA'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                          <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <span className="truncate">{event.venue || 'Venue TBA'}</span>
                        </div>
                      </div>

                      {/* Ticket Categories */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-900">Ticket Categories</span>
                          <Badge variant="outline" className="text-xs">
                            {event.ticketCategories?.length || 0}
                          </Badge>
                        </div>
                        
                        {event.ticketCategories && event.ticketCategories.length > 0 && (
                          <div className="space-y-1.5">
                            {event.ticketCategories.slice(0, 2).map((category: any) => (
                              <div key={category.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-700 font-medium truncate pr-2">{category.categoryName}</span>
                                <span className="text-gray-600 shrink-0">UGX {category.price?.toLocaleString()}</span>
                              </div>
                            ))}
                            {event.ticketCategories.length > 2 && (
                              <p className="text-xs text-gray-500 italic">
                                +{event.ticketCategories.length - 2} more
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Scan Button */}
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md group-hover:shadow-lg transition-all active:scale-95" 
                        onClick={() => handleScanTickets(event.id)}
                        disabled={!staffProfile.permissions.includes('SCAN_TICKETS')}
                      >
                        <Scan className="h-4 w-4 mr-2" />
                        Start Scanning
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
