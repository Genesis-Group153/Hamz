'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVendorBookings } from '@/lib/hooks/useVendorBookings';
import { useVendorEvents } from '@/lib/hooks/useEvents';
import { 
  Loader2, 
  Search, 
  Filter, 
  Download, 
  Ticket, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  QrCode,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  FileText,
  Mail
} from 'lucide-react';

export default function VendorBookingsPage() {
  const [filters, setFilters] = useState({
    eventId: '',
    ticketCategoryId: '',
    status: 'ALL' as 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED',
    scanStatus: 'ALL' as 'ALL' | 'SCANNED' | 'UNSCANNED',
    search: '',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: bookingsData, isLoading, error, refetch } = useVendorBookings(filters);
  const { data: events } = useVendorEvents();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate stats comparison (last 7 days vs previous 7 days)
  const statsComparison = useMemo(() => {
    if (!bookingsData) return null;
    
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const last7DaysBookings = bookingsData.bookings.filter(b => 
      new Date(b.createdAt) >= last7Days
    );
    const previous7DaysBookings = bookingsData.bookings.filter(b => 
      new Date(b.createdAt) >= previous7Days && new Date(b.createdAt) < last7Days
    );
    
    const last7DaysRevenue = last7DaysBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const previous7DaysRevenue = previous7DaysBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const bookingsChange = previous7DaysBookings.length === 0 ? 100 : 
      ((last7DaysBookings.length - previous7DaysBookings.length) / previous7DaysBookings.length) * 100;
    const revenueChange = previous7DaysRevenue === 0 ? 100 :
      ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100;
    
    return {
      bookingsChange: Math.round(bookingsChange),
      revenueChange: Math.round(revenueChange),
      last7DaysBookings: last7DaysBookings.length,
      last7DaysRevenue
    };
  }, [bookingsData]);

  // Get unique ticket categories from selected event
  const ticketCategories = useMemo(() => {
    if (!filters.eventId || !bookingsData) return [];
    const categories = new Set<{ id: string; name: string }>();
    bookingsData.bookings.forEach(booking => {
      if (booking.eventId === filters.eventId) {
        categories.add({
          id: booking.ticketCategoryId,
          name: booking.ticketCategoryName
        });
      }
    });
    return Array.from(categories);
  }, [filters.eventId, bookingsData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset ticket category if event changes
      ...(key === 'eventId' && { ticketCategoryId: '' })
    }));
  };

  const handleExport = () => {
    if (!bookingsData || bookingsData.bookings.length === 0) return;
    
    // Create CSV content
    const headers = ['Booking Ref', 'Event', 'Category', 'Customer', 'Email', 'Phone', 'Quantity', 'Amount', 'Status', 'Scanned', 'Unscanned', 'Date'];
    const rows = bookingsData.bookings.map(booking => [
      booking.bookingReference,
      booking.eventTitle,
      booking.ticketCategoryName,
      booking.customerName,
      booking.customerEmail,
      booking.customerPhone || 'N/A',
      booking.quantity,
      `UGX {booking.totalPrice.toFixed(2)}`,
      booking.status,
      booking.ticketsScanned,
      booking.ticketsUnscanned,
      new Date(booking.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      eventId: '',
      ticketCategoryId: '',
      status: 'ALL',
      scanStatus: 'ALL',
      search: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'PENDING':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 font-semibold">Error loading bookings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Bookings Management</h1>
            <p className="text-sm sm:text-base text-gray-600">View and manage all your event bookings</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            variant="outline"
            className="w-full sm:w-auto shadow-sm hover:shadow active:scale-95 transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Quick Stats Comparison Banner */}
        {statsComparison && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">Last 7 Days Bookings</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{statsComparison.last7DaysBookings}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                    statsComparison.bookingsChange > 0 ? 'bg-green-100' : 
                    statsComparison.bookingsChange < 0 ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {statsComparison.bookingsChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                    ) : statsComparison.bookingsChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-600 shrink-0" />
                    )}
                    <span className={`text-sm font-bold ${
                      statsComparison.bookingsChange > 0 ? 'text-green-700' : 
                      statsComparison.bookingsChange < 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {statsComparison.bookingsChange > 0 ? '+' : ''}{statsComparison.bookingsChange}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">vs. previous 7 days</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4 sm:p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">Last 7 Days Revenue</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {statsComparison.last7DaysRevenue.toLocaleString()}
                      <span className="text-sm text-gray-500 ml-1">UGX</span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                    statsComparison.revenueChange > 0 ? 'bg-green-100' : 
                    statsComparison.revenueChange < 0 ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {statsComparison.revenueChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                    ) : statsComparison.revenueChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-600 shrink-0" />
                    )}
                    <span className={`text-sm font-bold ${
                      statsComparison.revenueChange > 0 ? 'text-green-700' : 
                      statsComparison.revenueChange < 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {statsComparison.revenueChange > 0 ? '+' : ''}{statsComparison.revenueChange}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">vs. previous 7 days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        {bookingsData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{bookingsData.total}</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-green-600/10"></div>
              <CardContent className="p-4 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 sm:p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Total Revenue</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {bookingsData.totalRevenue.toLocaleString()}
                  <span className="text-sm sm:text-base text-gray-500 ml-1">UGX</span>
                </p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            {/* Tickets Sold */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-purple-600/10"></div>
              <CardContent className="p-4 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 sm:p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 shrink-0" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Tickets Sold</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{bookingsData.totalTicketsSold}</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            {/* Scanned */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 sm:p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Tickets Scanned</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{bookingsData.totalScanned}</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10"></div>
              </CardContent>
            </Card>

            {/* Unscanned */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-orange-600/10"></div>
              <CardContent className="p-4 sm:p-6 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 sm:p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Pending Scan</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{bookingsData.totalUnscanned}</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full -mr-10 -mt-10"></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader className="border-b bg-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                </div>
                <span>Filters</span>
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1 sm:flex-none text-xs sm:text-sm">
                  Clear All
                </Button>
                <Button size="sm" onClick={handleExport} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2 shrink-0" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Reference, name, or email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                <select
                  value={filters.eventId}
                  onChange={(e) => handleFilterChange('eventId', e.target.value)}
                  className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Events</option>
                  {events?.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ticket Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.ticketCategoryId}
                  onChange={(e) => handleFilterChange('ticketCategoryId', e.target.value)}
                  disabled={!filters.eventId}
                  className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
                >
                  <option value="">All Categories</option>
                  {ticketCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Scan Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scan Status</label>
                <select
                  value={filters.scanStatus}
                  onChange={(e) => handleFilterChange('scanStatus', e.target.value)}
                  className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">All Tickets</option>
                  <option value="SCANNED">Scanned</option>
                  <option value="UNSCANNED">Unscanned</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table/Cards */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                </div>
                <span>Bookings ({bookingsData?.bookings.length || 0})</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scanned</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsData?.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="p-4 bg-gray-100 rounded-full mb-4">
                            <Ticket className="h-12 w-12 text-gray-400" />
                          </div>
                          <p className="text-gray-900 font-semibold text-lg mb-2">No bookings found</p>
                          <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or check back later</p>
                          <Button onClick={clearFilters} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bookingsData?.bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{booking.bookingReference}</span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <p className="text-sm text-gray-900 font-medium truncate max-w-[200px]">{booking.eventTitle}</p>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span className="text-sm text-gray-600">{booking.ticketCategoryName}</span>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{booking.customerName}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{booking.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {booking.quantity}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {booking.totalPrice.toLocaleString()}
                            <span className="text-xs text-gray-500 ml-0.5">UGX</span>
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-green-600 font-medium">
                              ✓ {booking.ticketsScanned} scanned
                            </span>
                            <span className="text-xs text-orange-600">
                              ○ {booking.ticketsUnscanned} pending
                            </span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="View ticket"
                              onClick={() => window.open(`/ticket/${booking.bookingReference}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                              title="Send ticket email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {bookingsData?.bookings.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <Ticket className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg mb-2">No bookings found</p>
                    <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or check back later</p>
                    <Button onClick={clearFilters} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                bookingsData?.bookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Reference & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm font-bold text-gray-900">{booking.bookingReference}</span>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Event & Category */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{booking.eventTitle}</p>
                      <p className="text-xs text-gray-500">{booking.ticketCategoryName}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                      {booking.customerPhone && (
                        <p className="text-xs text-gray-500 mt-1">{booking.customerPhone}</p>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Quantity</p>
                        <p className="text-lg font-bold text-blue-700">{booking.quantity}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Amount</p>
                        <p className="text-lg font-bold text-green-700">
                          {booking.totalPrice.toLocaleString()}
                          <span className="text-xs ml-0.5">UGX</span>
                        </p>
                      </div>
                    </div>

                    {/* Scan Status & Date */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-medium">
                          ✓ {booking.ticketsScanned} scanned
                        </span>
                        <span className="text-orange-600">
                          ○ {booking.ticketsUnscanned} pending
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs active:scale-95 transition-all"
                        onClick={() => window.open(`/ticket/${booking.bookingReference}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        View Ticket
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs active:scale-95 transition-all"
                      >
                        <Mail className="h-3 w-3 mr-1.5" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

