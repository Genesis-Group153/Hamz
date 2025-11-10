'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
// @ts-ignore - bwip-js doesn't have TypeScript definitions
import bwipjs from 'bwip-js';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useTicketList } from '@/lib/hooks/useTickets';
import { QueryTicketsDto, IndividualTicket, TicketListResponse, ticketsApi } from '@/lib/api/tickets';
import { useVendorEvents } from '@/lib/hooks/useEvents';
import {
  Loader2,
  Search,
  Filter,
  Ticket,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  QrCode as QrCodeIcon,
  User,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Copy,
  Printer,
  Image as ImageIcon,
  Layout,
} from 'lucide-react';
// Date formatting helper
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

interface TicketListProps {
  eventId?: string; // Optional: filter by specific event
}

export function TicketList({ eventId: propEventId }: TicketListProps) {
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get('eventId') || undefined;
  const urlTicketCategoryId = searchParams.get('ticketCategoryId') || undefined;

  const [filters, setFilters] = useState<QueryTicketsDto>({
    eventId: propEventId || urlEventId || undefined,
    ticketCategoryId: urlTicketCategoryId || undefined,
    page: 1,
    limit: 20,
    sortBy: 'issuedAt',
    sortOrder: 'desc',
  });

  const [barcodeImages, setBarcodeImages] = useState<Record<string, { activation?: string; gate?: string }>>({});
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [showDownloadImages, setShowDownloadImages] = useState(false);
  const [downloadQuantity, setDownloadQuantity] = useState(10);

  // Update filters when URL params change
  useEffect(() => {
    const urlEventId = searchParams.get('eventId');
    const urlTicketCategoryId = searchParams.get('ticketCategoryId');
    
    setFilters(prev => ({
      ...prev,
      eventId: propEventId || urlEventId || prev.eventId,
      ticketCategoryId: urlTicketCategoryId || prev.ticketCategoryId,
      page: 1, // Reset to first page when filters change
    }));
  }, [searchParams, propEventId]);

  const { data: ticketData, isLoading, error, refetch } = useTicketList(filters);
  const { data: events } = useVendorEvents();

  const allTickets: IndividualTicket[] = (ticketData as TicketListResponse | undefined)?.data || [];
  const pagination = (ticketData as TicketListResponse | undefined)?.pagination;

  // Filter tickets by print status (client-side filtering for now)
  const tickets: IndividualTicket[] = React.useMemo(() => {
    const printStatus = (filters as any).printStatus;
    if (!printStatus || filters.type !== 'HARD') {
      return allTickets;
    }
    
    if (printStatus === 'PRINTED') {
      return allTickets.filter(t => t.type === 'HARD' && t.printedAt);
    } else if (printStatus === 'UNPRINTED') {
      return allTickets.filter(t => t.type === 'HARD' && !t.printedAt);
    }
    
    return allTickets;
  }, [allTickets, filters.type]);

  // Generate barcode/QR code images for tickets based on stage
  useEffect(() => {
    const generateBarcodes = async () => {
      const newBarcodes: Record<string, { activation?: string; gate?: string }> = {};
      
      for (const ticket of tickets) {
        if (!barcodeImages[ticket.id]) {
          try {
            const ticketBarcodes: { activation?: string; gate?: string } = {};

            // Always generate activation barcode (DataMatrix) for HARD tickets
            // DataMatrix is a 2D barcode that can be scanned by camera, visually distinct from QR codes
            // DataMatrix has L-shaped finder pattern vs QR code's 3 square finders
            if (ticket.type === 'HARD') {
              try {
                // Generate DataMatrix barcode for activation (plain ticketCode)
                // DataMatrix is camera-scannable and visually different from QR codes
                const canvas = document.createElement('canvas');
                bwipjs.toCanvas(canvas, {
                  bcid: 'datamatrix', // DataMatrix format
                  text: ticket.ticketCode,
                  scale: 5,
                  height: 10,
                  includetext: false, // Don't include text below barcode
                  textxalign: 'center',
                });
                ticketBarcodes.activation = canvas.toDataURL('image/png');
              } catch (error) {
                console.error(`Failed to generate DataMatrix barcode for ticket ${ticket.id}:`, error);
              }

              // Always generate QR code for HARD tickets (both formats needed for printing)
              // If activated, include bookingReference; if not, just use ticketCode
              try {
                const qrData = ticket.booking
                  ? JSON.stringify({
                      ticketCode: ticket.ticketCode,
                      bookingReference: ticket.booking.bookingReference,
                      type: 'HARD',
                      timestamp: new Date(ticket.issuedAt).getTime(),
                      eventId: ticket.event?.id || '',
                      categoryId: ticket.ticketCategory?.id || '',
                      eventTitle: ticket.event?.title || '',
                    })
                  : ticket.ticketCode; // Plain ticketCode for unactivated tickets (will be updated after activation)

                const gateQRCode = await QRCode.toDataURL(qrData, {
                  width: 200,
                  margin: 1,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  }
                });
                ticketBarcodes.gate = gateQRCode;
              } catch (error) {
                console.error(`Failed to generate QR code for ticket ${ticket.id}:`, error);
              }
            } else {
              // SOFT tickets: Generate gate QR code
              const gateQRData = JSON.stringify({
                ticketCode: ticket.ticketCode,
                bookingReference: ticket.booking?.bookingReference || '',
                type: ticket.type,
                timestamp: new Date(ticket.issuedAt).getTime(),
                eventId: ticket.event?.id || '',
                categoryId: ticket.ticketCategory?.id || '',
                eventTitle: ticket.event?.title || '',
              });

              const gateQRCode = await QRCode.toDataURL(gateQRData, {
                width: 200,
                margin: 1,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              });
              ticketBarcodes.gate = gateQRCode;
            }
            
            if (ticketBarcodes.activation || ticketBarcodes.gate) {
              newBarcodes[ticket.id] = ticketBarcodes;
            }
          } catch (error) {
            console.error(`Failed to generate barcode/QR code for ticket ${ticket.id}:`, error);
          }
        } else {
          // Reuse existing barcode
          newBarcodes[ticket.id] = barcodeImages[ticket.id];
        }
      }
      
      if (Object.keys(newBarcodes).length > 0) {
        setBarcodeImages(prev => ({ ...prev, ...newBarcodes }));
      }
    };

    if (tickets.length > 0) {
      generateBarcodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  const copyTicketCode = (ticketCode: string) => {
    navigator.clipboard.writeText(ticketCode);
    toast.success('Ticket code copied to clipboard');
  };

  const handleFilterChange = (key: keyof QueryTicketsDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    const urlEventId = searchParams.get('eventId') || undefined;
    const urlTicketCategoryId = searchParams.get('ticketCategoryId') || undefined;
    
    setFilters({
      eventId: propEventId || urlEventId || undefined,
      ticketCategoryId: urlTicketCategoryId || undefined,
      page: 1,
      limit: 20,
      sortBy: 'issuedAt',
      sortOrder: 'desc',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      AVAILABLE: {
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      SCANNED: {
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      SOLD: {
        color: 'bg-purple-100 text-purple-700 border-purple-300',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      EXPIRED: {
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: <XCircle className="h-3 w-3" />,
      },
      CANCELLED: {
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: <XCircle className="h-3 w-3" />,
      },
      RETURNED: {
        color: 'bg-orange-100 text-orange-700 border-orange-300',
        icon: <AlertCircle className="h-3 w-3" />,
      },
    };

    const statusInfo = statusMap[status] || {
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: <Clock className="h-3 w-3" />,
    };

    return (
      <Badge className={`${statusInfo.color} border flex items-center gap-1`}>
        {statusInfo.icon}
        {status}
      </Badge>
    );
  };

  // Get HARD tickets from current results - only unprinted ones for download
  const hardTickets = tickets.filter(ticket => 
    ticket.type === 'HARD' && 
    barcodeImages[ticket.id] && 
    !ticket.printedAt // Only unprinted tickets
  );

  // Download images helper - uses print-single endpoint to mark tickets as printed
  // According to FRONTEND_PRINT_TRACKING_GUIDE.md: Use print-single for precise ticket printing
  const downloadImages = async (quantity: number) => {
    if (hardTickets.length === 0) {
      toast.error('No unprinted HARD tickets available to download');
      return;
    }

    const ticketsToDownload = hardTickets.slice(0, quantity);
    
    try {
      toast.loading(`Marking ${ticketsToDownload.length} tickets as printed...`, { id: 'download-images' });
      
      // Step 1: Mark tickets as printed using print-single endpoint for each ticket
      // This prevents duplicate printing and marks tickets as printed automatically
      const markedTickets: IndividualTicket[] = [];
      const failedTickets: { ticket: IndividualTicket; error: string }[] = [];
      
      for (const ticket of ticketsToDownload) {
        try {
          // Use print-single endpoint - this automatically marks ticket as printed
          // According to guide: POST /tickets/print-single/:ticketCode prevents duplicate printing
          const result = await ticketsApi.printSingleTicket(ticket.ticketCode);
          
          if (result.success) {
            markedTickets.push(ticket);
          }
        } catch (printError: any) {
          // Handle already printed error
          if (printError.response?.data?.code === 'TICKET_ALREADY_PRINTED') {
            failedTickets.push({
              ticket,
              error: `Already printed on ${new Date(printError.response.data.printedAt).toLocaleString()}`
            });
          } else {
            failedTickets.push({
              ticket,
              error: printError.response?.data?.message || 'Failed to mark as printed'
            });
          }
        }
      }
      
      // Step 2: Download images only for tickets that were successfully marked as printed
      if (markedTickets.length > 0) {
        toast.loading(`Downloading ${markedTickets.length * 2} images...`, { id: 'download-images' });
        
        for (const ticket of markedTickets) {
          const images = barcodeImages[ticket.id];
          
          if (images?.activation) {
            // Download activation barcode (DataMatrix)
            const activationLink = document.createElement('a');
            activationLink.href = images.activation;
            activationLink.download = `${ticket.ticketCode}_activation.png`;
            document.body.appendChild(activationLink);
            activationLink.click();
            document.body.removeChild(activationLink);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 150));
          }
          
          if (images?.gate) {
            // Download gate barcode (Code128)
            const gateLink = document.createElement('a');
            gateLink.href = images.gate;
            gateLink.download = `${ticket.ticketCode}_gate.png`;
            document.body.appendChild(gateLink);
            gateLink.click();
            document.body.removeChild(gateLink);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        }
      }
      
      // Step 3: Show results
      if (markedTickets.length > 0) {
        let message = `Downloaded ${markedTickets.length * 2} images! ${markedTickets.length} tickets marked as printed and cannot be downloaded again.`;
        
        if (failedTickets.length > 0) {
          message += ` (${failedTickets.length} tickets skipped - already printed or error occurred)`;
        }
        
        toast.success(message, { id: 'download-images', duration: 6000 });
        
        // Refresh the ticket list to show updated print status
        refetch();
      } else if (failedTickets.length > 0) {
        // All tickets failed
        const alreadyPrinted = failedTickets.filter(f => f.error.includes('already printed')).length;
        if (alreadyPrinted === failedTickets.length) {
          toast.warning(
            'All selected tickets were already printed. Cannot download again.',
            { id: 'download-images', duration: 4000 }
          );
        } else {
          toast.error(
            `Failed to download images. ${failedTickets[0].error}`,
            { id: 'download-images', duration: 5000 }
          );
        }
        refetch(); // Refresh anyway to show current status
      }
      
      setShowDownloadImages(false);
    } catch (error: any) {
      console.error('Error downloading images:', error);
      toast.error(
        error.response?.data?.message || 'Failed to download images. Please try again.',
        { id: 'download-images', duration: 5000 }
      );
    }
  };

  const getTypeBadge = (type: 'SOFT' | 'HARD') => {
    return (
      <Badge
        className={
          type === 'HARD'
            ? 'bg-orange-100 text-orange-700 border-orange-300'
            : 'bg-blue-100 text-blue-700 border-blue-300'
        }
      >
        {type === 'HARD' ? (
          <>
            <QrCodeIcon className="h-3 w-3 mr-1" />
            HARD
          </>
        ) : (
          <>
            <Ticket className="h-3 w-3 mr-1" />
            SOFT
          </>
        )}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load tickets</p>
            <p className="text-gray-500 text-sm mt-2">
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 py-5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              Search & Filter Tickets
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters} className="border-gray-300 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Event</label>
              <Select
                value={filters.eventId || 'ALL'}
                onValueChange={(value) =>
                  handleFilterChange('eventId', value === 'ALL' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Events</SelectItem>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select
                value={filters.type || 'ALL'}
                onValueChange={(value) =>
                  handleFilterChange('type', value === 'ALL' ? undefined : (value as 'SOFT' | 'HARD'))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SOFT">Soft (Digital)</SelectItem>
                  <SelectItem value="HARD">Hard (Physical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.status || 'ALL'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'ALL' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="SCANNED">Scanned</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Booking Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Booking</label>
              <Select
                value={filters.hasBooking === undefined ? 'ALL' : filters.hasBooking ? 'true' : 'false'}
                onValueChange={(value) =>
                  handleFilterChange('hasBooking', value === 'ALL' ? undefined : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="true">Has Booking</SelectItem>
                  <SelectItem value="false">No Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Print Status Filter (for HARD tickets) */}
            {filters.type === 'HARD' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Print Status</label>
                <Select
                  value={(filters as any).printStatus || 'ALL'}
                  onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, printStatus: value === 'ALL' ? undefined : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Print Status</SelectItem>
                    <SelectItem value="UNPRINTED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Unprinted Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PRINTED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Printed Only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ticket Code Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ticket Code</label>
              <Input
                placeholder="Search by code..."
                value={filters.ticketCode || ''}
                onChange={(e) => handleFilterChange('ticketCode', e.target.value || undefined)}
              />
            </div>

            {/* Issued After */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Issued After</label>
              <Input
                type="datetime-local"
                value={filters.issuedAfter ? filters.issuedAfter.slice(0, 16) : ''}
                onChange={(e) =>
                  handleFilterChange('issuedAfter', e.target.value ? `${e.target.value}:00.000Z` : undefined)
                }
              />
            </div>

            {/* Issued Before */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Issued Before</label>
              <Input
                type="datetime-local"
                value={filters.issuedBefore ? filters.issuedBefore.slice(0, 16) : ''}
                onChange={(e) =>
                  handleFilterChange('issuedBefore', e.target.value ? `${e.target.value}:00.000Z` : undefined)
                }
              />
            </div>

            {/* Limit per page */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Items per page</label>
              <Select
                value={String(filters.limit || 20)}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <Select
                value={filters.sortBy || 'issuedAt'}
                onValueChange={(value) =>
                  handleFilterChange('sortBy', value as QueryTicketsDto['sortBy'])
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issuedAt">Issued Date</SelectItem>
                  <SelectItem value="scannedAt">Scanned Date</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="ticketCode">Ticket Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) =>
                  handleFilterChange('sortOrder', value as 'asc' | 'desc')
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Options Card - Only show if unprinted HARD tickets exist */}
      {hardTickets.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Print HARD Tickets</h3>
                <p className="text-sm text-gray-600">
                  {hardTickets.length} unprinted HARD ticket{hardTickets.length !== 1 ? 's' : ''} available for printing
                  {tickets.filter(t => t.type === 'HARD' && t.printedAt).length > 0 && (
                    <span className="ml-2 text-purple-600 font-medium">
                      ({tickets.filter(t => t.type === 'HARD' && t.printedAt).length} already printed)
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={() => setShowPrintOptions(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Card */}
      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className=" border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              Ticket Results
              {pagination && (
                <Badge variant="outline" className="ml-2 bg-white border-gray-300">
                  {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                  {allTickets.length !== tickets.length && (
                    <span className="ml-1 text-xs text-gray-500">(filtered from {pagination.total})</span>
                  )}
                </Badge>
              )}
              {/* Print Status Summary for HARD tickets */}
              {filters.type === 'HARD' && allTickets.length > 0 && (
                <div className="ml-2 flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md border border-green-300">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {allTickets.filter(t => t.type === 'HARD' && !t.printedAt).length} Unprinted
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md border border-purple-300">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    {allTickets.filter(t => t.type === 'HARD' && t.printedAt).length} Printed
                  </span>
                </div>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-gray-300 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No tickets found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Tickets Table */}
              <div className="space-y-4">
                {tickets.map((ticket: IndividualTicket) => {
                  const isPrinted = ticket.type === 'HARD' && ticket.printedAt;
                  return (
                  <Card 
                    key={ticket.id} 
                    className={`border-2 transition-all duration-200 bg-white ${
                      isPrinted 
                        ? 'border-purple-300 hover:border-purple-400 bg-purple-50/30' 
                        : 'border-gray-200 hover:border-blue-400'
                    } hover:shadow-lg`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Left: Barcode/QR Code Section */}
                        <div className="flex-shrink-0">
                          {(() => {
                            const isScanned = ticket.status === 'SCANNED';
                            const isHARD = ticket.type === 'HARD';
                            
                            return (
                              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-sm">
                                {/* Show all formats for printing - Both Code128 and QR Code together */}
                                {barcodeImages[ticket.id] ? (
                                  <div className="flex flex-col items-center gap-4">
                                    {isHARD && (
                                      <>
                                        {/* DataMatrix Barcode (Activation) - Always shown for HARD tickets */}
                                        {/* DataMatrix is visually distinct from QR codes - has L-shaped finder pattern */}
                                        {barcodeImages[ticket.id].activation && (
                                          <div className="w-full space-y-2">
                                            <div className="flex items-center justify-center gap-2">
                                              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs font-semibold px-2 py-1">
                                                🔴 DataMatrix (Activation)
                                              </Badge>
                                            </div>
                                            <div className="relative border-2 border-orange-300 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-amber-50">
                                              <img
                                                src={barcodeImages[ticket.id].activation}
                                                alt="Activation Barcode (DataMatrix)"
                                                className="w-40 h-40 mx-auto object-contain"
                                              />
                                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-[8px] px-2 py-0.5 rounded whitespace-nowrap font-bold shadow-sm">
                                                DATAMATRIX
                                              </div>
                                            </div>
                                            <p className="text-[10px] text-orange-600 text-center font-medium">
                                              For activation scan (Sale stage)<br />
                                              <span className="text-[9px] text-orange-500">Camera scannable - L-shaped pattern</span>
                                            </p>
                                          </div>
                                        )}

                                        {/* QR Code (Gate Entry) - Always shown for HARD tickets (both formats for printing) */}
                                        {barcodeImages[ticket.id].gate && (
                                          <div className="w-full space-y-2">
                                            <div className="flex items-center justify-center gap-2">
                                              {ticket.booking ? (
                                                isScanned ? (
                                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-semibold px-2 py-1">
                                                    ✓ QR Code (Scanned)
                                                  </Badge>
                                                ) : (
                                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-semibold px-2 py-1">
                                                    🟢 QR Code (Gate Entry)
                                                  </Badge>
                                                )
                                              ) : (
                                                <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs font-semibold px-2 py-1">
                                                  📋 QR Code (Gate Entry)
                                                </Badge>
                                              )}
                                            </div>
                                            <div className={`relative border-2 rounded-lg p-3 ${ticket.booking ? (isScanned ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-75' : 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50') : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50'}`}>
                                              <img
                                                src={barcodeImages[ticket.id].gate}
                                                alt="Gate QR Code"
                                                className={`w-36 h-36 mx-auto object-contain ${isScanned ? 'opacity-60' : ''}`}
                                              />
                                              {!isScanned && (
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-[8px] px-2 py-0.5 rounded whitespace-nowrap font-bold shadow-sm">
                                                  QR CODE
                                                </div>
                                              )}
                                            </div>
                                            <p className={`text-[10px] text-center font-medium ${ticket.booking ? (isScanned ? 'text-blue-600' : 'text-green-600') : 'text-gray-600'}`}>
                                              {ticket.booking ? (isScanned ? 'Already used for entry' : 'For gate entry scan (Entry stage)') : 'Will include bookingReference after activation'}
                                            </p>
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* SOFT tickets - Only QR Code */}
                                    {!isHARD && barcodeImages[ticket.id].gate && (
                                      <div className="w-full space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                          {isScanned ? (
                                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-semibold px-2 py-1">
                                              ✓ QR Code (Scanned)
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-semibold px-2 py-1">
                                              🟢 QR Code (Gate Entry)
                                            </Badge>
                                          )}
                                        </div>
                                        <div className={`relative border-2 rounded-lg p-3 ${isScanned ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-75' : 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                                          <img
                                            src={barcodeImages[ticket.id].gate}
                                            alt="Gate QR Code"
                                            className={`w-40 h-40 mx-auto object-contain ${isScanned ? 'opacity-60' : ''}`}
                                          />
                                          {!isScanned && (
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-[8px] px-2 py-0.5 rounded whitespace-nowrap font-bold shadow-sm">
                                              QR CODE
                                            </div>
                                          )}
                                        </div>
                                        <p className={`text-[10px] text-center font-medium ${isScanned ? 'text-blue-600' : 'text-green-600'}`}>
                                          {isScanned ? 'Already used for entry' : 'For gate entry scan'}
                                        </p>
                                      </div>
                                    )}

                                    {/* Copy Code Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyTicketCode(ticket.ticketCode)}
                                      className={`text-xs hover:text-gray-900 mt-2 ${isScanned ? 'text-gray-400' : 'text-gray-600'}`}
                                      title="Click to copy ticket code"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy Code
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="mt-3 flex items-center gap-2 justify-center flex-wrap">
                            {getTypeBadge(ticket.type)}
                            {getStatusBadge(ticket.status)}
                            {ticket.type === 'HARD' && ticket.printedAt && (
                              <Badge className="bg-purple-200 text-purple-900 border-2 border-purple-400 flex items-center gap-1.5 px-2.5 py-1 font-semibold shadow-sm">
                                <Printer className="h-3.5 w-3.5" />
                                <span>Printed</span>
                                <span className="text-xs">•</span>
                                <span className="text-xs">{formatDate(ticket.printedAt).split(',')[0]}</span>
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Right: Ticket Info */}
                        <div className="flex-1 space-y-4 min-w-0">
                          {/* Event & Category Info */}
                          <div className="space-y-2">
                            {ticket.event && (
                              <h3 className="text-lg font-bold text-gray-900 truncate">{ticket.event.title}</h3>
                            )}
                            {ticket.ticketCategory && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                  {ticket.ticketCategory.categoryName}
                                </Badge>
                                <span className="text-sm font-semibold text-gray-700">
                                  ${ticket.ticketCategory.price}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Booking Info */}
                          {ticket.booking ? (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Booking Reference</span>
                                  <p className="text-sm font-bold text-blue-900">{ticket.booking.bookingReference}</p>
                                </div>
                                <Badge
                                  className={
                                    ticket.booking.isFullyScanned
                                      ? 'bg-green-100 text-green-700 border-green-300'
                                      : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  }
                                >
                                  {ticket.booking.scannedTickets}/{ticket.booking.quantity} scanned
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                                {ticket.booking.customerName && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-blue-900">
                                      <strong>Customer:</strong> {ticket.booking.customerName}
                                    </span>
                                  </div>
                                )}
                                {ticket.booking.customerEmail && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-blue-900 truncate">{ticket.booking.customerEmail}</span>
                                  </div>
                                )}
                                {ticket.booking.customerPhone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-blue-900">{ticket.booking.customerPhone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : ticket.type === 'HARD' ? (
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300 rounded-lg">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                                <p className="text-sm font-medium text-orange-900">
                                  Unactivated HARD ticket - No booking assigned
                                </p>
                              </div>
                            </div>
                          ) : null}

                          {/* Dates Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ticket.issuedAt && (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-500 block">Issued</span>
                                  <span className="text-sm font-medium text-gray-900">{formatDate(ticket.issuedAt)}</span>
                                </div>
                              </div>
                            )}
                            {ticket.scannedAt && (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <div className="p-1.5 bg-green-100 rounded-lg">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-500 block">Scanned</span>
                                  <span className="text-sm font-medium text-gray-900">{formatDate(ticket.scannedAt)}</span>
                                </div>
                              </div>
                            )}
                            {ticket.activatedAt && (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                  <QrCodeIcon className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-500 block">Activated</span>
                                  <span className="text-sm font-medium text-gray-900">{formatDate(ticket.activatedAt)}</span>
                                </div>
                              </div>
                            )}
                            {ticket.expiresAt && (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                  <Clock className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-500 block">Expires</span>
                                  <span className="text-sm font-medium text-gray-900">{formatDate(ticket.expiresAt)}</span>
                                </div>
                              </div>
                            )}
                            {ticket.type === 'HARD' && ticket.printedAt && (
                              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                  <Printer className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-purple-600 block">Printed On</span>
                                  <span className="text-sm font-semibold text-purple-900">{formatDate(ticket.printedAt)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Location */}
                          {ticket.scanLocation && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium text-gray-500 block">Scan Location</span>
                                <span className="text-sm font-medium text-gray-900">{ticket.scanLocation}</span>
                              </div>
                            </div>
                          )}

                          {/* Additional Ticket Information */}
                          <div className="space-y-3 pt-2 border-t border-gray-200">
                            {/* Ticket Metadata */}
                            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-gray-200 rounded-lg">
                                  <Ticket className="h-3.5 w-3.5 text-gray-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ticket Details</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Ticket ID:</span>
                                  <p className="font-mono text-gray-900 truncate" title={ticket.id}>{ticket.id}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Ticket Code:</span>
                                  <p className="font-mono text-gray-900 truncate" title={ticket.ticketCode}>{ticket.ticketCode}</p>
                                </div>
                              </div>
                            </div>

                            {/* Event Details */}
                            {ticket.event && (
                              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-blue-200 rounded-lg">
                                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                  </div>
                                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Event Information</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  {ticket.event.venue && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                                      <span className="text-blue-900">
                                        <strong>Venue:</strong> {ticket.event.venue}
                                      </span>
                                    </div>
                                  )}
                                  {ticket.event.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                                      <span className="text-blue-900">
                                        <strong>Location:</strong> {ticket.event.location}
                                      </span>
                                    </div>
                                  )}
                                  {ticket.event.date && (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3 text-blue-600 shrink-0" />
                                      <span className="text-blue-900">
                                        <strong>Event Date:</strong> {formatDate(ticket.event.date)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Activation Details */}
                            {ticket.activatedAt && (
                              <div className="p-3 bg-purple-50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-purple-200 rounded-lg">
                                    <QrCodeIcon className="h-3.5 w-3.5 text-purple-600" />
                                  </div>
                                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Activation Details</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  {ticket.activationLocation && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-purple-600 shrink-0" />
                                      <span className="text-purple-900">
                                        <strong>Location:</strong> {ticket.activationLocation}
                                      </span>
                                    </div>
                                  )}
                                  {ticket.activatedBy && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3 text-purple-600 shrink-0" />
                                      <span className="text-purple-900">
                                        <strong>Activated By:</strong> {ticket.activatedBy}
                                      </span>
                                    </div>
                                  )}
                                  {ticket.commissionAmount !== null && ticket.commissionAmount !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-purple-900">
                                        <strong>Commission:</strong> ${ticket.commissionAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Scan Information */}
                            {ticket.scannedAt && (
                              <div className="p-3 bg-green-50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-green-200 rounded-lg">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                  </div>
                                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Scan Information</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  {ticket.scannedBy && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3 text-green-600 shrink-0" />
                                      <span className="text-green-900">
                                        <strong>Scanned By:</strong> {ticket.scannedBy.name}
                                      </span>
                                    </div>
                                  )}
                                  {ticket.staff && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3 text-green-600 shrink-0" />
                                      <span className="text-green-900">
                                        <strong>Staff:</strong> {ticket.staff.name} ({ticket.staff.position})
                                      </span>
                                    </div>
                                  )}
                                  {ticket.scanNotes && (
                                    <div className="flex items-start gap-2 pt-1 border-t border-green-200">
                                      <AlertCircle className="h-3 w-3 text-green-600 shrink-0 mt-0.5" />
                                      <span className="text-green-900">
                                        <strong>Notes:</strong> {ticket.scanNotes}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Return Information */}
                            {ticket.returnedAt && (
                              <div className="p-3 bg-orange-50 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-orange-200 rounded-lg">
                                    <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                                  </div>
                                  <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Return Information</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-orange-600 shrink-0" />
                                    <span className="text-orange-900">
                                      <strong>Returned At:</strong> {formatDate(ticket.returnedAt)}
                                    </span>
                                  </div>
                                  {ticket.returnedBy && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-3 w-3 text-orange-600 shrink-0" />
                                      <span className="text-orange-900">
                                        <strong>Returned By:</strong> {ticket.returnedBy}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Booking Status (if exists) */}
                            {ticket.booking && ticket.booking.status && (
                              <div className="p-3 bg-indigo-50 rounded-lg">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-indigo-700 font-semibold">Booking Status:</span>
                                  <Badge className={`text-xs ${
                                    ticket.booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border-green-300' :
                                    ticket.booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                    ticket.booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-300' :
                                    'bg-gray-100 text-gray-700 border-gray-300'
                                  }`}>
                                    {ticket.booking.status}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} tickets
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Print Options Modal */}
      <Dialog open={showPrintOptions} onOpenChange={setShowPrintOptions}>
        <DialogContent className="w-[95vw] max-w-lg mx-4 sm:mx-auto">
          <DialogHeader className="text-center sm:text-left pb-2">
            <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-xl sm:text-2xl font-bold text-gray-900">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              Choose Printing Method
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 mt-2">
              Select how you want to print your HARD tickets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <button
              type="button"
              onClick={() => {
                setShowPrintOptions(false);
                // TODO: Navigate to template designer page
                toast.info('Template designer coming soon!');
              }}
              className="w-full group relative overflow-hidden rounded-xl border-2 border-blue-200 bg-white p-4 sm:p-5 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors shrink-0">
                  <Layout className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base sm:text-lg text-gray-900 mb-1 group-hover:text-blue-900 transition-colors">
                    Use Template Designer
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Upload a template and drag QR codes & barcodes onto it
                  </div>
                </div>
                <div className="hidden sm:block text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPrintOptions(false);
                setShowDownloadImages(true);
              }}
              className="w-full group relative overflow-hidden rounded-xl border-2 border-orange-200 bg-white p-4 sm:p-5 transition-all duration-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors shrink-0">
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base sm:text-lg text-gray-900 mb-1 group-hover:text-orange-900 transition-colors">
                    Download Images
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Download QR code and Code128 images to print yourself
                  </div>
                </div>
                <div className="hidden sm:block text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Images Modal */}
      <Dialog open={showDownloadImages} onOpenChange={setShowDownloadImages}>
        <DialogContent className="w-[95vw] max-w-lg mx-4 sm:mx-auto">
          <DialogHeader className="text-center sm:text-left pb-2">
            <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-xl sm:text-2xl font-bold text-gray-900">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Download className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              Download Ticket Images
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 mt-2">
              Choose how many tickets you want to download images for
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-5 py-2 sm:py-4">
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm sm:text-base font-semibold text-gray-700">
                Number of Tickets
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Input
                  type="number"
                  min="1"
                  max={hardTickets.length}
                  value={downloadQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setDownloadQuantity(Math.min(Math.max(1, value), hardTickets.length));
                  }}
                  className="flex-1 h-11 sm:h-12 text-base border-2 focus:border-orange-500 focus:ring-orange-500"
                />
                <div className="flex items-center justify-center sm:justify-start px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm sm:text-base text-gray-700 font-medium min-w-[120px]">
                  of {hardTickets.length} available
                </div>
              </div>
              {/* Quick select buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Quick select:</span>
                {[1, 5, 10, 20].filter(num => num <= hardTickets.length).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDownloadQuantity(Math.min(num, hardTickets.length))}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md border transition-colors ${
                      downloadQuantity === num
                        ? 'bg-orange-100 border-orange-300 text-orange-700 font-semibold'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                {hardTickets.length > 20 && (
                  <button
                    type="button"
                    onClick={() => setDownloadQuantity(hardTickets.length)}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-md border transition-colors ${
                      downloadQuantity === hardTickets.length
                        ? 'bg-orange-100 border-orange-300 text-orange-700 font-semibold'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All ({hardTickets.length})
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm sm:text-base text-gray-900 mb-2">You will receive:</p>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 shrink-0">•</span>
                      <span>
                        <span className="font-semibold text-gray-900">{downloadQuantity}</span> QR Code images (activation/DataMatrix)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 shrink-0">•</span>
                      <span>
                        <span className="font-semibold text-gray-900">{downloadQuantity}</span> Code128 barcode images (gate entry)
                      </span>
                    </li>
                    <li className="flex items-start gap-2 pt-2 border-t border-blue-200">
                      <span className="text-orange-600 mt-0.5 shrink-0">•</span>
                      <span className="font-bold text-base sm:text-lg text-gray-900">
                        Total: <span className="text-orange-600">{downloadQuantity * 2}</span> images
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDownloadImages(false)}
              className="w-full sm:w-auto order-2 sm:order-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => downloadImages(downloadQuantity)}
              className="w-full sm:w-auto order-1 sm:order-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {downloadQuantity * 2} Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


