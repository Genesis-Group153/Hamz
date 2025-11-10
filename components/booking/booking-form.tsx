"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useCreateBooking,
  useCreateBookingWithPayment,
  useSubmitPaymentOrder,
} from "@/lib/hooks/useBookings";
import { apiClient } from "@/lib/api/client";
import {
  Loader2,
  Ticket,
  User,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentGatewaySelector } from "./payment-gateway-selector";

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
  maxTicketsPerEmail?: number;
}

interface BookingFormProps {
  event: Event;
  tickets: TicketCategory[];
  onSuccess?: (bookingReference: string) => void;
  usePaymentIntegration?: boolean; // New prop to enable payment integration
}

export const BookingForm: React.FC<BookingFormProps> = ({
  event,
  tickets,
  onSuccess,
  usePaymentIntegration = false,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "EMAIL" | "SMS" | "BOTH"
  >("EMAIL");
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailTicketCount, setEmailTicketCount] = useState<number>(0);
  const [phoneTicketCount, setPhoneTicketCount] = useState<number>(0);
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPaymentButton, setShowPaymentButton] = useState<boolean>(false);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<
    string | null
  >(null);
  const [gatewayType, setGatewayType] = useState<string | null>(null);

  const createBooking = useCreateBooking();
  const createBookingWithPayment = useCreateBookingWithPayment();
  const submitPaymentOrder = useSubmitPaymentOrder();

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;
  const maxQuantity = selectedTicket ? selectedTicket.availableQuantity : 0;

  // Check existing ticket count for email and phone when they change
  useEffect(() => {
    const checkTicketCounts = async () => {
      if (event.maxTicketsPerEmail) {
        try {
          // This would need to be implemented as a new API endpoint
          // For now, we'll show the limit info without checking existing count
          setEmailTicketCount(0);
          setPhoneTicketCount(0);
        } catch (error) {
          console.error("Error checking ticket counts:", error);
        }
      } else {
        setEmailTicketCount(0);
        setPhoneTicketCount(0);
      }
    };

    checkTicketCounts();
  }, [customerEmail, customerPhone, event.id]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedTicketId) {
      newErrors.ticket = "Please select a ticket category";
    }

    if (quantity < 1 || quantity > maxQuantity) {
      newErrors.quantity = `Quantity must be between 1 and ${maxQuantity}`;
    }

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!customerEmail.trim() && !customerPhone.trim()) {
      newErrors.contact = "Either email or phone number is required";
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    if (
      customerPhone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(customerPhone.replace(/\s/g, ""))
    ) {
      newErrors.customerPhone = "Please enter a valid phone number";
    }

    if (!deliveryMethod) {
      newErrors.deliveryMethod = "Please select a delivery method";
    }

    // Check email and phone ticket limits if event has a limit
    if (event.maxTicketsPerEmail) {
      const limit = event.maxTicketsPerEmail;
      let emailViolation = false;
      let phoneViolation = false;
      let errorMessage = "";

      // Check email limit
      if (customerEmail) {
        const totalTicketsAfterBooking = emailTicketCount + quantity;
        if (totalTicketsAfterBooking > limit) {
          emailViolation = true;
          const remainingForEmail = limit - emailTicketCount;
          errorMessage += `Email limit exceeded. This email can only purchase ${limit} tickets for this event. Already purchased: ${emailTicketCount}, attempting to purchase: ${quantity}. Maximum additional tickets allowed: ${Math.max(
            0,
            remainingForEmail
          )}. `;
        }
      }

      // Check phone limit
      if (customerPhone) {
        const totalTicketsAfterBooking = phoneTicketCount + quantity;
        if (totalTicketsAfterBooking > limit) {
          phoneViolation = true;
          const remainingForPhone = limit - phoneTicketCount;
          errorMessage += `Phone limit exceeded. This phone number can only purchase ${limit} tickets for this event. Already purchased: ${phoneTicketCount}, attempting to purchase: ${quantity}. Maximum additional tickets allowed: ${Math.max(
            0,
            remainingForPhone
          )}. `;
        }
      }

      // Set error if either limit is exceeded
      if (emailViolation || phoneViolation) {
        newErrors.contactLimit = `Ticket limit exceeded for this event (maximum ${limit} tickets per contact). ${errorMessage}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    if (!selectedTicket) {
      toast.error("Please select a ticket category");
      return;
    }

    console.log(
      "Submitting booking with payment integration:",
      usePaymentIntegration
    );

    try {
      if (usePaymentIntegration) {
        // Check if gateway is selected
        if (!selectedPaymentGateway) {
          toast.error("Please select a payment gateway");
          return;
        }

        // Use payment integration with selected gateway
        const bookingData = {
          ticketCategoryId: selectedTicket.id,
          quantity,
          customerEmail: customerEmail.trim() || undefined,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          gateway: selectedPaymentGateway, // Pass gateway during booking creation
        };

        const result = await createBookingWithPayment.mutateAsync(bookingData);
        console.log("Booking with payment successful:", result);

        setBookingData(result.booking);
        setPaymentData(result.payment);
        setGatewayType(result.gateway);
        setShowPaymentButton(true);
        toast.success('Booking reserved! Please proceed to payment to confirm.');

        if (onSuccess) {
          onSuccess(result.booking.bookingReference);
        }
      } else {
        // Use regular booking for anonymous users
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
        console.log("Booking successful:", result);

        if (onSuccess) {
          onSuccess(result.bookingReference);
        }
      }
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  const resetForm = () => {
    setSelectedTicketId(null);
    setQuantity(1);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDeliveryMethod("EMAIL");
    setNotes("");
    setErrors({});
    setBookingData(null);
    setPaymentData(null);
    setShowPaymentButton(false);
    setSelectedPaymentGateway(null);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentData || !bookingData) {
      toast.error("Payment data not available");
      return;
    }

    if (!gatewayType) {
      toast.error("Payment gateway not selected");
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
            first_name: paymentData.customerName.split(" ")[0] || "Customer",
            middle_name: "",
            last_name:
              paymentData.customerName.split(" ").slice(1).join(" ") || "Name",
            line_1: "Event Booking",
            line_2: "",
            city: "Nairobi",
            state: "",
            postal_code: "",
            zip_code: "",
          },
        };

        await submitPaymentOrder.mutateAsync(paymentRequest);
        // Redirect happens automatically in the mutation's onSuccess handler
        
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
        
        // Reset form or close flow
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        toast.error(`Unknown payment gateway: ${gatewayType}`);
      }
    } catch (error) {
      console.error("Payment submission failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Summary */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
            <p className="text-gray-300">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-400 text-sm">
              {event.venue || event.address || "Location TBA"}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticket Selection */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Select Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTicketId === ticket.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-700 hover:border-gray-600"
                  } ${
                    ticket.status !== "AVAILABLE"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (ticket.status === "AVAILABLE") {
                      setSelectedTicketId(ticket.id);
                      setQuantity(1);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-medium">
                        {ticket.categoryName}
                      </h4>
                      {ticket.description && (
                        <p className="text-gray-400 text-sm">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-500">
                        UGX {ticket.price.toFixed(2)}
                      </p>
                      <Badge
                        className={
                          ticket.status === "AVAILABLE"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : ticket.status === "SOLD_OUT"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {ticket.status === "AVAILABLE" && (
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>{ticket.availableQuantity} available</span>
                      <span>{ticket.soldQuantity} sold</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.ticket && (
              <p className="text-red-400 text-sm">{errors.ticket}</p>
            )}

            {/* Quantity Selection */}
            {selectedTicket && (
              <div className="space-y-2">
                <label className="text-white font-medium">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    onFocus={(e) => e.target.select()}
                    className="w-20 text-center bg-gray-800 border-gray-600 text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity(Math.min(maxQuantity, quantity + 1))
                    }
                    disabled={quantity >= maxQuantity}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    +
                  </Button>
                  <span className="text-gray-400 text-sm">
                    Max: {maxQuantity} tickets
                  </span>
                </div>
                {errors.quantity && (
                  <p className="text-red-400 text-sm">{errors.quantity}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-white font-medium">Full Name *</label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.customerName && (
                <p className="text-red-400 text-sm">{errors.customerName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.customerEmail && (
                  <p className="text-red-400 text-sm">{errors.customerEmail}</p>
                )}
                {event.maxTicketsPerEmail && (
                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mt-2">
                    <p className="text-blue-300 text-sm">
                      <strong>Ticket Limit:</strong> Maximum{" "}
                      {event.maxTicketsPerEmail} tickets per contact (email OR
                      phone) for this event
                    </p>
                    {emailTicketCount > 0 && (
                      <p className="text-blue-200 text-xs mt-1">
                        Email already purchased: {emailTicketCount} tickets
                      </p>
                    )}
                    {phoneTicketCount > 0 && (
                      <p className="text-blue-200 text-xs mt-1">
                        Phone already purchased: {phoneTicketCount} tickets
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.customerPhone && (
                  <p className="text-red-400 text-sm">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            {errors.contact && (
              <p className="text-red-400 text-sm">{errors.contact}</p>
            )}

            {errors.contactLimit && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{errors.contactLimit}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Special Notes (Optional)
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Method */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ticket Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                How would you like to receive your tickets?
              </p>

              <Select
                value={deliveryMethod}
                onValueChange={(value: "EMAIL" | "SMS" | "BOTH") =>
                  setDeliveryMethod(value)
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email Only</SelectItem>
                  <SelectItem value="SMS">SMS Only</SelectItem>
                  <SelectItem value="BOTH">Both Email & SMS</SelectItem>
                </SelectContent>
              </Select>

              {errors.deliveryMethod && (
                <p className="text-red-400 text-sm">{errors.deliveryMethod}</p>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> You'll receive your tickets via your
                  chosen method after booking confirmation. Make sure to provide
                  at least one contact method (email or phone).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        {selectedTicket && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {selectedTicket.categoryName} × {quantity}
                  </span>
                  <span className="text-white">
                    UGX {selectedTicket.price.toFixed(2)} each
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-500">
                    UGX {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Gateway Selector - Select BEFORE booking */}
        {usePaymentIntegration && selectedTicket && !showPaymentButton && (
          <PaymentGatewaySelector
            amount={totalPrice}
            currency="UGX"
            selectedGateway={selectedPaymentGateway}
            onSelectGateway={setSelectedPaymentGateway}
          />
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="flex-1 border-gray-600 text-white hover:bg-gray-700"
            disabled={createBooking.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              (usePaymentIntegration
                ? createBookingWithPayment.isPending
                : createBooking.isPending) || !selectedTicket
            }
            className="flex-1 bg-orange-500 text-black hover:bg-orange-600"
          >
            {(
              usePaymentIntegration
                ? createBookingWithPayment.isPending
                : createBooking.isPending
            ) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {usePaymentIntegration
                  ? "Creating Booking..."
                  : "Processing..."}
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {usePaymentIntegration ? "Book & Pay" : "Confirm Booking"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Payment Flow Section */}
      {usePaymentIntegration &&
        showPaymentButton &&
        paymentData &&
        bookingData && (
          <div className="space-y-6">
            {/* Booking Success Banner */}
            <Card className="bg-linear-to-r from-green-900/40 to-green-800/40 border-green-700/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-bold mb-2">
                      Booking Created Successfully! 🎉
                    </h3>
                    <p className="text-green-100 mb-3">
                      Your booking has been reserved. Complete the payment to
                      confirm your tickets.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-green-300">Reference: </span>
                        <span className="font-mono font-bold text-white">
                          {bookingData.bookingReference}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-300">Status: </span>
                        <Badge
                          variant="secondary"
                          className="ml-1 bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        >
                          {bookingData.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-green-300">Amount: </span>
                        <span className="font-bold text-white">
                          {paymentData.currency}{" "}
                          {paymentData.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary & Action */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Event</span>
                    <span className="text-white font-medium">
                      {event.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white font-medium">
                      {quantity} ticket(s)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Booking Reference</span>
                    <span className="text-white font-mono text-sm">
                      {bookingData.bookingReference}
                    </span>
                  </div>
                  {gatewayType && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Payment Method</span>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {gatewayType}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 pt-4">
                    <span className="text-white text-lg font-semibold">
                      Total Amount
                    </span>
                    <span className="text-orange-500 text-2xl font-bold">
                      {paymentData.currency}{" "}
                      {paymentData.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Gateway-specific instructions */}
                {gatewayType === 'PESPAL' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
                    <Shield className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-blue-400 text-sm">
                      Your payment is secured with industry-standard encryption.
                      You will be redirected to PesaPal to complete
                      your transaction.
                    </p>
                  </div>
                )}
                
                {(gatewayType === 'MTN' || gatewayType === 'AIRTEL') && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
                    <Phone className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 text-sm font-semibold mb-1">
                        {gatewayType === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'} Payment
                      </p>
                      <p className="text-blue-400 text-sm">
                        Please check your phone for a payment prompt to complete the transaction.
                        If you don't receive a prompt within 2 minutes, please contact support.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                    disabled={submitPaymentOrder.isPending}
                  >
                    Cancel
                  </Button>
                  {gatewayType === 'PESPAL' ? (
                    <Button
                      onClick={handlePaymentSubmit}
                      disabled={submitPaymentOrder.isPending}
                      className="flex-1 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                      size="lg"
                    >
                      {submitPaymentOrder.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Redirecting to PesaPal...
                        </>
                      ) : (
                        <>
                          Continue to PesaPal Payment
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePaymentSubmit}
                      className="flex-1 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
                      size="lg"
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      I've Completed the Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};
