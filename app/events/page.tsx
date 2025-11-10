'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProfessionalHeader } from '@/components/layout/professional-header';
import { ProfessionalFooter } from '@/components/layout/professional-footer';
import { usePublicEvents } from '@/lib/hooks/useEvents';
import { useEventTickets } from '@/lib/hooks/useTickets';
import { ProfessionalEventCard } from '@/components/events/professional-event-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3x3, 
  List,
  Calendar,
  MapPin,
  DollarSign,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { EventsGridSkeleton } from '@/components/ui/skeleton-loader'
import { BookingModal } from '@/components/booking/booking-modal';

function EventsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const { data: events = [], isLoading, error } = usePublicEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price-low' | 'price-high' | 'name'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'paid'>('all');

  // Set category from URL parameter
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setShowFilters(true); // Show filters to display the active category
    }
  }, [categoryParam]);
  
  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Fetch tickets for the selected event
  const { data: eventTickets = [], isLoading: isLoadingTickets } = useEventTickets(selectedEvent?.id || '');
  
  // Transform tickets to match booking modal format
  const tickets = useMemo(() => {
    if (!eventTickets || eventTickets.length === 0) {
      // Fallback to event.ticketCategories if available
      return selectedEvent?.ticketCategories || [];
    }
    
    return eventTickets.map((ticket: any) => ({
      id: ticket.id,
      categoryName: ticket.categoryName,
      price: ticket.price,
      quantity: ticket.quantity,
      status: ticket.status || 'AVAILABLE',
      description: ticket.description,
      availableQuantity: ticket.availableQuantity || (ticket.quantity - (ticket.soldQuantity || 0)),
      soldQuantity: ticket.soldQuantity || 0,
    }));
  }, [eventTickets, selectedEvent]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = events.map((event: any) => event.category).filter(Boolean);
    return ['all', ...Array.from(new Set(cats))] as string[];
  }, [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Price range filter
    if (priceRange === 'free') {
      filtered = filtered.filter(event => 
        event.ticketCategories?.some((t: any) => t.price === 0)
      );
    } else if (priceRange === 'paid') {
      filtered = filtered.filter(event => 
        event.ticketCategories?.every((t: any) => t.price > 0)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'price-low':
          const minPriceA = Math.min(...(a.ticketCategories?.map((t: any) => t.price) || [0]));
          const minPriceB = Math.min(...(b.ticketCategories?.map((t: any) => t.price) || [0]));
          return minPriceA - minPriceB;
        case 'price-high':
          const maxPriceA = Math.max(...(a.ticketCategories?.map((t: any) => t.price) || [0]));
          const maxPriceB = Math.max(...(b.ticketCategories?.map((t: any) => t.price) || [0]));
          return maxPriceB - maxPriceA;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, selectedCategory, sortBy, priceRange]);

  const handleBookNow = (event: any) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('date');
  };

  const activeFiltersCount = [
    searchQuery !== '',
    selectedCategory !== 'all',
    priceRange !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalHeader />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Events</h1>
          <p className="text-muted-foreground text-lg">
            Find and book tickets for amazing events happening around you
          </p>
        </div>

        {/* Filters Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events by name, venue, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2" variant="default">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Events
                </h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date (Earliest First)</SelectItem>
                      <SelectItem value="price-low">Price (Low to High)</SelectItem>
                      <SelectItem value="price-high">Price (High to Low)</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="free">Free Events</SelectItem>
                      <SelectItem value="paid">Paid Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          {filteredEvents.length > 0 && (
            <p className="text-muted-foreground">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
          </p>
          )}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary">
                  Search: "{searchQuery}"
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary">
                  {selectedCategory}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              )}
              {priceRange !== 'all' && (
                <Badge variant="secondary">
                  {priceRange === 'free' ? 'Free' : 'Paid'}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setPriceRange('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Events Grid/List */}
        {isLoading ? (
          <div className="py-6">
            <EventsGridSkeleton count={9} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
            <p className="text-muted-foreground mb-4">Please try again later</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredEvents.map((event) => (
              <ProfessionalEventCard
                key={event.id}
                event={event}
                onBookNow={handleBookNow}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      <ProfessionalFooter />

      {/* Booking Modal */}
      {selectedEvent && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedEvent(null);
          }}
          event={{
            id: selectedEvent.id,
            title: selectedEvent.title,
            date: selectedEvent.startDate,
            venue: selectedEvent.venue,
            address: selectedEvent.address,
            maxTicketsPerEmail: selectedEvent.maxTicketsPerEmail,
          }}
          tickets={tickets}
          usePaymentIntegration={true}
          isLoadingTickets={isLoadingTickets}
        />
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  );
}

