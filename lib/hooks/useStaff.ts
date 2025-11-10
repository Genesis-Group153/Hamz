import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  staffApi, 
  CreateStaffDto, 
  UpdateStaffDto, 
  Staff, 
  StaffStats, 
  StaffScanHistory,
  StaffLoginCredentials,
  StaffAuthResponse
} from '@/lib/api/staff';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<Staff, Error, CreateStaffDto>({
    mutationFn: staffApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      toast.success('Staff member added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
    }
  });
};

export const useVendorStaff = () => {
  return useQuery<Staff[]>({
    queryKey: ['vendor-staff'],
    queryFn: staffApi.getVendorStaff,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useStaffById = (staffId: string, enabled: boolean = true) => {
  return useQuery<Staff>({
    queryKey: ['staff', staffId],
    queryFn: () => staffApi.getStaffById(staffId),
    enabled: enabled && !!staffId,
    staleTime: 30 * 1000,
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<Staff, Error, { staffId: string; data: UpdateStaffDto }>({
    mutationFn: ({ staffId, data }) => staffApi.updateStaff(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      toast.success('Staff member updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    }
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: staffApi.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete staff member');
    }
  });
};

export const useStaffStats = () => {
  return useQuery<StaffStats>({
    queryKey: ['staff-stats'],
    queryFn: staffApi.getStaffStats,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useStaffScanHistory = (staffId: string, limit: number = 50, enabled: boolean = true) => {
  return useQuery<StaffScanHistory[]>({
    queryKey: ['staff-scan-history', staffId, limit],
    queryFn: () => staffApi.getStaffScanHistory(staffId, limit),
    enabled: enabled && !!staffId,
    staleTime: 30 * 1000,
  });
};

// Staff Authentication Hooks
export const useStaffLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<StaffAuthResponse, Error, StaffLoginCredentials>({
    mutationFn: staffApi.loginStaff,
    onSuccess: (data) => {
      // Store staff token and data
      localStorage.setItem('staff_access_token', data.access_token);
      localStorage.setItem('staff_data', JSON.stringify(data.staff));
      
      // Invalidate and refetch staff queries
      queryClient.invalidateQueries({ queryKey: ['staff-profile'] });
      
      toast.success('Login successful!');
      router.push('/staff');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  });
};

export const useStaffProfile = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('staff_access_token') : null;
  
  return useQuery<StaffAuthResponse['staff']>({
    queryKey: ['staff-profile'],
    queryFn: async () => {
      // Get staff data from localStorage instead of API call for now
      if (typeof window !== 'undefined') {
        const staffData = localStorage.getItem('staff_data');
        if (staffData) {
          return JSON.parse(staffData);
        }
      }
      throw new Error('No staff data found');
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStaffEvents = () => {
  return useQuery<any[]>({
    queryKey: ['staff-events'],
    queryFn: staffApi.getStaffEvents,
    staleTime: 30 * 1000,
  });
};

export const useStaffLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    // Clear staff authentication data
    localStorage.removeItem('staff_access_token');
    localStorage.removeItem('staff_data');
    
    // Clear all queries
    queryClient.clear();
    
    toast.success('Logged out successfully');
    router.push('/staff/login');
  };
};

// Staff-Event Assignment Hooks (Vendor only)
export const useAssignStaffToEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { staffId: string; eventId: string }>({
    mutationFn: ({ staffId, eventId }) => staffApi.assignStaffToEvent(staffId, eventId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-assigned-events', variables.staffId] });
      queryClient.invalidateQueries({ queryKey: ['event-staff', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-staff'] });
      toast.success('Staff assigned to event successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign staff to event');
    }
  });
};

export const useUnassignStaffFromEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { staffId: string; eventId: string }>({
    mutationFn: ({ staffId, eventId }) => staffApi.unassignStaffFromEvent(staffId, eventId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-assigned-events', variables.staffId] });
      queryClient.invalidateQueries({ queryKey: ['event-staff', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-staff'] });
      toast.success('Staff unassigned from event successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unassign staff from event');
    }
  });
};

export const useEventStaff = (eventId: string, enabled: boolean = true) => {
  return useQuery<any[]>({
    queryKey: ['event-staff', eventId],
    queryFn: () => staffApi.getEventStaff(eventId),
    enabled: enabled && !!eventId,
    staleTime: 30 * 1000,
  });
};

export const useStaffAssignedEvents = (staffId: string, enabled: boolean = true) => {
  return useQuery<any[]>({
    queryKey: ['staff-assigned-events', staffId],
    queryFn: () => staffApi.getStaffAssignedEvents(staffId),
    enabled: enabled && !!staffId,
    staleTime: 30 * 1000,
  });
};
