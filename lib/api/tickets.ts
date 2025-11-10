import { apiClient } from './client';

export interface CreateTicketDto {
  eventId: string;
  categoryName: string;
  price: number;
  quantity: number;
  description?: string;
  salesStart?: string;
  salesEnd?: string;
  salesType: 'ONLINE_ONLY' | 'HYBRID';
  hardTicketPercentage?: number;
}

export interface TicketResponse {
  id: string;
  eventId: string;
  categoryName: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  availableQuantity: number;
  description?: string;
  salesStart?: string;
  salesEnd?: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'UNAVAILABLE';
  salesType?: 'ONLINE_ONLY' | 'HYBRID';
  hardTicketPercentage?: string | number;
  calculatedHardTickets?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketCategoryWithStatus extends TicketResponse {
  event: {
    id: string;
    title: string;
    status: string;
  };
  bookings: Array<{
    id: string;
    quantity: number;
    status: string;
  }>;
}

export interface UpdateTicketStatusDto {
  status: 'AVAILABLE' | 'SOLD_OUT' | 'UNAVAILABLE';
}

export interface BulkUpdateTicketStatusDto {
  ticketIds: string[];
  status: 'AVAILABLE' | 'SOLD_OUT' | 'UNAVAILABLE';
}

export interface UpdateTicketDto {
  categoryName?: string;
  price?: number;
  quantity?: number;
  description?: string;
  salesStart?: string;
  salesEnd?: string;
  salesType?: 'ONLINE_ONLY' | 'HYBRID';
  hardTicketPercentage?: number;
}

export interface HardTicketSettings {
  defaultPercentage: number;
  maxPercentage: number;
  description: {
    default: string;
  };
}

// Query Tickets DTO
export interface QueryTicketsDto {
  type?: 'SOFT' | 'HARD';
  status?: string;
  eventId?: string;
  ticketCategoryId?: string;
  bookingId?: string | null;
  hasBooking?: boolean;
  ticketCode?: string;
  issuedAfter?: string;
  issuedBefore?: string;
  scannedAfter?: string;
  scannedBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: 'issuedAt' | 'scannedAt' | 'createdAt' | 'ticketCode';
  sortOrder?: 'asc' | 'desc';
}

// Individual Ticket Response (from /tickets/list)
export interface IndividualTicket {
  id: string;
  ticketCode: string;
  type: 'SOFT' | 'HARD';
  status: 'AVAILABLE' | 'SCANNED' | 'EXPIRED' | 'CANCELLED' | 'SOLD' | 'RETURNED' | string;
  issuedAt: string;
  scannedAt: string | null;
  expiresAt: string;
  activatedAt: string | null;
  activatedBy: string | null;
  activationLocation: string | null;
  commissionAmount: number | null;
  returnedAt: string | null;
  returnedBy: string | null;
  scanLocation: string | null;
  scanNotes: string | null;
  printedAt: string | null;
  printedBy: string | null;
  booking: {
    id: string;
    bookingReference: string;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    quantity: number;
    status: string;
    scannedTickets: number;
    isFullyScanned: boolean;
  } | null;
  event: {
    id: string;
    title: string;
    date: string;
    venue: string | null;
    location: string | null;
  } | null;
  ticketCategory: {
    id: string;
    categoryName: string;
    price: number;
  } | null;
  scannedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  staff: {
    id: string;
    name: string;
    position: string;
  } | null;
}

// Ticket List Response
export interface TicketListResponse {
  data: IndividualTicket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const ticketsApi = {
  // Create a new ticket category
  createTicket: async (data: CreateTicketDto): Promise<TicketResponse> => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  // Update a ticket category
  updateTicket: async (ticketCategoryId: string, data: UpdateTicketDto): Promise<TicketResponse> => {
    const response = await apiClient.put(`/tickets/categories/${ticketCategoryId}`, data);
    return response.data;
  },

  // Get tickets for a specific event
  getEventTickets: async (eventId: string): Promise<TicketResponse[]> => {
    const response = await apiClient.get(`/tickets/event/${eventId}`);
    return response.data;
  },

  // Get vendor's ticket categories
  getVendorTickets: async (): Promise<TicketResponse[]> => {
    const response = await apiClient.get('/tickets/my-tickets');
    return response.data;
  },

  // Get ticket category details with status
  getTicketCategoryWithStatus: async (ticketCategoryId: string): Promise<TicketCategoryWithStatus> => {
    const response = await apiClient.get(`/tickets/categories/${ticketCategoryId}`);
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (ticketCategoryId: string, data: UpdateTicketStatusDto): Promise<TicketResponse> => {
    const response = await apiClient.put(`/tickets/categories/${ticketCategoryId}/status`, data);
    return response.data;
  },

  // Bulk update ticket status
  bulkUpdateTicketStatus: async (data: BulkUpdateTicketStatusDto): Promise<{ success: boolean; updatedCount: number }> => {
    const response = await apiClient.put('/tickets/bulk-update-status', data);
    return response.data;
  },

  // Check and auto-update ticket status
  checkAndUpdateTicketStatus: async (ticketCategoryId: string): Promise<TicketResponse> => {
    const response = await apiClient.put(`/tickets/categories/${ticketCategoryId}/check-status`);
    return response.data;
  },

  // Get hard ticket settings (public endpoint)
  getHardTicketSettings: async (): Promise<HardTicketSettings> => {
    const response = await apiClient.get('/tickets/settings/hard-ticket');
    return response.data;
  },

  // Query tickets with filters (GET /tickets/list)
  getTicketList: async (params: QueryTicketsDto = {}): Promise<TicketListResponse> => {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.eventId) queryParams.append('eventId', params.eventId);
    if (params.ticketCategoryId) queryParams.append('ticketCategoryId', params.ticketCategoryId);
    if (params.bookingId !== undefined) {
      queryParams.append('bookingId', params.bookingId === null ? 'null' : params.bookingId);
    }
    if (params.hasBooking !== undefined) queryParams.append('hasBooking', String(params.hasBooking));
    if (params.ticketCode) queryParams.append('ticketCode', params.ticketCode);
    if (params.issuedAfter) queryParams.append('issuedAfter', params.issuedAfter);
    if (params.issuedBefore) queryParams.append('issuedBefore', params.issuedBefore);
    if (params.scannedAfter) queryParams.append('scannedAfter', params.scannedAfter);
    if (params.scannedBefore) queryParams.append('scannedBefore', params.scannedBefore);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/tickets/list?${queryString}` : '/tickets/list';
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get printable tickets (preview only, doesn't mark as printed)
  getPrintableTickets: async (ticketCategoryId: string, limit: number = 20): Promise<{
    printableCount: number;
    tickets: IndividualTicket[];
  }> => {
    const response = await apiClient.get(
      `/tickets/categories/${ticketCategoryId}/printable?limit=${limit}`
    );
    return response.data;
  },

  // Get printable tickets with QR codes (marks as printed)
  getPrintableTicketsWithQRCodes: async (ticketCategoryId: string, limit: number = 20): Promise<{
    message: string;
    ticketCategory: {
      id: string;
      categoryName: string;
      event: {
        id: string;
        title: string;
        date: string;
        venue: string | null;
      };
    };
    printableCount: number;
    printedCount: number;
    tickets: Array<{
      id: string;
      ticketCode: string;
      status: string;
      createdAt: string;
      qrCode: string; // Base64 image
    }>;
    qrCodes: string[]; // Array of base64 images
  }> => {
    const response = await apiClient.get(
      `/tickets/categories/${ticketCategoryId}/printable-with-qrcodes?limit=${limit}`
    );
    return response.data;
  },

  // Print single ticket by ticket code
  printSingleTicket: async (ticketCode: string): Promise<{
    success: boolean;
    message: string;
    ticket: {
      id: string;
      ticketCode: string;
      status: string;
      printedAt: string;
      printedBy: string;
      qrCode: string; // Base64 image
    };
    event?: {
      id: string;
      title: string;
      date: string;
      venue: string | null;
    };
    ticketCategory?: {
      id: string;
      categoryName: string;
      price: number;
    };
  }> => {
    const response = await apiClient.post(`/tickets/print-single/${ticketCode}`);
    return response.data;
  },

  // Mark tickets as printed (manual)
  markTicketsAsPrinted: async (ticketIds: string[]): Promise<{
    success: boolean;
    updatedCount: number;
  }> => {
    const response = await apiClient.post('/tickets/mark-printed', { ticketIds });
    return response.data;
  },

  // Delete ticket category
  deleteTicketCategory: async (ticketCategoryId: string): Promise<{
    message: string;
    statusCode: number;
  }> => {
    const response = await apiClient.delete(`/tickets/categories/${ticketCategoryId}`);
    return response.data;
  },
};
