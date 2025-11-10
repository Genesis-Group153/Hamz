import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '../api/vendor';

export function useVendorDashboard() {
  return useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: async () => {
      console.log('🔄 useVendorDashboard: Fetching dashboard data...');
      try {
        const data = await vendorApi.getDashboard();
        console.log('✅ useVendorDashboard: Data fetched successfully');
        return data;
      } catch (error) {
        console.error('❌ useVendorDashboard: Error fetching data:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useVendorEventAnalytics(eventId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['vendor-event-analytics', eventId],
    queryFn: () => vendorApi.getEventAnalytics(eventId),
    enabled: enabled && !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useEventBookings(eventId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['event-bookings', eventId],
    queryFn: () => vendorApi.getEventBookings(eventId),
    enabled: enabled && !!eventId,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: true,
  });
}

