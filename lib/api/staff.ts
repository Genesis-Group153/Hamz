import { apiClient } from './client';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  permissions?: string[];
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  recentScans: number;
}

export interface StaffScanHistory {
  id: string;
  ticketCode: string;
  scannedAt: string;
  scanLocation?: string;
  notes?: string;
  event: {
    id: string;
    title: string;
    date: string;
  };
  ticketCategory: string;
  customerName?: string;
}

export interface StaffLoginCredentials {
  email: string;
  password: string;
}

export interface StaffAuthResponse {
  access_token: string;
  staff: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    position?: string;
    permissions: string[];
    isActive: boolean;
    vendorId: string;
    vendor: {
      id: string;
      name: string;
      email: string;
      companyName?: string;
    };
  };
}

export const staffApi = {
  // Staff Management
  createStaff: async (data: CreateStaffDto): Promise<Staff> => {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },

  getVendorStaff: async (): Promise<Staff[]> => {
    const response = await apiClient.get('/staff');
    return response.data;
  },

  getStaffById: async (staffId: string): Promise<Staff> => {
    const response = await apiClient.get(`/staff/${staffId}`);
    return response.data;
  },

  updateStaff: async (staffId: string, data: UpdateStaffDto): Promise<Staff> => {
    const response = await apiClient.put(`/staff/${staffId}`, data);
    return response.data;
  },

  deleteStaff: async (staffId: string): Promise<void> => {
    const response = await apiClient.delete(`/staff/${staffId}`);
    return response.data;
  },

  getStaffStats: async (): Promise<StaffStats> => {
    const response = await apiClient.get('/staff/stats');
    return response.data;
  },

  getStaffScanHistory: async (staffId: string, limit: number = 50): Promise<StaffScanHistory[]> => {
    const response = await apiClient.get(`/staff/${staffId}/scan-history?limit=${limit}`);
    return response.data;
  },

  // Staff Authentication
  loginStaff: async (credentials: StaffLoginCredentials): Promise<StaffAuthResponse> => {
    const response = await apiClient.post('/staff/auth/login', credentials);
    return response.data;
  },

  getStaffProfile: async (): Promise<StaffAuthResponse['staff']> => {
    const response = await apiClient.get('/staff/profile');
    return response.data;
  },

  // Staff Events (events they can scan for)
  getStaffEvents: async (): Promise<any[]> => {
    const response = await apiClient.get('/staff/events');
    return response.data;
  },

  // Staff-Event Assignment (Vendor only)
  assignStaffToEvent: async (staffId: string, eventId: string): Promise<any> => {
    const response = await apiClient.post(`/staff/${staffId}/assign-event/${eventId}`);
    return response.data;
  },

  unassignStaffFromEvent: async (staffId: string, eventId: string): Promise<any> => {
    const response = await apiClient.delete(`/staff/${staffId}/unassign-event/${eventId}`);
    return response.data;
  },

  getEventStaff: async (eventId: string): Promise<any[]> => {
    const response = await apiClient.get(`/staff/event/${eventId}/assigned-staff`);
    return response.data;
  },

  getStaffAssignedEvents: async (staffId: string): Promise<any[]> => {
    const response = await apiClient.get(`/staff/${staffId}/assigned-events`);
    return response.data;
  }
};
