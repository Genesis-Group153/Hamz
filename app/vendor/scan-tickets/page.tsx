'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScanTicket, useEventScanHistory } from '@/lib/hooks/useTicketScanning';
import { useVendorEvents } from '@/lib/hooks/useEvents';
import { toast } from 'sonner';
import { 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  UserPlus,
  MapPin,
  Calendar,
  Ticket,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { ScanTicketResponse } from '@/lib/api/ticket-scanning';

export default function ScanTicketsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [ticketCode, setTicketCode] = useState('');
  const [scanLocation, setScanLocation] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanTicketResponse | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const { data: events, isLoading: eventsLoading } = useVendorEvents();
  const { data: scanHistory, isLoading: historyLoading, refetch: refetchHistory } = useEventScanHistory(
    selectedEventId || '', 
    !!selectedEventId
  );
  
  const scanTicketMutation = useScanTicket();

  // Reset scan result when event changes
  useEffect(() => {
    setScanResult(null);
    setTicketCode('');
  }, [selectedEventId]);

  const handleManualScan = async () => {
    if (!ticketCode.trim()) {
      toast.error('Please enter a ticket code');
      return;
    }

    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    try {
      const result = await scanTicketMutation.mutateAsync({
        ticketCode: ticketCode.trim(),
        scanLocation: scanLocation.trim() || undefined,
        notes: undefined,
        staffId: selectedStaffId || undefined
      });

      setScanResult(result);
      
      if (result.success) {
        toast.success(result.message);
        setTicketCode('');
        setScanLocation('');
        refetchHistory();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Scan failed');
    }
  };

  const handleQRCodeScan = (scannedCode: string) => {
    setTicketCode(scannedCode);
    setShowCamera(false);
  };

  const getScanResultIcon = (result: ScanTicketResponse) => {
    if (result.success) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else {
      return <XCircle className="h-6 w-6 text-red-600" />;
    }
  };

  const getScanResultBadge = (result: ScanTicketResponse) => {
    if (result.success) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>;
    } else {
      const colorMap: Record<string, string> = {
        'SUCCESS': 'bg-green-100 text-green-800 border-green-200',
        'INVALID_TICKET': 'bg-red-100 text-red-800 border-red-200',
        'ALREADY_SCANNED': 'bg-orange-100 text-orange-800 border-orange-200',
        'EVENT_CANCELLED': 'bg-gray-100 text-gray-800 border-gray-200',
        'EVENT_ENDED': 'bg-gray-100 text-gray-800 border-gray-200',
        'EVENT_PAST': 'bg-gray-100 text-gray-800 border-gray-200',
        'BOOKING_NOT_CONFIRMED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'NO_PERMISSION': 'bg-red-100 text-red-800 border-red-200',
        'TICKET_NOT_ACTIVATED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'INVALID_QR_SIGNATURE': 'bg-red-100 text-red-800 border-red-200'
      };
      
      const code = result.code || 'UNKNOWN';
      return (
        <Badge className={colorMap[code] || 'bg-red-100 text-red-800 border-red-200'}>
          {code.replace(/_/g, ' ')}
        </Badge>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ticket Scanner</h1>
          <p className="text-muted-foreground">Scan and validate event tickets</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetchHistory()}
          disabled={!selectedEventId}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scanner Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !events || events.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No events found</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEventId === event.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString()} at {event.venue || 'TBA'}
                          </p>
                        </div>
                        <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scanner Interface */}
          {selectedEventId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Scan Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Ticket Code
                      </label>
                      <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={ticketCode}
                          onChange={(e) => setTicketCode(e.target.value)}
                          placeholder="Enter ticket code or scan QR"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Scan Location (Optional)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={scanLocation}
                          onChange={(e) => setScanLocation(e.target.value)}
                          placeholder="e.g., Main Entrance, Gate A"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Staff Member (Optional)
                    </label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        value={selectedStaffId || ''}
                        onChange={(e) => setSelectedStaffId(e.target.value || null)}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select staff member (optional)</option>
                        <option value="1">John Smith - Security Manager</option>
                        <option value="2">Sarah Johnson - Ticketing Coordinator</option>
                        <option value="3">Mike Wilson - Event Assistant</option>
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the staff member who is scanning the ticket
                    </p>
                  </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleManualScan}
                    disabled={!ticketCode.trim() || scanTicketMutation.isPending}
                    className="flex-1"
                  >
                    {scanTicketMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Scan Ticket
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCamera(!showCamera)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {showCamera ? 'Hide Camera' : 'Camera'}
                  </Button>
                </div>

                {showCamera && (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Camera scanning will be implemented with a QR code library
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      For now, please manually enter the ticket code
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scan Result */}
          {scanResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getScanResultIcon(scanResult)}
                  Scan Result
                  {getScanResultBadge(scanResult)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className={scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription className={scanResult.success ? 'text-green-800' : 'text-red-800'}>
                    {scanResult.message}
                  </AlertDescription>
                </Alert>

                {scanResult.data && (
                  <div className="mt-4 space-y-3">
                    {scanResult.data.event && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{scanResult.data.event.title}</span>
                        <span className="text-muted-foreground">
                          - {new Date(scanResult.data.event.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {scanResult.data.booking && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{scanResult.data.booking.customerName}</span>
                        <span className="text-muted-foreground">
                          - {scanResult.data.booking.scannedTickets}/{scanResult.data.booking.quantity} scanned
                        </span>
                      </div>
                    )}

                    {scanResult.data.ticketScan && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Scanned at {new Date(scanResult.data.ticketScan.scannedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Scan History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedEventId ? (
                <p className="text-muted-foreground text-center py-4">Select an event to view scan history</p>
              ) : historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !scanHistory || scanHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No scans yet</p>
              ) : (
                <div className="space-y-3">
                  {scanHistory.slice(0, 10).map((scan) => (
                    <div key={scan.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {scan.ticketCode.substring(0, 12)}...
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(scan.scannedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {scan.booking.customerName || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.ticketCategory.categoryName}
                      </p>
                      {scan.scanLocation && (
                        <p className="text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {scan.scanLocation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
