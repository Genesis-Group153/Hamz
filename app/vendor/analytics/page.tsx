'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorDashboard } from '@/lib/hooks/useVendorDashboard';
import { useVendorEvents } from '@/lib/hooks/useEvents';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Ticket, 
  Calendar,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function AnalyticsPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useVendorDashboard();
  const { data: events = [], isLoading: eventsLoading } = useVendorEvents();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const analytics = dashboard?.analytics;
  const recentBookings = dashboard?.recentBookings || [];
  
  // Filter bookings based on time range
  const filteredBookings = useMemo(() => {
    if (timeRange === 'all') return recentBookings;
    
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return recentBookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= cutoffDate;
    });
  }, [recentBookings, timeRange]);
  
  // Calculate filtered analytics
  const filteredAnalytics = useMemo(() => {
    const totalBookings = filteredBookings.length;
    const confirmedBookings = filteredBookings.filter(b => b.status === 'CONFIRMED').length;
    const totalRevenue = filteredBookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const totalTickets = filteredBookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + (b.quantity || 0), 0);
    const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    
    return {
      totalBookings,
      confirmedBookings,
      totalRevenue,
      totalTickets,
      avgTicketPrice,
      totalEvents: analytics?.totalEvents || 0,
      totalTicketsAvailable: analytics?.totalTicketsAvailable || 0,
      conversionRate: analytics?.totalTicketsAvailable ? 
        (totalTickets / analytics.totalTicketsAvailable) * 100 : 0
    };
  }, [filteredBookings, analytics]);

  // Calculate event status distribution
  const eventStatusData = useMemo(() => {
    if (!events || events.length === 0) {
      return [{ name: 'No Events', value: 1 }];
    }
    
    const statusCounts = events.reduce((acc, event) => {
      const status = event.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
    
    return data.length > 0 ? data : [{ name: 'No Events', value: 1 }];
  }, [events]);

  // Calculate revenue by event
  const revenueByEvent = useMemo(() => {
    if (!events || events.length === 0) {
      return [];
    }
    
    const eventsWithRevenue = events
      .filter(e => e.revenue && e.revenue > 0)
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 10)
      .map(event => ({
        name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
        revenue: event.revenue || 0,
        bookings: event.totalBookings || 0,
      }));
    
    return eventsWithRevenue;
  }, [events]);

  // Calculate bookings trend based on selected time range
  const bookingsTrend = useMemo(() => {
    const trendData = [];
    const today = new Date();
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Filter bookings for this day
      const dayBookings = filteredBookings.filter(b => {
        if (!b.createdAt) return false;
        const bookingDate = new Date(b.createdAt);
        return bookingDate.toDateString() === date.toDateString();
      });

      trendData.push({
        date: dateStr,
        bookings: dayBookings.length,
        revenue: dayBookings
          .filter(b => b.status === 'CONFIRMED')
          .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0),
      });
    }
    
    // If all days have 0 revenue, show a message
    const hasAnyData = trendData.some(day => day.bookings > 0 || day.revenue > 0);
    
    return { data: trendData, hasData: hasAnyData };
  }, [filteredBookings, timeRange]);

  // Color schemes
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const isLoading = dashboardLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Comprehensive insights into your event performance</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-600/10"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 sm:p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Total Revenue</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {filteredAnalytics.totalRevenue.toLocaleString()}
              <span className="text-sm sm:text-base text-gray-500 ml-1">UGX</span>
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 shrink-0" />
              <span className="text-xs text-gray-600 font-medium">
                {timeRange === 'all' ? 'All time' : timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </span>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10"></div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-blue-600/10"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Total Bookings</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {filteredAnalytics.totalBookings.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-blue-600 font-medium">
                {filteredAnalytics.confirmedBookings} confirmed
              </span>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>
          </CardContent>
        </Card>

        {/* Tickets Sold */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-purple-600/10"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 sm:p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 shrink-0" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Tickets Sold</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {filteredAnalytics.totalTickets.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-600">
                of {filteredAnalytics.totalTicketsAvailable.toLocaleString()} available
              </span>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-10 -mt-10"></div>
          </CardContent>
        </Card>

        {/* Avg Ticket Price */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-orange-600/10"></div>
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 sm:p-3 bg-yellow-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 shrink-0" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Avg Ticket Price</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {filteredAnalytics.avgTicketPrice.toFixed(0)}
              <span className="text-sm sm:text-base text-gray-500 ml-1">UGX</span>
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-600">
                {filteredAnalytics.conversionRate.toFixed(1)}% conversion
              </span>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full -mr-10 -mt-10"></div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-md">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg">
                Revenue & Bookings Trend
              </span>
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : timeRange === '90d' ? 'Last 90 Days' : 'All Time'}
            </p>
          </CardHeader>
          <CardContent>
            {!bookingsTrend.hasData ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No bookings in the {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : timeRange === '90d' ? 'last 90 days' : 'selected period'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    All-time revenue: UGX {analytics?.totalRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Try selecting a different time range</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bookingsTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '12px' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    name="Bookings"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="#86efac"
                    name="Revenue (UGX)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Event Status Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg">
                Event Status Distribution
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Top Performing Events */}
        <Card className="border-0 shadow-md">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg">
                Top 10 Events by Revenue
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByEvent.length === 0 ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No revenue data available</p>
                  <p className="text-sm text-gray-400 mt-2">Create events and start selling tickets to see analytics</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueByEvent} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis type="category" dataKey="name" width={150} stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue (UGX)" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
              Event Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Active Events</span>
              <span className="text-lg font-bold text-green-600">{analytics?.activeEvents || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Draft Events</span>
              <span className="text-lg font-bold text-yellow-600">{analytics?.draftEvents || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Total Events</span>
              <span className="text-lg font-bold text-blue-600">{analytics?.totalEvents || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-purple-600 shrink-0" />
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Confirmed</span>
              <span className="text-lg font-bold text-green-600">{filteredAnalytics.confirmedBookings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Pending</span>
              <span className="text-lg font-bold text-yellow-600">{filteredAnalytics.totalBookings - filteredAnalytics.confirmedBookings}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Total Bookings</span>
              <span className="text-lg font-bold text-blue-600">{filteredAnalytics.totalBookings}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="p-4 sm:p-6 border-b bg-white">
            <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600 shrink-0" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Period Revenue</span>
              <span className="text-sm font-bold text-green-600">
                {filteredAnalytics.totalRevenue.toLocaleString()}
                <span className="text-xs ml-0.5">UGX</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Tickets Sold</span>
              <span className="text-lg font-bold text-blue-600">{filteredAnalytics.totalTickets.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Avg Price</span>
              <span className="text-sm font-bold text-purple-600">
                {filteredAnalytics.avgTicketPrice.toFixed(0)}
                <span className="text-xs ml-0.5">UGX</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="p-4 sm:p-6 border-b bg-white">
          <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
            </div>
            <span>
              Recent Bookings ({filteredBookings.length} {timeRange === 'all' ? 'total' : 'in period'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No bookings in this period</p>
                <p className="text-sm text-gray-400 mt-2">Try selecting a different time range</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.slice(0, 10).map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-3 text-sm text-gray-900 font-medium truncate max-w-[200px]">{booking.eventTitle}</td>
                        <td className="px-4 xl:px-6 py-3 text-sm text-gray-600 truncate max-w-[150px]">{booking.customerName}</td>
                        <td className="px-4 xl:px-6 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {booking.quantity}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-3 text-sm font-semibold text-gray-900">
                          {booking.totalPrice?.toLocaleString()}
                          <span className="text-xs text-gray-500 ml-0.5">UGX</span>
                        </td>
                        <td className="px-4 xl:px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-3 text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredBookings.slice(0, 10).map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Event & Status */}
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900 flex-1 pr-2">{booking.eventTitle}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Customer */}
                    <p className="text-sm text-gray-600 mb-3">{booking.customerName}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="text-sm font-bold text-blue-700">{booking.quantity}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="text-sm font-bold text-green-700">
                          {booking.totalPrice?.toLocaleString()}
                          <span className="text-xs ml-0.5">UGX</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Date</p>
                        <p className="text-xs font-medium text-gray-700">
                          {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

