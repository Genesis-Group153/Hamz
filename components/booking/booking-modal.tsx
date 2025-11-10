'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateBooking, useCreateBookingWithPayment, useSubmitPaymentOrder } from '@/lib/hooks/useBookings';
import { Loader2, Ticket, User, Mail, Phone, MessageSquare, CreditCard, X, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentGatewaySelector } from './payment-gateway-selector';

interface TicketCategory {
  id: string;
  categoryName: string;
  price: number;
  quantity: number;
  status: string;
  description?: string;
  availableQuantity: number;
  soldQuantity: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue?: string;
  address?: string;
  maxTicketsPerEmail?: number; // Maximum tickets allowed per email address
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  tickets: TicketCategory[];
  selectedTicketId?: string;
  usePaymentIntegration?: boolean; // New prop to enable payment integration
  isLoadingTickets?: boolean; // Loading state for tickets
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  event, 
  tickets, 
  selectedTicketId,
  usePaymentIntegration = false,
  isLoadingTickets = false
}) => {
  const [selectedTicketIdState, setSelectedTicketIdState] = useState<string | null>(selectedTicketId || null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'EMAIL' | 'SMS' | 'BOTH'>('EMAIL');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'tickets' | 'details' | 'payment' | 'confirmation'>('tickets');
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string | null>(null);
  const [gatewayType, setGatewayType] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);

  const createBooking = useCreateBooking();
  const createBookingWithPayment = useCreateBookingWithPayment();
  const submitPaymentOrder = useSubmitPaymentOrder();

  const selectedTicket = tickets.find(t => t.id === selectedTicketIdState);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;
  const maxQuantity = selectedTicket ? selectedTicket.availableQuantity : 0;
  
  // Get the event's maxTicketsPerEmail limit if set
  const maxTicketsPerEmail = event.maxTicketsPerEmail || null;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTicketIdState(selectedTicketId || null);
      setQuantity(1);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setDeliveryMethod('EMAIL');
      setNotes('');
      setErrors({});
      setStep('tickets');
      setPaymentUrl(null);
      setShowPaymentIframe(false);
    }
  }, [isOpen, selectedTicketId]);

  // Listen for payment completion messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from our own domain (success page) or Pesapal domain
      const isFromOurDomain = event.origin === window.location.origin;
      const isFromPesapal = event.origin.includes('pesapal.com') || event.origin.includes('pay.pesapal.com');
      
      if (isFromOurDomain || isFromPesapal) {
        if (event.data === 'payment_complete' || event.data?.type === 'payment_complete') {
          // Payment completed, redirect to success page
          const bookingRef = event.data?.bookingReference || bookingData?.bookingReference;
          const callbackUrl = `${window.location.origin}/payment/success?booking=${bookingRef}`;
          window.location.href = callbackUrl;
        }
      }
    };

    if (showPaymentIframe) {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [showPaymentIframe, paymentData, bookingData]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedTicketIdState) {
      newErrors.ticket = 'Please select a ticket category';
    }

    // Check available quantity
    if (quantity < 1 || quantity > maxQuantity) {
      newErrors.quantity = `Quantity must be between 1 and ${maxQuantity}`;
    }

    // Check maxTicketsPerEmail limit if set
    if (maxTicketsPerEmail && quantity > maxTicketsPerEmail) {
      newErrors.quantity = `Maximum ${maxTicketsPerEmail} ticket${maxTicketsPerEmail > 1 ? 's' : ''} per email allowed for this event`;
    }

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!customerEmail.trim() && !customerPhone.trim()) {
      newErrors.contact = 'Either email or phone number is required';
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (customerPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Proceed to payment gateway selection (for payment integration)
  const handleProceedToPayment = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    if (!selectedTicket) {
      toast.error('Please select a ticket category');
      return;
    }

    if (usePaymentIntegration) {
      // Require email for ticket delivery
      if (!customerEmail) {
        setErrors({ ...errors, customerEmail: 'Email is required for ticket delivery' });
        return;
      }
      
      // Move to payment gateway selection
      setStep('payment');
    } else {
      // Direct booking without payment
      handleDirectBooking();
    }
  };

  // Handle direct booking (without payment integration)
  const handleDirectBooking = async () => {
    if (!selectedTicket) return;

    try {
      const bookingData = {
        eventId: event.id,
        ticketCategoryId: selectedTicket.id,
        quantity,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        deliveryMethod,
        notes: notes.trim() || undefined,
      };

      const result = await createBooking.mutateAsync(bookingData);
      setStep('confirmation');
      toast.success('Booking confirmed! Check your email/SMS for ticket details.');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  // Create booking with selected payment gateway
  const handleBookingWithPayment = async () => {
    if (!selectedPaymentGateway) {
      toast.error('Please select a payment method');
      return;
    }

    if (!selectedTicket) return;

    try {
      const bookingData = {
        ticketCategoryId: selectedTicket.id,
        quantity,
        customerEmail,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        gateway: selectedPaymentGateway, // Pass gateway during booking creation
      };

      const result = await createBookingWithPayment.mutateAsync(bookingData);
      
      setBookingData(result.booking);
      setPaymentData(result.payment);
      setGatewayType(result.gateway);
      setStep('confirmation');
      
      toast.success('Booking reserved! Please proceed to payment to confirm.');
    } catch (error: any) {
      console.error('Booking with payment failed:', error);
      // Error is already handled by the mutation hook
      // Check if it's a maintenance error
      if (error.response?.status === 503) {
        toast.error('Payment gateway is currently unavailable. Please try another payment method.');
        // Stay on payment step to allow selecting another gateway
      }
    }
  };

  const handleClose = () => {
    setStep('tickets');
    setBookingData(null);
    setPaymentData(null);
    setPaymentUrl(null);
    setShowPaymentIframe(false);
    onClose();
  };

  // Handle payment based on gateway type
  const handlePaymentSubmit = async () => {
    if (!paymentData || !bookingData) {
      toast.error('Payment data not available');
      return;
    }

    if (!gatewayType) {
      toast.error('Payment gateway not selected');
      return;
    }

    try {
      // Handle different gateway types according to the guide
      if (gatewayType === 'PESPAL') {
        // For PesaPal: Call submit order API and redirect
        const paymentRequest = {
          id: `ORDER-${Date.now()}`,
          currency: paymentData.currency,
          amount: paymentData.amount,
          description: paymentData.description,
          callback_url: `${window.location.origin}/payment/success?booking=${bookingData.bookingReference}`,
          notification_id: paymentData.ipnId,
          // Note: gateway field is removed (causes validation error)
          billing_address: {
            email_address: paymentData.customerEmail,
            phone_number: paymentData.customerPhone,
            country_code: "KE",
            first_name: paymentData.customerName.split(' ')[0] || "Customer",
            middle_name: "",
            last_name: paymentData.customerName.split(' ').slice(1).join(' ') || "Name",
            line_1: "Event Booking",
            line_2: "",
            city: "Nairobi",
            state: "",
            postal_code: "",
            zip_code: ""
          }
        };

        const result = await submitPaymentOrder.mutateAsync(paymentRequest);
        // Show payment in iframe instead of redirecting
        if (result?.redirect_url) {
          setPaymentUrl(result.redirect_url);
          setShowPaymentIframe(true);
          setStep('payment');
        }
        
      } else if (gatewayType === 'MTN' || gatewayType === 'AIRTEL') {
        // For MTN/Airtel: Show phone prompt message
        const gatewayName = gatewayType === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money';
        toast.success(
          `📱 Please check your phone! You will receive a ${gatewayName} payment prompt to complete the transaction.`,
          { duration: 8000 }
        );
        
        // Show instructions in the UI
        toast.info(
          `Booking Reference: ${bookingData.bookingReference}. Check your ${gatewayName} app or USSD prompt.`,
          { duration: 10000 }
        );
        
        // Optionally close modal or show success state
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        toast.error(`Unknown payment gateway: ${gatewayType}`);
      }
    } catch (error) {
      console.error('Payment submission failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {step === 'tickets' && 'Select Tickets'}
            {step === 'details' && 'Your Information'}
            {step === 'payment' && 'Select Payment Method'}
            {step === 'confirmation' && 'Booking Confirmed'}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {step === 'tickets' && (
          <div className="space-y-6">
            {/* Event Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDate(event.date)}</span>
                <span>{event.venue || event.address}</span>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Available Tickets</h4>
              {isLoadingTickets ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tickets available for this event.</p>
                </div>
              ) : (
              <div className="grid gap-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTicketIdState === ticket.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${ticket.status !== 'AVAILABLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (ticket.status === 'AVAILABLE') {
                        setSelectedTicketIdState(ticket.id);
                        setQuantity(1);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium">{ticket.categoryName}</h5>
                        {ticket.description && (
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          UGX {ticket.price.toFixed(2)}
                        </p>
                        <Badge 
                          className={
                            ticket.status === 'AVAILABLE' 
                              ? 'bg-green-100 text-green-800'
                              : ticket.status === 'SOLD_OUT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    {ticket.status === 'AVAILABLE' && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{ticket.availableQuantity} available</span>
                        <span>{ticket.soldQuantity} sold</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
              
              {errors.ticket && (
                <p className="text-sm text-destructive">{errors.ticket}</p>
              )}

              {/* Quantity Selection */}
              {selectedTicket && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Tickets</label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={maxTicketsPerEmail ? Math.min(maxQuantity, maxTicketsPerEmail) : maxQuantity}
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const limit = maxTicketsPerEmail ? Math.min(maxQuantity, maxTicketsPerEmail) : maxQuantity;
                        setQuantity(Math.max(1, Math.min(limit, value)));
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newQuantity = quantity + 1;
                        const limit = maxTicketsPerEmail ? Math.min(maxQuantity, maxTicketsPerEmail) : maxQuantity;
                        setQuantity(Math.min(limit, newQuantity));
                      }}
                      disabled={quantity >= maxQuantity || (maxTicketsPerEmail ? quantity >= maxTicketsPerEmail : false)}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Max: {maxTicketsPerEmail ? `${maxTicketsPerEmail} per email` : maxQuantity} tickets
                    </span>
                  </div>
                  {errors.quantity && (
                    <p className="text-sm text-destructive">{errors.quantity}</p>
                  )}
                </div>
              )}

              {/* Order Summary */}
              {selectedTicket && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total ({quantity} ticket{quantity > 1 ? 's' : ''})</span>
                    <span className="text-xl font-bold text-primary">UGX {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={() => setStep('details')}
                disabled={!selectedTicket}
              >
                Continue to Details
              </Button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            {/* Order Summary */}
            {selectedTicket && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="flex justify-between items-center">
                  <span>{selectedTicket.categoryName} × {quantity}</span>
                  <span className="font-bold text-primary">UGX {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Customer Information Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                />
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive">{errors.customerEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-destructive">{errors.customerPhone}</p>
                  )}
                </div>
              </div>

              {errors.contact && (
                <p className="text-sm text-destructive">{errors.contact}</p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Method *</label>
                <Select value={deliveryMethod} onValueChange={(value: 'EMAIL' | 'SMS' | 'BOTH') => setDeliveryMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email Only</SelectItem>
                    <SelectItem value="SMS">SMS Only</SelectItem>
                    <SelectItem value="BOTH">Both Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Special Notes (Optional)</label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('tickets')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleProceedToPayment} 
                className="flex-1" 
                disabled={usePaymentIntegration ? createBookingWithPayment.isPending : createBooking.isPending}
              >
                {usePaymentIntegration ? (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue to Payment
                  </>
                ) : (
                  createBooking.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {usePaymentIntegration && paymentData ? 'Booking Successful!' : 'Booking Confirmed!'}
              </h3>
              <p className="text-muted-foreground">
                {usePaymentIntegration && paymentData 
                  ? 'Your booking has been created successfully. Please proceed to payment to complete your order.'
                  : 'Your tickets have been successfully booked. You\'ll receive them via your chosen delivery method.'
                }
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <h4 className="font-medium mb-2">Booking Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tickets:</span>
                  <span className="font-medium">{selectedTicket?.categoryName} × {quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-primary">UGX {totalPrice.toFixed(2)}</span>
                </div>
                {usePaymentIntegration && bookingData && (
                  <>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-medium font-mono text-sm">{bookingData.bookingReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="secondary" className="text-xs">
                        {bookingData.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            {usePaymentIntegration && paymentData ? (
              <div className="space-y-3">
                {gatewayType === 'PESPAL' ? (
                  <Button 
                    onClick={handlePaymentSubmit}
                    disabled={submitPaymentOrder.isPending}
                    className="w-full"
                  >
                    {submitPaymentOrder.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting to PesaPal...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Continue to PesaPal Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : gatewayType === 'MTN' || gatewayType === 'AIRTEL' ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            {gatewayType === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'} Payment
                          </h4>
                          <p className="text-sm text-blue-700 mb-2">
                            Please check your phone for a payment prompt to complete the transaction.
                          </p>
                          <p className="text-xs text-blue-600">
                            If you don't receive a prompt within 2 minutes, please contact support with your booking reference.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handlePaymentSubmit}
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      I've Completed the Payment
                    </Button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {step === 'payment' && selectedTicket && (
          <div className="space-y-6">
            {showPaymentIframe && paymentUrl ? (
              // Show payment iframe
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Complete Your Payment</h4>
                  <p className="text-sm text-blue-700">
                    Please complete your payment below. Once payment is successful, you'll be redirected back.
                  </p>
                </div>
                <div className="border rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
                  <iframe
                    src={paymentUrl}
                    className="w-full h-full"
                    style={{ minHeight: '600px', border: 'none' }}
                    title="Payment Gateway"
                    allow="payment"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentIframe(false);
                    setPaymentUrl(null);
                    setStep('confirmation');
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Payment
                </Button>
              </div>
            ) : (
              <>
                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event:</span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket:</span>
                      <span className="font-medium">{selectedTicket.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{quantity} ticket(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{customerName}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-primary text-lg">
                        UGX {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Selector */}
                <PaymentGatewaySelector
                  amount={totalPrice}
                  currency="UGX"
                  selectedGateway={selectedPaymentGateway}
                  onSelectGateway={setSelectedPaymentGateway}
                />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('details')}
                    className="flex-1"
                    disabled={createBookingWithPayment.isPending}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleBookingWithPayment}
                    disabled={createBookingWithPayment.isPending || !selectedPaymentGateway}
                    className="flex-1"
                  >
                    {createBookingWithPayment.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : selectedPaymentGateway ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Create Booking & Pay with {selectedPaymentGateway}
                      </>
                    ) : (
                      <>
                        Select Payment Method to Continue
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
