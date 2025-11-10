'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStaffProfile, useStaffEvents } from '@/lib/hooks/useStaff';
import { 
  useScanTicket, 
  useEventScanHistory, 
  useActivateHardTicket,
  useTicketStatus 
} from '@/lib/hooks/useTicketScanning';
import { toast } from 'sonner';
import { 
  QrCode, 
  Ticket, 
  MapPin, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
  User,
  Calendar,
  Building2,
  Scan,
  Camera,
  Keyboard,
  Smartphone,
  Laptop,
  Monitor,
  Usb,
  Activity,
  Info,
  Shield,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScanTicketResponse } from '@/lib/api/ticket-scanning';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function StaffScanTicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [ticketCode, setTicketCode] = useState('');
  const [scanLocation, setScanLocation] = useState('');
  const [scanResult, setScanResult] = useState<ScanTicketResponse | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    eventId || null
  );
  const [actionMode, setActionMode] = useState<'scan' | 'activate'>('scan');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  
  // Hard ticket activation
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateTicketCode, setActivateTicketCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY'>('CASH');
  
  // Ticket status check
  const [checkTicketCode, setCheckTicketCode] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';
  
  // Track last scanned code and timestamp to prevent duplicate scans
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const { data: staffProfile } = useStaffProfile();
  const { data: events = [] } = useStaffEvents();
  const scanTicketMutation = useScanTicket();
  const activateTicketMutation = useActivateHardTicket();
  const { data: scanHistory = [], refetch: refetchHistory } = useEventScanHistory(
    selectedEventId || '',
    !!selectedEventId
  );
  const { data: ticketStatus, isLoading: statusLoading, refetch: refetchStatus } = useTicketStatus(
    checkTicketCode,
    showStatusModal && !!checkTicketCode
  );

  useEffect(() => {
    // Check if staff is logged in
    const token = localStorage.getItem('staff_access_token');
    if (!token) {
      router.push('/staff/login');
    }
  }, [router]);

  const selectedEvent = events.find(event => event.id === selectedEventId);

  const loadAvailableCameras = async () => {
    try {
      // Check if browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        toast.error('Camera access is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
        return;
      }

      // Check if page is secure (HTTPS or localhost)
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        toast.error('Camera access requires HTTPS. Please access the page via https:// or localhost');
        setCameraError('🔒 HTTPS Required: Camera access only works on secure connections (https://) or localhost. Please use https:// in the URL.');
        return;
      }

      // First, request permission to get actual camera labels
      let permissionGranted = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        permissionGranted = true;
      } catch (err: any) {
        console.log('Permission not granted yet:', err.name);
        if (err.name === 'NotAllowedError') {
          toast.error('Camera permission denied. Please allow camera access in browser settings.');
          return;
        }
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Video devices found:', videoDevices);
      
      setAvailableCameras(videoDevices);
      setShowCameraSelector(videoDevices.length > 0);
      
      if (videoDevices.length === 0) {
        toast.error('No cameras found on this device');
      } else {
        // Single consolidated success message
        toast.success(`✅ Ready! Found ${videoDevices.length} camera${videoDevices.length > 1 ? 's' : ''}. Select one below and click "Start Camera".`);
      }
    } catch (error) {
      console.error('Error loading cameras:', error);
      toast.error('Failed to load cameras. Please check browser permissions.');
    }
  };

  const handleManualScan = async () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    if (!ticketCode.trim()) {
      toast.error('Please enter a ticket code');
      return;
    }

    try {
      const result = await scanTicketMutation.mutateAsync({
        ticketCode: ticketCode.trim(),
        scanLocation: scanLocation.trim() || undefined,
        notes: undefined,
        staffId: staffProfile?.id
      });

      setScanResult(result);
      playFeedbackSound(result.success);
      
      if (result.success) {
        toast.success(result.message);
        setTicketCode('');
        setScanLocation('');
        refetchHistory();
      } else {
        const errorMessage = getErrorMessage(result);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to scan ticket';
      toast.error(errorMsg);
      playFeedbackSound(false);
    }
  };

  const handleQrCodeScan = async (decodedText: string) => {
    if (!selectedEventId || scanTicketMutation.isPending) {
      return;
    }

    // Prevent duplicate scans
    const now = Date.now();
    const trimmedCode = decodedText.trim();
    
    // Check if this is the same code scanned within the last 2 seconds
    if (
      lastScannedCodeRef.current === trimmedCode &&
      (now - lastScanTimeRef.current) < 2000
    ) {
      console.log('Duplicate scan prevented:', trimmedCode);
      return;
    }

    try {
      // Update last scanned code and timestamp
      lastScannedCodeRef.current = trimmedCode;
      lastScanTimeRef.current = now;

      const result = await scanTicketMutation.mutateAsync({
        ticketCode: trimmedCode,
        scanLocation: scanLocation.trim() || undefined,
        notes: undefined,
        staffId: staffProfile?.id
      });

      setScanResult(result);
      playFeedbackSound(result.success);
      
      if (result.success) {
        toast.success(result.message);
        refetchHistory();
        // Stop camera after successful scan
        await stopCamera();
        // Brief pause before next scan
        setTimeout(() => {
          setScanResult(null);
          // Allow scanning the same code again after 2 seconds
          if (lastScannedCodeRef.current === trimmedCode) {
            lastScannedCodeRef.current = '';
          }
        }, 2000);
      } else {
        // Enhanced error handling with specific error codes
        const errorMessage = getErrorMessage(result);
        toast.error(errorMessage);
        setTimeout(() => {
          setScanResult(null);
          // Allow scanning the same code again after 3 seconds on error
          if (lastScannedCodeRef.current === trimmedCode) {
            lastScannedCodeRef.current = '';
          }
        }, 3000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to scan ticket';
      toast.error(errorMsg);
      playFeedbackSound(false);
      // Allow scanning the same code again after error
      lastScannedCodeRef.current = '';
    }
  };

  // Enhanced error message helper
  const getErrorMessage = (result: ScanTicketResponse): string => {
    if (result.code === 'TICKET_NOT_ACTIVATED') {
      return 'This ticket has not been activated. Please activate it first before scanning at the gate.';
    }
    if (result.code === 'ALREADY_SCANNED') {
      return `Ticket already scanned${result.scannedAt ? ` at ${new Date(result.scannedAt).toLocaleString()}` : ''}`;
    }
    if (result.code === 'INVALID_QR_SIGNATURE') {
      return 'Invalid or tampered QR code. Signature verification failed.';
    }
    if (result.code === 'EVENT_CANCELLED') {
      return 'This event has been cancelled.';
    }
    if (result.code === 'EVENT_ENDED' || result.code === 'EVENT_PAST') {
      return 'This event has already ended.';
    }
    return result.message || 'Failed to scan ticket';
  };

  // Sound feedback (success/error)
  const playFeedbackSound = (success: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = success ? 800 : 300;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      // Audio not supported or failed
      console.log('Audio feedback not available');
    }
  };

  // Hard ticket activation handler
  const handleActivateHardTicket = async () => {
    if (!activateTicketCode.trim()) {
      toast.error('Please enter a ticket code');
      return;
    }

    try {
      const result = await activateTicketMutation.mutateAsync({
        ticketCode: activateTicketCode.trim(),
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        paymentMethod,
        activationLocation: scanLocation.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        playFeedbackSound(true);
        setShowActivateModal(false);
        setActivateTicketCode('');
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        refetchHistory();
      } else {
        toast.error(result.message);
        playFeedbackSound(false);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to activate ticket';
      toast.error(errorMsg);
      playFeedbackSound(false);
    }
  };

  // Check ticket status handler
  const handleCheckTicketStatus = async () => {
    if (!checkTicketCode.trim()) {
      toast.error('Please enter a ticket code');
      return;
    }

    setShowStatusModal(true);
    // Refetch will be triggered automatically when checkTicketCode changes
  };

  const startCamera = async (cameraId?: string) => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    setCameraError(null);
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
      }

      // Check if page is secure (HTTPS or localhost)
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        throw new Error('🔒 HTTPS Required: Camera access requires a secure connection (https://) or localhost. Please change your URL from http:// to https://');
      }

      // Stop and clear any existing camera instance
      if (html5QrCodeRef.current) {
        try {
          const scannerState = html5QrCodeRef.current.getState();
          // Only stop if scanner is actually running (state 2 = SCANNING)
          if (scannerState === 2) {
            await html5QrCodeRef.current.stop();
            console.log('Previous camera stopped');
          }
        } catch (stopErr) {
          console.log('Stop error (continuing):', stopErr);
        }
        
        // Clear with error suppression
        try {
          await html5QrCodeRef.current.clear();
          console.log('Scanner instance cleared');
        } catch (clearErr) {
          console.log('Clear error (non-critical):', clearErr);
        }
        
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
        
        // Wait for DOM to stabilize after cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get list of available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices);
      
      // Update available cameras list
      setAvailableCameras(videoDevices);
      setShowCameraSelector(videoDevices.length > 1);
      
      if (videoDevices.length === 0) {
        throw new Error('No camera found on this device');
      }

      // Request camera permission with any available camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('Camera permission granted');
        stream.getTracks().forEach(track => track.stop());
      } catch (permError: any) {
        console.error('Permission error:', permError);
        if (permError.name === 'NotAllowedError') {
          throw new Error('📷 Camera permission denied. Please click "Allow" when your browser asks for camera access.');
        }
        throw permError;
      }

      // Ensure DOM element exists and is ready
      const container = document.getElementById(qrCodeRegionId);
      if (!container) {
        throw new Error('Camera container not found in DOM');
      }

      // Always create a fresh Html5Qrcode instance to prevent DOM issues
      console.log('Creating fresh Html5Qrcode scanner instance...');
      html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

      const config = { 
        fps: 30,  // Increased from 10 to 30 for faster capture
        qrbox: { width: 300, height: 300 },  // Larger scan area for better detection
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]  // Optimize for camera scanning only
      };

      // Determine which camera to use
      let cameraStarted = false;
      let cameraType = '';

      // If user selected a specific camera, use that
      if (cameraId || selectedCameraId) {
        const deviceId = cameraId || selectedCameraId;
        const camera = videoDevices.find(d => d.deviceId === deviceId);
        
        try {
          await html5QrCodeRef.current.start(
            deviceId,
            config,
            (decodedText) => handleQrCodeScan(decodedText),
            () => {}
          );
          cameraStarted = true;
          cameraType = camera?.label || 'Selected Camera';
          setSelectedCameraId(deviceId);
        } catch (err) {
          console.error('Failed to start selected camera:', err);
        }
      }

      // Auto-select: Try rear camera first (environment-facing) on mobile
      if (!cameraStarted && videoDevices.length > 1) {
        try {
          await html5QrCodeRef.current.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => handleQrCodeScan(decodedText),
            () => {}
          );
          cameraStarted = true;
          cameraType = 'Rear Camera';
        } catch (err) {
          // Rear camera not available, continue to next option
        }
      }

      // Try front camera (user-facing) - works for laptops and mobile front cameras
      if (!cameraStarted) {
        try {
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            config,
            (decodedText) => handleQrCodeScan(decodedText),
            () => {}
          );
          cameraStarted = true;
          cameraType = videoDevices.length === 1 ? 'Webcam' : 'Front Camera';
        } catch (err) {
          // Front camera not available, continue to next option
        }
      }

      // Final fallback: Use first available camera by device ID
      if (!cameraStarted && videoDevices.length > 0) {
        await html5QrCodeRef.current.start(
          videoDevices[0].deviceId,
          config,
          (decodedText) => handleQrCodeScan(decodedText),
          () => {}
        );
        cameraStarted = true;
        cameraType = videoDevices[0].label || 'Camera';
        setSelectedCameraId(videoDevices[0].deviceId);
      }

      if (!cameraStarted) {
        throw new Error('Could not start any available camera');
      }

      setIsCameraActive(true);
      toast.success(`${cameraType} activated! Point at QR code or DataMatrix to scan`);
    } catch (error: any) {
      console.error('Camera start error:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'Failed to access camera';
      let errorDetails = '';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = '📷 Camera permission denied';
        errorDetails = 'Please click "Allow" when your browser asks for camera access.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = '📹 No camera found';
        errorDetails = 'Please connect a camera or use a device with a built-in camera. You can also use manual entry.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = '⚠️ Camera is busy';
        errorDetails = 'Camera is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '⚙️ Camera settings issue';
        errorDetails = 'Your camera doesn\'t support the required settings. Try a different camera.';
      } else if (error.message) {
        errorMessage = error.message;
        errorDetails = 'Check browser console for more details.';
      }
      
      // Show both messages
      setCameraError(`${errorMessage}. ${errorDetails}`);
      toast.error(`${errorMessage}. ${errorDetails}`, { duration: 6000 });
    }
  };

  const stopCamera = async () => {
    if (!html5QrCodeRef.current) {
      setIsCameraActive(false);
      return;
    }

    // Stop scanner if running
    try {
      const scannerState = html5QrCodeRef.current.getState();
      if (scannerState === 2) {
        await html5QrCodeRef.current.stop();
        console.log('Camera stopped successfully');
      }
    } catch (stopError) {
      console.log('Stop error (continuing cleanup):', stopError);
    }
    
    // Clear DOM references
    try {
      await html5QrCodeRef.current.clear();
      console.log('Scanner cleared successfully');
    } catch (clearError) {
      console.log('Clear error (non-critical):', clearError);
    }
    
    // Always null the reference and update state
    html5QrCodeRef.current = null;
    setIsCameraActive(false);
  };

  // Load available cameras when switching to camera mode
  useEffect(() => {
    if (scanMode === 'camera' && selectedEventId) {
      loadAvailableCameras();
    }
  }, [scanMode, selectedEventId]);

  // Stop camera when switching to manual mode
  useEffect(() => {
    if (scanMode === 'manual' && isCameraActive) {
      stopCamera();
    }
  }, [scanMode]);

  const switchCamera = async (cameraId: string) => {
    if (isCameraActive) {
      await stopCamera();
    }
    await startCamera(cameraId);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        const cleanup = async () => {
          try {
            const scannerState = html5QrCodeRef.current?.getState();
            if (scannerState === 2) {
              await html5QrCodeRef.current?.stop();
            }
            // Always clear to prevent DOM reference leaks
            await html5QrCodeRef.current?.clear();
            html5QrCodeRef.current = null;
          } catch (err) {
            console.log('Unmount cleanup (non-critical):', err);
            html5QrCodeRef.current = null;
          }
        };
        cleanup();
      }
    };
  }, []);

  const getScanResultIcon = () => {
    if (!scanResult) return null;
    
    if (scanResult.success) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else {
      return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getScanResultColor = () => {
    if (!scanResult) return '';
    
    if (scanResult.success) {
      return 'border-green-200 bg-green-50';
    } else {
      return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/staff')}
                className="shadow-sm hover:shadow active:scale-95 transition-all"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">Ticket Scanning</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {staffProfile?.name} • {staffProfile?.position || 'Staff'}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate max-w-[200px]">
                {staffProfile?.vendor?.companyName || staffProfile?.vendor?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          
          {/* Event Selection */}
          <Card className="border-0 shadow-md lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] flex flex-col relative">
            <CardHeader className="p-4 sm:p-6 border-b bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Select Event</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Choose event to scan tickets</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No events available</h3>
                  <p className="text-gray-600 text-sm">Contact your manager for event access</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.length > 1 && (
                    <p className="text-xs text-gray-500 mb-2">
                      {events.length} events available • Scroll to see all
                    </p>
                  )}
                  {events.map((event) => (
                    <Card 
                      key={event.id} 
                      className={`cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                        selectedEventId === event.id 
                          ? 'border-2 border-blue-500 bg-blue-50 shadow-md' 
                          : 'border border-gray-200 hover:border-blue-300 hover:bg-gray-50 shadow-sm'
                      }`}
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-2 truncate">{event.title}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span>{event.startTime || 'TBA'}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`shrink-0 ${
                            event.status === 'ACTIVE' || event.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}>
                            {event.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            
            {/* Scroll Indicator - Shows when there are multiple events */}
            {events.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none rounded-b-lg"></div>
            )}
          </Card>

          {/* Ticket Scanning */}
          <Card className="border-0 shadow-md">
            <CardHeader className="p-4 sm:p-6 border-b bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  actionMode === 'scan' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {actionMode === 'scan' ? (
                    <Scan className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 shrink-0" />
                  ) : (
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    {actionMode === 'scan' ? 'Scan Ticket' : 'Activate Hard Ticket'}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {actionMode === 'scan' ? 'Choose scanning method' : 'Activate physical tickets'}
                  </p>
                </div>
              </div>
              
              {/* Action Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => {
                    setActionMode('scan');
                    setScanResult(null);
                  }}
                  className={`flex-1 h-12 text-sm font-bold transition-all ${
                    actionMode === 'scan'
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  <Scan className="h-5 w-5 mr-2 shrink-0" />
                  Scan Ticket
                </Button>
                <Button
                  onClick={() => {
                    setActionMode('activate');
                    setScanResult(null);
                  }}
                  className={`flex-1 h-12 text-sm font-bold transition-all ${
                    actionMode === 'activate'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  <Activity className="h-5 w-5 mr-2 shrink-0" />
                  Activate
                </Button>
                <Button
                  onClick={() => setShowStatusModal(true)}
                  variant="outline"
                  className="h-12 px-4 text-sm font-bold border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  title="Check Ticket Status"
                >
                  <Info className="h-5 w-5 shrink-0" />
                  <span className="hidden sm:inline ml-2">Status</span>
                </Button>
              </div>

              {/* Mode Toggle Tabs (only for scan mode) */}
              {actionMode === 'scan' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setScanMode('camera')}
                    className={`flex-1 h-12 text-sm font-bold transition-all ${
                      scanMode === 'camera'
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
                    }`}
                  >
                    <Camera className="h-5 w-5 mr-2 shrink-0" />
                    <span className="hidden sm:inline">Scan QR/DataMatrix</span>
                    <span className="sm:hidden">Camera</span>
                  </Button>
                  <Button
                    onClick={() => setScanMode('manual')}
                    className={`flex-1 h-12 text-sm font-bold transition-all ${
                      scanMode === 'manual'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300'
                    }`}
                  >
                    <Keyboard className="h-5 w-5 mr-2 shrink-0" />
                    <span className="hidden sm:inline">Quick Entry</span>
                    <span className="sm:hidden">Manual</span>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {!selectedEventId ? (
                <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
                  <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-yellow-900 mb-1">Select an Event</h3>
                  <p className="text-yellow-700 text-sm">
                    Please select an event from the left to start scanning tickets.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Event Info */}
                  {selectedEvent && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                      <h3 className="font-bold text-blue-900 mb-2 relative">{selectedEvent.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-blue-700 relative">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{selectedEvent.venue || 'Venue TBA'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scan Location (Common for both modes) */}
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-2 block">
                      Scan Location (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-green-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-600 shrink-0" />
                      </div>
                      <Input
                        value={scanLocation}
                        onChange={(e) => setScanLocation(e.target.value)}
                        placeholder="e.g., Main Entrance, Gate A"
                        className="pl-16 h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
                        disabled={scanTicketMutation.isPending}
                      />
                    </div>
                  </div>

                  {/* Camera Mode */}
                  {scanMode === 'camera' && (
                    <div className="space-y-4">
                      {/* Permission Notice */}
                      {!isCameraActive && !cameraError && (
                        <>
                          <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                <Camera className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-blue-900 mb-1">Camera Access</h4>
                                <p className="text-sm text-blue-700 mb-3">
                                  We need access to your camera to scan QR codes. Works with phone cameras, tablet cameras, laptop webcams, and phone-as-webcam apps.
                                </p>
                                
                                {/* Camera Selector - Always Show */}
                                <div className="mb-3">
                                  <label className="text-xs font-bold text-blue-900 mb-1.5 block">
                                    Select Camera to Use:
                                  </label>
                                  {availableCameras.length === 0 ? (
                                    <div className="p-3 bg-blue-100 border-2 border-blue-200 rounded-lg flex items-start gap-2">
                                      <Camera className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                      <p className="text-sm text-blue-700">
                                        Detecting cameras... Click "Detect Cameras" button below to scan for devices.
                                      </p>
                                    </div>
                                  ) : (
                                    <select
                                      value={selectedCameraId}
                                      onChange={(e) => setSelectedCameraId(e.target.value)}
                                      className="w-full px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                    >
                                      <option value="">Auto-select Best Camera (Recommended)</option>
                                      {availableCameras.map((camera, index) => (
                                        <option key={camera.deviceId} value={camera.deviceId}>
                                          {camera.label || `Camera ${index + 1}`}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  {availableCameras.length > 1 && (
                                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      <span>{availableCameras.length} cameras detected - Choose your preferred camera</span>
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button 
                                    onClick={() => startCamera()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all flex-1"
                                  >
                                    <Camera className="h-4 w-4 mr-2" />
                                    {selectedCameraId ? 'Start Selected Camera' : 'Start Camera'}
                                  </Button>
                                  {availableCameras.length === 0 && (
                                    <Button 
                                      onClick={loadAvailableCameras}
                                      variant="outline"
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                    >
                                      <Camera className="h-4 w-4 mr-2" />
                                      Detect Cameras
                                    </Button>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-blue-600">
                                  <div className="flex items-center gap-1">
                                    <Smartphone className="h-3.5 w-3.5" />
                                    <span>Mobile</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Laptop className="h-3.5 w-3.5" />
                                    <span>Laptop Webcam</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Monitor className="h-3.5 w-3.5" />
                                    <span>Phone-as-Webcam</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Phone-as-Webcam Instructions */}
                          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                                <Monitor className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-purple-900 mb-1 text-sm flex items-center gap-2">
                                  <span>Multiple Camera Options</span>
                                </h4>
                                <p className="text-xs text-purple-700 mb-2">
                                  You can use your phone's camera even on a laptop/desktop! Connect via:
                                </p>
                                <ul className="text-xs text-purple-700 space-y-1">
                                  <li>• <strong>DroidCam/iVCam/Iriun:</strong> Install app on phone & computer</li>
                                  <li>• <strong>Windows Phone Link:</strong> Connect via Microsoft Phone Link app</li>
                                  <li>• <strong>USB Connection:</strong> Connect phone in webcam mode</li>
                                  <li>• <strong>Built-in Cameras:</strong> Laptop webcam, phone/tablet cameras</li>
                                </ul>
                                <div className="mt-2 p-2 bg-purple-100 rounded-lg border border-purple-200">
                                  <p className="text-xs text-purple-700 font-medium flex items-start gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span><strong>Tip:</strong> Phone cameras often have better quality for QR scanning!</span>
                                  </p>
                                </div>
                                {availableCameras.length > 1 && (
                                  <p className="text-xs text-green-700 mt-2 font-bold bg-green-100 p-2 rounded-lg flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>Multiple cameras detected! Select your preferred camera from the dropdown above.</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Camera View - Keep scanner div separate from React content */}
                      <div className="relative">
                        {/* Html5Qrcode container - NEVER render React children inside this div */}
                        <div 
                          id={qrCodeRegionId} 
                          className={`w-full rounded-xl overflow-hidden border-4 bg-gray-900 min-h-[300px] sm:min-h-[400px] ${
                            isCameraActive ? 'border-green-500' : 'border-gray-700'
                          }`}
                        />
                        
                        {/* Overlay messages OVER the scanner div (not inside it) */}
                        {cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 rounded-xl">
                            <div className="text-center p-8 max-w-md">
                              <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                              </div>
                              <h3 className="text-white font-bold mb-2 text-lg">Camera Error</h3>
                              <p className="text-gray-300 text-sm mb-4 leading-relaxed">{cameraError}</p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button 
                                  onClick={() => startCamera()}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Camera className="h-4 w-4 mr-2" />
                                  Try Again
                                </Button>
                                <Button 
                                  onClick={() => setScanMode('manual')}
                                  variant="outline"
                                  className="bg-white hover:bg-gray-100"
                                >
                                  <Keyboard className="h-4 w-4 mr-2" />
                                  Use Manual Entry
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!isCameraActive && !cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center p-8">
                              <div className="p-4 bg-gray-800 rounded-full w-fit mx-auto mb-4">
                                <Camera className="h-12 w-12 text-gray-400" />
                              </div>
                              <p className="text-gray-400 text-sm">Camera will appear here</p>
                            </div>
                          </div>
                        )}
                          
                          {isCameraActive && (
                            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                              <Badge className="bg-green-600 text-white border-0 px-3 py-1.5 shadow-lg">
                                <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-2"></div>
                                Scanning...
                              </Badge>
                              
                              {/* Camera Switcher */}
                              {showCameraSelector && availableCameras.length > 1 && (
                                <select
                                  value={selectedCameraId}
                                  onChange={(e) => switchCamera(e.target.value)}
                                  className="px-2 py-1 text-xs border-2 border-white bg-black/70 text-white rounded-lg shadow-lg backdrop-blur-sm"
                                  title="Switch Camera"
                                >
                                  {availableCameras.map((camera, index) => (
                                    <option key={camera.deviceId} value={camera.deviceId} className="bg-gray-900">
                                      {camera.label || `Camera ${index + 1}`}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Instructions */}
                      {isCameraActive && (
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg shrink-0">
                              <QrCode className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-green-900 mb-1">How to Scan</h4>
                              <ul className="text-sm text-green-700 space-y-1">
                                <li>• Point camera at QR code on ticket</li>
                                <li>• Hold steady until automatic scan</li>
                                <li>• Wait for confirmation before next scan</li>
                                <li>• Green border = scanning active</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* No Camera Alternative */}
                      {!isCameraActive && !cameraError && (
                        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                              <Keyboard className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-1">No Camera?</h4>
                              <p className="text-sm text-gray-700 mb-2">
                                If you don't have a camera or prefer manual entry, click the <strong>Quick Entry</strong> tab above to type ticket codes directly.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Camera Controls */}
                      {isCameraActive && (
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          className="w-full h-12 border-2 border-red-500 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-5 w-5 mr-2" />
                          Stop Camera
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Manual Entry Mode */}
                  {scanMode === 'manual' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-gray-900 mb-2 block">
                          Ticket Code *
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-purple-100 rounded-lg">
                            <Ticket className="h-4 w-4 text-purple-600 shrink-0" />
                          </div>
                          <Input
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && ticketCode.trim() && !scanTicketMutation.isPending) {
                                handleManualScan();
                              }
                            }}
                            placeholder="Enter ticket code"
                            className="pl-16 h-14 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
                            disabled={scanTicketMutation.isPending}
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Press Enter to scan quickly</p>
                      </div>

                      <Button
                        onClick={handleManualScan}
                        disabled={!ticketCode.trim() || scanTicketMutation.isPending}
                        className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
                      >
                        {scanTicketMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Scanning Ticket...
                          </>
                        ) : (
                          <>
                            <Scan className="h-5 w-5 mr-2" />
                            Scan Ticket Now
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Hard Ticket Activation Mode */}
                  {actionMode === 'activate' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                            <Activity className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-orange-900 mb-1">Activate Hard Ticket</h4>
                            <p className="text-sm text-orange-700">
                              Scan or enter a hard ticket code to activate it. This creates a booking and marks the ticket as SOLD.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-900 mb-2 block">
                          Hard Ticket Code *
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-orange-100 rounded-lg">
                            <Ticket className="h-4 w-4 text-orange-600 shrink-0" />
                          </div>
                          <Input
                            value={activateTicketCode}
                            onChange={(e) => setActivateTicketCode(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && activateTicketCode.trim() && !activateTicketMutation.isPending) {
                                setShowActivateModal(true);
                              }
                            }}
                            placeholder="HTKT_..."
                            className="pl-16 h-14 text-base border-2 focus:border-orange-500 focus:ring-orange-500"
                            disabled={activateTicketMutation.isPending}
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Press Enter to continue</p>
                      </div>

                      <Button
                        onClick={() => {
                          if (activateTicketCode.trim()) {
                            setShowActivateModal(true);
                          } else {
                            toast.error('Please enter a ticket code');
                          }
                        }}
                        disabled={!activateTicketCode.trim() || activateTicketMutation.isPending}
                        className="w-full h-14 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        Activate Ticket
                      </Button>
                    </div>
                  )}

                  {/* Scan Result */}
                  {scanResult && actionMode === 'scan' && (
                    <div className={`p-5 rounded-xl border-2 ${getScanResultColor()}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-full ${
                          scanResult.success ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {getScanResultIcon()}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold mb-2 ${
                            scanResult.success ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {scanResult.message}
                          </h4>
                          {scanResult.code && !scanResult.success && (
                            <Badge className={`mb-2 ${
                              scanResult.code === 'TICKET_NOT_ACTIVATED' 
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : scanResult.code === 'ALREADY_SCANNED'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              {scanResult.code}
                            </Badge>
                          )}
                          {scanResult.ticket && (
                            <div className="space-y-1.5 text-sm mt-3">
                              {scanResult.ticket.event?.title && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Event:</strong> {scanResult.ticket.event.title}
                                </p>
                              )}
                              {scanResult.ticket.booking?.customerName && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Customer:</strong> {scanResult.ticket.booking.customerName}
                                </p>
                              )}
                              {scanResult.ticket.ticketCategory?.categoryName && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Category:</strong> {scanResult.ticket.ticketCategory.categoryName}
                                </p>
                              )}
                              {scanResult.ticket.status && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Status:</strong> {scanResult.ticket.status}
                                </p>
                              )}
                            </div>
                          )}
                          {scanResult.data && (
                            <div className="space-y-1.5 text-sm">
                              {scanResult.data.event?.title && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Event:</strong> {scanResult.data.event.title}
                                </p>
                              )}
                              {scanResult.data.booking?.customerName && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Customer:</strong> {scanResult.data.booking.customerName}
                                </p>
                              )}
                              {scanResult.data.ticketCategory?.categoryName && (
                                <p className={scanResult.success ? 'text-green-700' : 'text-red-700'}>
                                  <strong>Category:</strong> {scanResult.data.ticketCategory.categoryName}
                                </p>
                              )}
                            </div>
                          )}
                          {scanResult.code === 'TICKET_NOT_ACTIVATED' && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> This hard ticket needs to be activated first. Switch to "Activate" mode to activate it.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hard Ticket Activation Modal */}
        <Dialog open={showActivateModal} onOpenChange={setShowActivateModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                Activate Hard Ticket
              </DialogTitle>
              <DialogDescription>
                Enter customer information and payment method to activate this hard ticket.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Ticket Code *
                </label>
                <Input
                  value={activateTicketCode}
                  onChange={(e) => setActivateTicketCode(e.target.value)}
                  placeholder="HTKT_..."
                  className="h-12"
                  disabled
                />
              </div>
              
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Customer Name (Optional)
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12"
                  disabled={activateTicketMutation.isPending}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Customer Email (Optional)
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="h-12"
                  disabled={activateTicketMutation.isPending}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Customer Phone (Optional)
                </label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+256700000000"
                  className="h-12"
                  disabled={activateTicketMutation.isPending}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'MOBILE_MONEY')}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:border-orange-500 focus:ring-orange-500"
                  disabled={activateTicketMutation.isPending}
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>

              <Button
                onClick={handleActivateHardTicket}
                disabled={!activateTicketCode.trim() || activateTicketMutation.isPending}
                className="w-full h-14 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white"
              >
                {activateTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Activity className="h-5 w-5 mr-2" />
                    Activate Ticket
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ticket Status Modal */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-600" />
                Check Ticket Status
              </DialogTitle>
              <DialogDescription>
                Enter a ticket code to view its current status and history.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Ticket Code *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={checkTicketCode}
                    onChange={(e) => setCheckTicketCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && checkTicketCode.trim()) {
                        handleCheckTicketStatus();
                      }
                    }}
                    placeholder="Enter ticket code"
                    className="h-12 flex-1"
                    disabled={statusLoading}
                  />
                  <Button
                    onClick={handleCheckTicketStatus}
                    disabled={!checkTicketCode.trim() || statusLoading}
                    className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {statusLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Info className="h-5 w-5 mr-2" />
                        Check
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {statusLoading && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading ticket status...</p>
                </div>
              )}

              {ticketStatus && !statusLoading && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-purple-900">{ticketStatus.ticketCode}</h3>
                      <Badge className={`${
                        ticketStatus.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border-green-300' :
                        ticketStatus.status === 'SOLD' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        ticketStatus.status === 'SCANNED' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                        ticketStatus.status === 'EXPIRED' || ticketStatus.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}>
                        {ticketStatus.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{ticketStatus.type}</span>
                      </div>
                      {ticketStatus.event && (
                        <>
                          <div className="col-span-2">
                            <span className="text-gray-600">Event:</span>
                            <span className="ml-2 font-medium">{ticketStatus.event.title}</span>
                          </div>
                          {ticketStatus.event.venue && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Venue:</span>
                              <span className="ml-2 font-medium">{ticketStatus.event.venue}</span>
                            </div>
                          )}
                        </>
                      )}
                      {ticketStatus.booking && (
                        <>
                          <div>
                            <span className="text-gray-600">Booking Ref:</span>
                            <span className="ml-2 font-medium">{ticketStatus.booking.bookingReference}</span>
                          </div>
                          {ticketStatus.booking.customerName && (
                            <div>
                              <span className="text-gray-600">Customer:</span>
                              <span className="ml-2 font-medium">{ticketStatus.booking.customerName}</span>
                            </div>
                          )}
                          <div className="col-span-2">
                            <span className="text-gray-600">Progress:</span>
                            <span className="ml-2 font-medium">
                              {ticketStatus.booking.scannedTickets} / {ticketStatus.booking.quantity} scanned
                            </span>
                          </div>
                        </>
                      )}
                      {ticketStatus.scannedAt && (
                        <div>
                          <span className="text-gray-600">Scanned:</span>
                          <span className="ml-2 font-medium">
                            {new Date(ticketStatus.scannedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {ticketStatus.scannedBy && (
                        <div>
                          <span className="text-gray-600">By:</span>
                          <span className="ml-2 font-medium">{ticketStatus.scannedBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {ticketStatus.scanHistory && ticketStatus.scanHistory.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Scan History</h4>
                      <div className="space-y-2">
                        {ticketStatus.scanHistory.map((scan) => (
                          <div key={scan.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{new Date(scan.scannedAt).toLocaleString()}</span>
                              <Badge className={scan.wasSuccessful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {scan.wasSuccessful ? 'Success' : 'Failed'}
                              </Badge>
                            </div>
                            {scan.scanLocation && (
                              <p className="text-gray-600 text-xs">Location: {scan.scanLocation}</p>
                            )}
                            {scan.failureReason && (
                              <p className="text-red-600 text-xs mt-1">Reason: {scan.failureReason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Scan History */}
        {selectedEventId && (
          <Card className="mt-6 lg:mt-8 border-0 shadow-md">
            <CardHeader className="p-4 sm:p-6 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 shrink-0" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Scans</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                    {selectedEvent?.title}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {scanHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">No scans yet</h3>
                  <p className="text-gray-600 text-sm">Start scanning tickets to see the history here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.slice(0, 10).map((scan) => (
                    <div key={scan.id} className="flex items-start sm:items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-colors">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-green-100 rounded-lg shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 mb-1 truncate">{scan.ticketCode}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {scan.booking.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {scan.ticketCategory.categoryName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(scan.scannedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {scan.scanLocation && (
                          <p className="text-xs text-gray-500 mt-1">{scan.scanLocation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function StaffScanTicketsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <StaffScanTicketsContent />
    </Suspense>
  );
}
