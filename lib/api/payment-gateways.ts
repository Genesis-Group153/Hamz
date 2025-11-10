import apiClient from './client';

export interface AvailableGateway {
  code: string;
  displayName: string;
  description: string;
  logo?: string;
  priority: number;
  supportedCurrencies: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface GatewayStatus {
  code: string;
  isAvailable: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  maintenanceMessage?: string;
  estimatedUptime?: string;
}

/**
 * Fetch all available payment gateways
 */
export const getAvailableGateways = async (): Promise<AvailableGateway[]> => {
  const response = await apiClient.get('/payment-gateways/available');
  return response.data;
};

/**
 * Check status of a specific payment gateway
 */
export const checkGatewayStatus = async (code: string): Promise<GatewayStatus> => {
  const response = await apiClient.get(`/payment-gateways/${code}/status`);
  return response.data;
};

/**
 * Filter gateways by currency and amount
 */
export const filterGatewaysByCriteria = (
  gateways: AvailableGateway[],
  currency: string,
  amount: number
): AvailableGateway[] => {
  return gateways.filter((gateway) => {
    const supportsCurrency = gateway.supportedCurrencies.includes(currency);
    const meetsMinimum = !gateway.minAmount || amount >= gateway.minAmount;
    const meetsMaximum = !gateway.maxAmount || amount <= gateway.maxAmount;
    
    return supportsCurrency && meetsMinimum && meetsMaximum;
  });
};

