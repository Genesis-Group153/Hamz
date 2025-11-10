import apiClient from './client';

export interface CreateTicketScanDto {
  ticketCode: string;
  scanLocation?: string;
  notes?: string;
  staffId?: string;
}

// Enhanced response matching API guide
export interface ScanTicketResponse {
  success: boolean;
  message: string;
  code?: 'SUCCESS' | 'INVALID_TICKET' | 'ALREADY_SCANNED' | 'TICKET_NOT_ACTIVATED' | 'INVALID_QR_SIGNATURE' | 'EVENT_CANCELLED' | 'EVENT_ENDED' | 'EVENT_PAST' | 'BOOKING_NOT_CONFIRMED' | 'NO_PERMISSION';
  ticket?: {
    id: string;
    ticketCode: string;
    status: 'AVAILABLE' | 'SOLD' | 'SCANNED' | 'EXPIRED' | 'CANCELLED' | 'INVALID';
    scannedAt?: string;
    booking?: {
      bookingReference: string;
      customerName?: string;
      quantity: number;
    };
    event?: {
      title: string;
      date: string;
    };
    ticketCategory?: {
      categoryName: string;
    };
  };
  scannedAt?: string;
  scannedBy?: {
    name: string;
    email: string;
  };
  ticketType?: 'SOFT' | 'HARD';
  currentStatus?: string;
  data?: {
    ticketScan?: {
      id: string;
      ticketCode: string;
      scannedAt: string;
      scannedBy: {
        id: string;
        name: string;
        email: string;
      };
      scanLocation?: string;
      notes?: string;
    };
    booking?: {
      id: string;
      bookingReference: string;
      quantity: number;
      scannedTickets: number;
      isFullyScanned: boolean;
      customerName?: string;
      customerEmail?: string;
    };
    event?: {
      id: string;
      title: string;
      date: string;
      venue?: string;
    };
    ticketCategory?: {
      id: string;
      categoryName: string;
      price: number;
    };
  } | null;
}

// Hard Ticket Activation
export interface ActivateHardTicketDto {
  ticketCode: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'MOBILE_MONEY';
  activationLocation?: string;
}

export interface ActivateHardTicketResponse {
  success: boolean;
  message: string;
  booking?: {
    id: string;
    bookingReference: string;
    status: string;
    totalPrice: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    paymentMethod?: string;
  };
  ticket?: {
    id: string;
    ticketCode: string;
    status: string;
    activatedAt: string;
    commissionAmount?: number;
    event?: {
      title: string;
      date: string;
      venue?: string;
    };
    ticketCategory?: {
      categoryName: string;
      price: string;
    };
  };
}

// Ticket Status Response
export interface TicketStatusResponse {
  id: string;
  ticketCode: string;
  type: 'SOFT' | 'HARD';
  status: 'AVAILABLE' | 'SOLD' | 'SCANNED' | 'EXPIRED' | 'CANCELLED' | 'INVALID' | 'RETURNED';
  issuedAt?: string;
  scannedAt?: string;
  expiresAt?: string;
  scanLocation?: string;
  scanNotes?: string;
  scannedBy?: {
    name: string;
    email: string;
  };
  staff?: {
    name: string;
    email: string;
  } | null;
  booking?: {
    bookingReference: string;
    customerName?: string;
    customerEmail?: string;
    quantity: number;
    scannedTickets: number;
    isFullyScanned: boolean;
  };
  event?: {
    title: string;
    date: string;
    venue?: string;
    location?: string;
  };
  ticketCategory?: {
    categoryName: string;
    price: string;
  };
  scanHistory?: {
    id: string;
    scannedAt: string;
    wasSuccessful: boolean;
    failureReason?: string | null;
    scanLocation?: string;
    scannedBy: string;
    staff?: string | null;
  }[];
}

// QR Code Validation Response
export interface ValidateQRCodeResponse {
  success: boolean;
  message: string;
  data?: {
    ticketCode: string;
    type?: 'SOFT' | 'HARD';
    bookingReference?: string;
    eventId?: string;
    categoryId?: string;
    signatureVerified: boolean;
    warning?: string;
  } | null;
}

export interface BookingScanStatus {
  booking: {
    id: string;
    bookingReference: string;
    quantity: number;
    scannedTickets: number;
    isFullyScanned: boolean;
    customerName?: string;
    customerEmail?: string;
  };
  event: {
    id: string;
    title: string;
    date: string;
    venue?: string;
  };
  ticketCategory: {
    id: string;
    categoryName: string;
    price: number;
  };
  scans: {
    id: string;
    ticketCode: string;
    scannedAt: string;
    wasSuccessful: boolean;
    scannedBy: {
      id: string;
      name: string;
      email: string;
      isStaff: boolean;
    };
    scanLocation?: string;
    notes?: string;
  }[];
}

export interface EventScanHistory {
  id: string;
  ticketCode: string;
  scannedAt: string;
  wasSuccessful: boolean;
  scannedBy: {
    id: string;
    name: string;
    email: string;
    isStaff: boolean;
  };
  scanLocation?: string;
  notes?: string;
  booking: {
    id: string;
    bookingReference: string;
    customerName?: string;
    customerEmail?: string;
  };
  ticketCategory: {
    id: string;
    categoryName: string;
    price: number;
  };
}

export const ticketScanningApi = {
  // Scan a ticket (supports both plain codes and QR JSON)
  scanTicket: async (data: CreateTicketScanDto): Promise<ScanTicketResponse> => {
    const response = await apiClient.post('/tickets/scan', data);
    return response.data;
  },

  // Activate hard ticket
  activateHardTicket: async (data: ActivateHardTicketDto): Promise<ActivateHardTicketResponse> => {
    const response = await apiClient.post('/tickets/activate', data);
    return response.data;
  },

  // Get ticket status (public endpoint)
  getTicketStatus: async (ticketCode: string): Promise<TicketStatusResponse> => {
    const response = await apiClient.get(`/tickets/status/${encodeURIComponent(ticketCode)}`);
    return response.data;
  },

  // Get scan history for an event
  getEventScanHistory: async (eventId: string): Promise<EventScanHistory[]> => {
    const response = await apiClient.get(`/tickets/event/${eventId}/scan-history`);
    return response.data;
  },

  // Get booking scan status
  getBookingScanStatus: async (bookingReference: string): Promise<BookingScanStatus> => {
    const response = await apiClient.get(`/tickets/booking/${bookingReference}/scan-status`);
    return response.data;
  },

  // Validate QR code data and signature
  validateQRCode: async (qrData: string): Promise<ValidateQRCodeResponse> => {
    const response = await apiClient.post('/tickets/validate-qr', { qrData });
    return response.data;
  },

  // Generate QR code data
  generateQRCodeData: async (ticketCode: string, bookingReference: string) => {
    const response = await apiClient.get(`/tickets/qr-data/${ticketCode}/${bookingReference}`);
    return response.data;
  }
};
