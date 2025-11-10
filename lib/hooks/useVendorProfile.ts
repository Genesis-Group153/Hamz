import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi, VendorProfile, UpdateVendorProfile } from '../api/vendor';
import { toast } from 'sonner';

export function useVendorProfile() {
  return useQuery<VendorProfile, Error>({
    queryKey: ['vendor-profile'],
    queryFn: vendorApi.getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();

  return useMutation<VendorProfile, Error, UpdateVendorProfile>({
    mutationFn: vendorApi.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
}




