import apiClient from './client';

export interface VendorDashboardAnalytics {
  totalEvents: number;
  activeEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  completedEvents: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalTicketsAvailable: number;
  avgTicketPrice: number;
  conversionRate: number;
  recentBookings: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
}

export interface RecentBooking {
  id: string;
  bookingReference: string;
  eventTitle: string;
  customerName: string;
  amount: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface VendorDashboard {
  analytics: VendorDashboardAnalytics;
  recentBookings: RecentBooking[];
}

export interface EventBooking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  ticketCategoryName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  phone?: string;
  businessAddress?: string;
  taxId?: string;
  bankDetails?: string;
  isApproved: boolean;
  platformCommission?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVendorProfile {
  name?: string;
  email?: string;
  companyName?: string;
  phone?: string;
  businessAddress?: string;
  taxId?: string;
  bankDetails?: string;
}

export interface VendorBooking {
  id: string;
  bookingReference: string;
  eventId: string;
  eventTitle: string;
  ticketCategoryId: string;
  ticketCategoryName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  quantity: number;
  totalPrice: number;
  status: string;
  ticketsScanned: number;
  ticketsUnscanned: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorBookingsResponse {
  bookings: VendorBooking[];
  total: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalScanned: number;
  totalUnscanned: number;
}

export interface BookingsFilters {
  eventId?: string;
  ticketCategoryId?: string;
  status?: 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  scanStatus?: 'ALL' | 'SCANNED' | 'UNSCANNED';
  search?: string;
}

export const vendorApi = {
  // Get vendor dashboard analytics
  getDashboard: async (): Promise<VendorDashboard> => {
    try {
      console.log('🔍 Fetching vendor dashboard...');
      const response = await apiClient.get('/vendors/dashboard');
      console.log('✅ Dashboard data received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Dashboard API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all vendor events
  getEvents: async () => {
    const { data } = await apiClient.get('/vendors/events');
    return data;
  },

  // Get event analytics
  getEventAnalytics: async (eventId: string) => {
    const { data } = await apiClient.get(`/vendors/events/${eventId}/analytics`);
    return data;
  },

  // Get event bookings
  getEventBookings: async (eventId: string): Promise<EventBooking[]> => {
    const { data } = await apiClient.get(`/vendors/events/${eventId}/bookings`);
    return data;
  },

  // Create event
  createEvent: async (eventData: any) => {
    const { data } = await apiClient.post('/vendors/events', eventData);
    return data;
  },

  // Update event
  updateEvent: async (eventId: string, eventData: any) => {
    const { data } = await apiClient.put(`/vendors/events/${eventId}`, eventData);
    return data;
  },

  // Publish event
  publishEvent: async (eventId: string) => {
    const { data } = await apiClient.put(`/vendors/events/${eventId}/publish`);
    return data;
  },

  // Unpublish event
  unpublishEvent: async (eventId: string) => {
    const { data } = await apiClient.put(`/vendors/events/${eventId}/unpublish`);
    return data;
  },

  // Cancel event
  cancelEvent: async (eventId: string) => {
    const { data} = await apiClient.put(`/vendors/events/${eventId}/cancel`);
    return data;
  },

  // Delete event
  deleteEvent: async (eventId: string) => {
    const { data } = await apiClient.delete(`/vendors/events/${eventId}`);
    return data;
  },

  // Get vendor profile
  getProfile: async (): Promise<VendorProfile> => {
    const { data } = await apiClient.get('/vendors/profile');
    return data;
  },

  // Update vendor profile
  updateProfile: async (profileData: UpdateVendorProfile): Promise<VendorProfile> => {
    const { data } = await apiClient.put('/vendors/profile', profileData);
    return data;
  },

  // Get all bookings with filters
  getAllBookings: async (filters?: BookingsFilters): Promise<VendorBookingsResponse> => {
    const params = new URLSearchParams();
    if (filters?.eventId) params.append('eventId', filters.eventId);
    if (filters?.ticketCategoryId) params.append('ticketCategoryId', filters.ticketCategoryId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.scanStatus) params.append('scanStatus', filters.scanStatus);
    if (filters?.search) params.append('search', filters.search);
    
    const { data } = await apiClient.get(`/vendors/bookings?${params.toString()}`);
    return data;
  },
};

