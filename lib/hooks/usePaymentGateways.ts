import { useQuery } from '@tanstack/react-query';
import { getAvailableGateways, checkGatewayStatus, AvailableGateway, GatewayStatus } from '../api/payment-gateways';

/**
 * Hook to fetch available payment gateways
 */
export const useAvailableGateways = () => {
  return useQuery<AvailableGateway[], Error>({
    queryKey: ['payment-gateways', 'available'],
    queryFn: getAvailableGateways,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to check gateway status
 */
export const useGatewayStatus = (code: string, enabled: boolean = false) => {
  return useQuery<GatewayStatus, Error>({
    queryKey: ['payment-gateway-status', code],
    queryFn: () => checkGatewayStatus(code),
    enabled,
    refetchInterval: 30000, // Check every 30 seconds
  });
};

