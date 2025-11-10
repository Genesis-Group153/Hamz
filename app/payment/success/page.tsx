'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Mail, Download } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const bookingRef = searchParams.get('booking');
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');
  
  // Notify parent window if opened in iframe
  useEffect(() => {
    if (window.self !== window.top) {
      // We're in an iframe, notify parent when payment is verified
      if (paymentStatus === 'success') {
        window.parent.postMessage({ type: 'payment_complete', bookingReference: bookingRef }, '*');
      }
    }
  }, [paymentStatus, bookingRef]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      
      // Use the booking reference or order merchant reference
      const reference = bookingRef || orderMerchantReference;
      
      if (!reference) {
        throw new Error('No booking reference found');
      }

      // Call backend API to verify payment status and update booking
      const response = await apiClient.get(`/pespal/payment/verify-status`, {
        params: {
          bookingReference: reference,
          orderTrackingId: orderTrackingId
        }
      });

      if (response.data.success) {
        setPaymentStatus(response.data.paymentStatus === 'COMPLETED' ? 'success' : 'pending');
        setBookingData(response.data.booking);
        
        if (response.data.paymentStatus === 'COMPLETED') {
          toast.success('Payment successful! Your tickets have been sent to your email.');
        } else {
          toast.info('Payment is being processed. Please check your email shortly.');
        }
      } else {
        setPaymentStatus('failed');
        setError(response.data.message || 'Payment verification failed');
        toast.error('Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment status check failed:', err);
      setPaymentStatus('failed');
      setError(err.response?.data?.message || 'Failed to verify payment status');
      toast.error('Failed to verify payment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingRef || orderMerchantReference || orderTrackingId) {
      checkPaymentStatus();
    } else {
      setError('Missing booking reference or order tracking ID');
      setLoading(false);
      setPaymentStatus('failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingRef, orderMerchantReference, orderTrackingId]);

  const handleRetry = () => {
    checkPaymentStatus();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewBooking = () => {
    if (bookingData?.bookingReference) {
      router.push(`/ticket/${bookingData.bookingReference}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we verify your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center">
            {paymentStatus === 'success' ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            ) : paymentStatus === 'pending' ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
            
            <CardTitle className="text-center">
              {paymentStatus === 'success' ? 'Payment Successful!' :
               paymentStatus === 'pending' ? 'Payment Pending' :
               'Payment Failed'}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {paymentStatus === 'success' && bookingData && (
            <>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your payment has been confirmed and your tickets have been sent to your email.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Reference:</span>
                  <span className="font-mono font-semibold">{bookingData.bookingReference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {bookingData.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold">
                    {bookingData.currency || 'UGX'} {bookingData.totalPrice}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Check Your Email</p>
                  <p className="text-blue-700">
                    Your tickets with QR codes have been sent to your email address.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleViewBooking}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  View My Ticket
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'pending' && (
            <>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your payment is being processed. This may take a few minutes.
                </p>
              </div>

              {bookingData && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booking Reference:</span>
                    <span className="font-mono font-semibold">{bookingData.bookingReference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary">
                      {bookingData.status}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                >
                  Check Status Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}

          {paymentStatus === 'failed' && (
            <>
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  {error || 'We could not verify your payment. Please try again or contact support.'}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading</h2>
            <p className="text-muted-foreground text-center">
              Please wait...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

