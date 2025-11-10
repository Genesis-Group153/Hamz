import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ticketsApi, 
  CreateTicketDto,
  UpdateTicketDto, 
  UpdateTicketStatusDto, 
  BulkUpdateTicketStatusDto,
  HardTicketSettings,
  QueryTicketsDto,
  TicketListResponse
} from '../api/tickets';

// Create ticket category
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData: CreateTicketDto) => {
      console.log('Creating ticket with data:', ticketData);
      const result = await ticketsApi.createTicket(ticketData);
      console.log('Ticket created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data);
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendorTickets'] });
      toast.success('Ticket category created successfully!');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket category');
    }
  });
};

// Update ticket category
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ticketCategoryId, 
      data 
    }: { 
      ticketCategoryId: string; 
      data: UpdateTicketDto 
    }) => {
      console.log('Updating ticket with data:', { ticketCategoryId, data });
      const result = await ticketsApi.updateTicket(ticketCategoryId, data);
      console.log('Ticket updated successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendorTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketCategoryWithStatus', data.id] });
      toast.success('Ticket category updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update ticket category');
    }
  });
};

// Get tickets for an event
export const useEventTickets = (eventId: string) => {
  return useQuery({
    queryKey: ['eventTickets', eventId],
    queryFn: () => ticketsApi.getEventTickets(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get vendor's ticket categories
export const useVendorTickets = () => {
  return useQuery({
    queryKey: ['vendorTickets'],
    queryFn: ticketsApi.getVendorTickets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get ticket category details with status
export const useTicketCategoryWithStatus = (ticketCategoryId: string) => {
  return useQuery({
    queryKey: ['ticketCategoryWithStatus', ticketCategoryId],
    queryFn: () => ticketsApi.getTicketCategoryWithStatus(ticketCategoryId),
    enabled: !!ticketCategoryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Update ticket status
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ticketCategoryId, 
      data 
    }: { 
      ticketCategoryId: string; 
      data: UpdateTicketStatusDto 
    }) => {
      console.log('Updating ticket status:', { ticketCategoryId, data });
      const result = await ticketsApi.updateTicketStatus(ticketCategoryId, data);
      console.log('Ticket status updated successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Status update successful:', data);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendorTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketCategoryWithStatus', data.id] });
      toast.success('Ticket status updated successfully!');
    },
    onError: (error: any) => {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update ticket status');
    }
  });
};

// Bulk update ticket status
export const useBulkUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdateTicketStatusDto) => {
      console.log('Bulk updating ticket status:', data);
      const result = await ticketsApi.bulkUpdateTicketStatus(data);
      console.log('Bulk update successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Bulk update successful:', data);
      // Invalidate all ticket-related queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets'] });
      queryClient.invalidateQueries({ queryKey: ['vendorTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketCategoryWithStatus'] });
      toast.success(`Successfully updated ${data.updatedCount} ticket categories!`);
    },
    onError: (error: any) => {
      console.error('Bulk update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update ticket statuses');
    }
  });
};

// Check and auto-update ticket status
export const useCheckAndUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketCategoryId: string) => {
      console.log('Checking and updating ticket status for:', ticketCategoryId);
      const result = await ticketsApi.checkAndUpdateTicketStatus(ticketCategoryId);
      console.log('Status check and update successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Status check successful:', data);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['vendorTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketCategoryWithStatus', data.id] });
      toast.success('Ticket status checked and updated!');
    },
    onError: (error: any) => {
      console.error('Status check error:', error);
      toast.error(error.response?.data?.message || 'Failed to check ticket status');
    }
  });
};

// Get hard ticket settings (public endpoint)
export const useHardTicketSettings = () => {
  return useQuery<HardTicketSettings>({
    queryKey: ['hardTicketSettings'],
    queryFn: () => ticketsApi.getHardTicketSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes - settings don't change often
    retry: 2,
  });
};

// Query tickets with filters
export const useTicketList = (params: QueryTicketsDto = {}) => {
  return useQuery<TicketListResponse>({
    queryKey: ['ticketList', params],
    queryFn: () => ticketsApi.getTicketList(params),
    staleTime: 30 * 1000, // 30 seconds - ticket data can change frequently
    placeholderData: (previousData) => previousData, // For smooth pagination
  });
};

// Delete ticket category
export const useDeleteTicketCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketCategoryId: string) => {
      const result = await ticketsApi.deleteTicketCategory(ticketCategoryId);
      return result;
    },
    onSuccess: (data, ticketCategoryId) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['eventTickets'] });
      queryClient.invalidateQueries({ queryKey: ['vendorTickets'] });
      queryClient.invalidateQueries({ queryKey: ['vendorEvents'] });
      toast.success('Ticket category deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete ticket category';
      toast.error(errorMessage);
    },
  });
};
