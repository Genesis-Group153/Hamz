import { useMutation, useQuery } from '@tanstack/react-query';
import { bookingsApi, CreateBookingDto, CreateBookingWithPaymentDto } from '@/lib/api/bookings';
import { toast } from 'sonner';

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (data: CreateBookingDto) => {
      console.log('useCreateBooking: Starting booking creation with data:', data);
      return bookingsApi.createBooking(data);
    },
    onSuccess: (data) => {
      console.log('useCreateBooking: Booking created successfully:', data);
      toast.success('Booking confirmed! Check your email/SMS for ticket details.');
    },
    onError: (error: any) => {
      console.error('useCreateBooking: Booking failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useCreateBookingWithPayment = () => {
  return useMutation({
    mutationFn: (data: CreateBookingWithPaymentDto) => {
      console.log('useCreateBookingWithPayment: Starting booking with payment creation:', data);
      return bookingsApi.createBookingWithPayment(data);
    },
    onSuccess: (data) => {
      console.log('useCreateBookingWithPayment: Booking created successfully:', data);
    },
    onError: (error: any) => {
      console.error('useCreateBookingWithPayment: Booking failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useSubmitPaymentOrder = () => {
  return useMutation({
    mutationFn: (orderData: any) => {
      console.log('useSubmitPaymentOrder: Submitting payment order:', orderData);
      return bookingsApi.submitPaymentOrder(orderData);
    },
    onSuccess: (data) => {
      console.log('useSubmitPaymentOrder: Payment order submitted:', data);
      // Return the redirect_url instead of redirecting - let the component handle it
      return data;
    },
    onError: (error: any) => {
      console.error('useSubmitPaymentOrder: Payment submission failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit payment order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useBookingByReference = (reference: string) => {
  return useQuery({
    queryKey: ['booking', reference],
    queryFn: () => {
      console.log('useBookingByReference: Fetching booking for reference:', reference);
      return bookingsApi.getBookingByReference(reference);
    },
    enabled: !!reference,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
