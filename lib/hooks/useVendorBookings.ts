import { useQuery } from '@tanstack/react-query';
import { vendorApi, VendorBookingsResponse, BookingsFilters } from '../api/vendor';

export function useVendorBookings(filters?: BookingsFilters) {
  return useQuery<VendorBookingsResponse, Error>({
    queryKey: ['vendor-bookings', filters],
    queryFn: () => vendorApi.getAllBookings(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}




