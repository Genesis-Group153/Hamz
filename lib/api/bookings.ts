import apiClient from './client';

export interface CreateBookingDto {
  ticketCategoryId: string;
  quantity: number;
}

export interface CreateBookingWithPaymentDto {
  ticketCategoryId: string;
  quantity: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  gateway: string; // Required: PESPAL, MTN, or AIRTEL
}

export interface PaymentInfo {
  ipnId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  externalId?: string;
}

export interface BookingWithPaymentResponse {
  success: boolean;
  message: string;
  gateway: string; // Gateway code used (PESPAL, MTN, AIRTEL)
  gatewayDisplayName: string; // Human-readable gateway name
  booking: BookingResponse;
  payment: PaymentInfo;
}

export interface BookingResponse {
  id: string;
  bookingReference: string;
  eventId: string;
  ticketCategoryId: string;
  quantity: number;
  totalPrice: number;
  status: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  ticketCodes?: string[];
  qrCodes?: string[];
  event?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    location?: string;
    venue?: string;
  };
  ticketCategory?: {
    id: string;
    categoryName: string;
    price: number;
  };
}

export const bookingsApi = {
  // Create anonymous booking (no authentication required)
  createBooking: async (data: CreateBookingDto): Promise<BookingResponse> => {
    console.log('Creating booking with data:', data);
    const response = await apiClient.post('/end-users/bookings', data);
    console.log('Booking created:', response.data);
    return response.data;
  },

  // Create booking with payment integration (authenticated users only)
  createBookingWithPayment: async (data: CreateBookingWithPaymentDto): Promise<BookingWithPaymentResponse> => {
    console.log('Creating booking with payment:', data);
    const response = await apiClient.post('/bookings/with-payment', data);
    console.log('Booking with payment created:', response.data);
    return response.data;
  },

  // Submit payment order (for PesaPal only - do NOT include gateway field)
  // This endpoint is ONLY for PesaPal and should not be used for MTN/Airtel
  submitPaymentOrder: async (orderData: any): Promise<any> => {
    console.log('Submitting payment order:', orderData);
    
    // Remove gateway field if present (causes validation error)
    const { gateway, ...paymentData } = orderData;
    
    const response = await apiClient.post('/pespal/payment/submit-order', paymentData);
    console.log('Payment order submitted:', response.data);
    return response.data;
  },

  // Get booking by reference (for confirmation)
  getBookingByReference: async (reference: string): Promise<BookingResponse> => {
    console.log('Fetching booking by reference:', reference);
    const response = await apiClient.get(`/end-users/bookings/${reference}`);
    console.log('Booking found:', response.data);
    return response.data;
  },
};
