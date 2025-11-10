import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ticketScanningApi, 
  CreateTicketScanDto, 
  ScanTicketResponse, 
  BookingScanStatus, 
  EventScanHistory,
  ActivateHardTicketDto,
  ActivateHardTicketResponse,
  TicketStatusResponse,
  ValidateQRCodeResponse
} from '@/lib/api/ticket-scanning';

export const useScanTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<ScanTicketResponse, Error, CreateTicketScanDto>({
    mutationFn: ticketScanningApi.scanTicket,
    onSuccess: (data) => {
      // Invalidate relevant queries after successful scan
      if (data.success) {
        // Try to get eventId from data.event.id (this is the primary location)
        const eventId = data.data?.event?.id;
        
        if (eventId) {
          queryClient.invalidateQueries({ 
            queryKey: ['event-scan-history', eventId] 
          });
        }
        
        if (data.ticket?.booking?.bookingReference || data.data?.booking?.bookingReference) {
          const bookingRef = data.ticket?.booking?.bookingReference || data.data?.booking?.bookingReference;
          queryClient.invalidateQueries({ 
            queryKey: ['booking-scan-status', bookingRef] 
          });
        }
        // Invalidate ticket status
        if (data.ticket?.ticketCode) {
          queryClient.invalidateQueries({ 
            queryKey: ['ticket-status', data.ticket.ticketCode] 
          });
        }
      }
    }
  });
};

export const useActivateHardTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<ActivateHardTicketResponse, Error, ActivateHardTicketDto>({
    mutationFn: ticketScanningApi.activateHardTicket,
    onSuccess: (data) => {
      if (data.success && data.ticket) {
        // Invalidate ticket status
        queryClient.invalidateQueries({ 
          queryKey: ['ticket-status', data.ticket.ticketCode] 
        });
        // Note: event.id is not available in ticket.event object
        // Event scan history will be invalidated on page refresh or manual refetch
      }
    }
  });
};

export const useTicketStatus = (ticketCode: string, enabled: boolean = true) => {
  return useQuery<TicketStatusResponse>({
    queryKey: ['ticket-status', ticketCode],
    queryFn: () => ticketScanningApi.getTicketStatus(ticketCode),
    enabled: enabled && !!ticketCode,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1, // Only retry once for not found errors
  });
};

export const useEventScanHistory = (eventId: string, enabled: boolean = true) => {
  return useQuery<EventScanHistory[]>({
    queryKey: ['event-scan-history', eventId],
    queryFn: () => ticketScanningApi.getEventScanHistory(eventId),
    enabled: enabled && !!eventId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useBookingScanStatus = (bookingReference: string, enabled: boolean = true) => {
  return useQuery<BookingScanStatus>({
    queryKey: ['booking-scan-status', bookingReference],
    queryFn: () => ticketScanningApi.getBookingScanStatus(bookingReference),
    enabled: enabled && !!bookingReference,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useValidateQRCode = () => {
  return useMutation<ValidateQRCodeResponse, Error, string>({
    mutationFn: (qrData: string) => ticketScanningApi.validateQRCode(qrData),
  });
};

export const useGenerateQRCodeData = () => {
  return useMutation({
    mutationFn: ({ ticketCode, bookingReference }: { ticketCode: string; bookingReference: string }) =>
      ticketScanningApi.generateQRCodeData(ticketCode, bookingReference),
  });
};
