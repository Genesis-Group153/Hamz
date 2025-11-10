'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVendorEvents } from '@/lib/hooks/useEvents';
import { useVendorDashboard } from '@/lib/hooks/useVendorDashboard';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  DollarSign,
  Eye,
  Plus,
  BarChart3,
  Clock,
  MapPin,
  QrCode,
  UserPlus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading: dashboardLoading, error: dashboardError } = useVendorDashboard();
  const { data: events, isLoading: eventsLoading } = useVendorEvents();

  // Use real analytics data from API
  const analytics = dashboard?.analytics || {
    totalEvents: 0,
    activeEvents: 0,
    draftEvents: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    recentBookings: 0,
    avgTicketPrice: 0,
    conversionRate: 0,
    totalTicketsSold: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
  };

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Start planning a new event',
      icon: Plus,
      href: '/vendor/events',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Manage Staff',
      description: 'Add or manage team members',
      icon: UserPlus,
      href: '/vendor/staff',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Scan Tickets',
      description: 'Validate event tickets',
      icon: QrCode,
      href: '/vendor/scan-tickets',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: BarChart3,
      href: '/vendor/analytics',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const recentEvents = events?.slice(0, 5) || [];
  const recentBookings = dashboard?.recentBookings || [];

  // Loading state
  if (dashboardLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    console.error('Dashboard error details:', dashboardError);
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">Error loading dashboard data</p>
              <p className="text-red-500 text-sm mb-4">
                {(dashboardError as any)?.response?.data?.message || (dashboardError as any)?.message || 'Please try again'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Welcome back, {user?.name || 'Vendor'} 👋
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Here's what's happening with your events today
            </p>
          </div>
          
          <Link href="/vendor/events" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Events */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">
                Total Events
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalEvents}</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <span className="text-green-600 font-medium">{analytics.activeEvents} active</span> • {analytics.draftEvents} draft
              </p>
            </CardContent>
          </Card>

          {/* Total Bookings */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-emerald-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">
                Total Bookings
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalBookings}</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <span className="text-green-600 font-medium">{analytics.confirmedBookings} confirmed</span> • {analytics.pendingBookings} pending
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">
                Total Revenue
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                UGX {analytics.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="text-green-600 font-medium">UGX {analytics.monthlyRevenue.toLocaleString()}</span> this month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Sold */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700">
                Tickets Sold
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalTicketsSold}</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <span className="text-blue-600 font-medium">{analytics.conversionRate.toFixed(1)}%</span> conversion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg sm:text-xl">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.href}>
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg cursor-pointer bg-white p-4 sm:p-6 min-h-[140px] sm:min-h-[160px] active:scale-95">
                      <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-br ${action.gradient} opacity-10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-150 transition-transform`}></div>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${action.gradient} flex items-center justify-center mb-3 sm:mb-4 shadow-md`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-base sm:text-lg">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Recent Events */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-lg sm:text-xl">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                Recent Events
              </CardTitle>
              <Link href="/vendor/events">
                <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No events yet</p>
                  <Link href="/vendor/events">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">{event.title}</h4>
                          <Badge 
                            variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 border-green-200' : 
                              event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              event.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">{new Date(event.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">{event.venue || 'TBA'}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/vendor/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-3 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-lg sm:text-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No recent bookings</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.bookingReference} className="flex items-start sm:items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{booking.customerName}</p>
                        <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 truncate">{booking.eventTitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">UGX {booking.amount.toLocaleString()}</p>
                        <Badge 
                          variant={booking.status === 'CONFIRMED' ? 'default' : booking.status === 'PENDING' ? 'secondary' : 'destructive'}
                          className={`text-xs mt-0.5 sm:mt-1 ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border-green-200' : 
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                            'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link href="/vendor/bookings">
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm">
                        View All Bookings
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg sm:text-xl">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              Upcoming Events
            </CardTitle>
            <Link href="/vendor/events">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm">
                Manage Events
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No upcoming events</p>
                <Link href="/vendor/events">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="group border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-purple-300 hover:shadow-lg transition-all bg-white">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base lg:text-lg group-hover:text-purple-600 transition-colors flex-1">{event.title}</h4>
                      <Badge 
                        variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className={`text-xs ml-2 ${
                          event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 border-green-200' : 
                          event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          event.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{event.venue || 'Venue TBA'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/vendor/events/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">View</span>
                        </Button>
                      </Link>
                      <Link href={`/vendor/scan-tickets?event=${event.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm">
                          <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Scan</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
