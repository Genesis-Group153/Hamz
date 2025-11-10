'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTicket, useHardTicketSettings } from '@/lib/hooks/useTickets';
import { toast } from 'sonner';
import { X, Plus, Loader2, Store, Printer } from 'lucide-react';

interface CreateTicketFormProps {
  eventId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TicketFormData {
  categoryName: string;
  price: number;
  quantity: number;
  description: string;
  salesStart: string;
  salesEnd: string;
  salesType: 'ONLINE_ONLY' | 'HYBRID';
  hardTicketPercentage: number;
}

export function CreateTicketForm({ eventId, onSuccess, onCancel }: CreateTicketFormProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    categoryName: '',
    price: 0,
    quantity: 1,
    description: '',
    salesStart: '',
    salesEnd: '',
    salesType: 'ONLINE_ONLY',
    hardTicketPercentage: 40,
  });

  const [hardTicketPercentageValue, setHardTicketPercentageValue] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [priceInputValue, setPriceInputValue] = useState<string>('');
  const createTicketMutation = useCreateTicket();
  
  // Fetch hard ticket settings
  const { data: hardTicketSettings, isLoading: isLoadingSettings } = useHardTicketSettings();
  const maxHardTicketPercentage = hardTicketSettings?.maxPercentage || 100;
  const defaultHardTicketPercentage = hardTicketSettings?.defaultPercentage || 40;

  // Initialize priceInputValue to empty string (shows placeholder instead of 0)
  useEffect(() => {
    if (formData.price === 0 && priceInputValue === '') {
      // Already empty, good
    } else if (formData.price > 0 && priceInputValue === '') {
      setPriceInputValue(formData.price.toString());
    }
  }, []);

  // Initialize hardTicketPercentageValue when salesType is HYBRID
  useEffect(() => {
    if (formData.salesType === 'HYBRID' && hardTicketPercentageValue === '' && !isLoadingSettings) {
      const defaultValue = defaultHardTicketPercentage;
      setHardTicketPercentageValue(defaultValue.toString());
      handleInputChange('hardTicketPercentage', defaultValue);
    }
  }, [formData.salesType, isLoadingSettings, defaultHardTicketPercentage]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.salesType === 'HYBRID') {
      if (!formData.hardTicketPercentage || formData.hardTicketPercentage < 1 || formData.hardTicketPercentage > maxHardTicketPercentage) {
        newErrors.hardTicketPercentage = `Hard ticket percentage must be between 1 and ${maxHardTicketPercentage}% (admin-set maximum)`;
      }
    }

    if (formData.salesStart && formData.salesEnd) {
      const startDate = new Date(formData.salesStart);
      const endDate = new Date(formData.salesEnd);
      if (startDate >= endDate) {
        newErrors.salesEnd = 'Sales end date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Ticket form submission started', { formData, eventId });
    
    if (!validateForm()) {
      console.log('Validation failed', { errors });
      toast.error('Please fix the errors in the form');
      return;
    }

    console.log('Validation passed, submitting ticket form...');
    
    const ticketData = {
      eventId,
      categoryName: formData.categoryName.trim(),
      price: formData.price,
      quantity: formData.quantity,
      description: formData.description.trim() || undefined,
      salesStart: formData.salesStart || undefined,
      salesEnd: formData.salesEnd || undefined,
      salesType: formData.salesType,
      ...(formData.salesType === 'HYBRID' && formData.hardTicketPercentage > 0 
        ? { hardTicketPercentage: formData.hardTicketPercentage } 
        : {}),
    };

    createTicketMutation.mutate(ticketData, {
      onSuccess: (data) => {
        console.log('Ticket created successfully', data);
        toast.success('Ticket category created! Status is UNAVAILABLE. Change status to AVAILABLE to start sales.');
        setFormData({
          categoryName: '',
          price: 0,
          quantity: 1,
          description: '',
          salesStart: '',
          salesEnd: '',
          salesType: 'ONLINE_ONLY',
          hardTicketPercentage: 40,
        });
        setPriceInputValue('');
        setHardTicketPercentageValue('');
        onSuccess?.();
      },
      onError: (error: any) => {
        console.error('Ticket creation failed', error);
        const errorMessage = error.response?.data?.message || '';
        // Check if error is about hard ticket percentage exceeding max
        if (errorMessage.toLowerCase().includes('hard ticket percentage') || errorMessage.toLowerCase().includes('exceed')) {
          // Error message should contain the max percentage
          const maxMatch = errorMessage.match(/(\d+)%/);
          if (maxMatch && maxMatch[1]) {
            const extractedMax = parseInt(maxMatch[1]);
            if (extractedMax > 0 && extractedMax <= 100) {
              // Update error to highlight the field
              setErrors(prev => ({
                ...prev,
                hardTicketPercentage: errorMessage
              }));
            }
          }
        }
      }
    });
  };

  const handleInputChange = (field: keyof TicketFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="p-4 sm:p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Create Ticket Category
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Add a new ticket category for your event
              </p>
            </div>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <label htmlFor="categoryName" className="block text-sm font-bold text-gray-900">
              Category Name <span className="text-red-600">*</span>
            </label>
            <Input
              id="categoryName"
              type="text"
              value={formData.categoryName}
              onChange={(e) => handleInputChange('categoryName', e.target.value)}
              placeholder="e.g., VIP Pass, General Admission, Early Bird"
              className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.categoryName && (
              <p className="text-red-600 text-sm">{errors.categoryName}</p>
            )}
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-bold text-gray-900">
                Price (UGX) <span className="text-red-600">*</span>
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={priceInputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setPriceInputValue(value);
                  // Update formData.price, use 0 if empty
                  const numValue = value === '' ? 0 : parseFloat(value) || 0;
                  handleInputChange('price', numValue);
                }}
                onFocus={(e) => {
                  // Clear the input if it's 0 or empty, otherwise select all
                  if (priceInputValue === '' || priceInputValue === '0' || formData.price === 0) {
                    setPriceInputValue('');
                  } else {
                    e.target.select();
                  }
                }}
                onBlur={(e) => {
                  // If empty or 0 on blur, reset to empty display but keep 0 in formData
                  const value = e.target.value;
                  if (value === '' || value === '0') {
                    setPriceInputValue('');
                    handleInputChange('price', 0);
                  } else {
                    // Keep the value as is
                    const numValue = parseFloat(value) || 0;
                    setPriceInputValue(numValue > 0 ? numValue.toString() : '');
                  }
                }}
                placeholder="0.00"
                className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.price && (
                <p className="text-red-600 text-sm">{errors.price}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-bold text-gray-900">
                Available Quantity <span className="text-red-600">*</span>
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                onFocus={(e) => e.target.select()}
                placeholder="100"
                className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-900">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this ticket category includes (e.g., premium seating, exclusive access, etc.)"
              rows={3}
              className="w-full px-3 py-2 border-2 rounded-md text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Sales Type */}
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Sales Type <span className="text-red-600">*</span></h3>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                How would you like to sell tickets for this category?
              </label>
              <Select
                value={formData.salesType}
                onValueChange={(value: 'ONLINE_ONLY' | 'HYBRID') => {
                  handleInputChange('salesType', value);
                  if (value === 'ONLINE_ONLY') {
                    handleInputChange('hardTicketPercentage', 0);
                    setHardTicketPercentageValue('');
                  } else {
                    const defaultValue = defaultHardTicketPercentage;
                    handleInputChange('hardTicketPercentage', defaultValue);
                    setHardTicketPercentageValue(defaultValue.toString());
                  }
                }}
              >
                <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Select sales type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE_ONLY">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span>Online Only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="HYBRID">
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      <span>Hybrid (Online + Physical)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                {formData.salesType === 'ONLINE_ONLY' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Online Only</p>
                    <p className="text-blue-700 text-xs">
                      All tickets will be digital (SOFT). No physical tickets will be generated. Perfect for online-only events.
                    </p>
                  </div>
                )}
                {formData.salesType === 'HYBRID' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-medium text-orange-900 mb-1">Hybrid Sales</p>
                    <p className="text-orange-700 text-xs">
                      Physical tickets (HARD) will be generated based on the percentage below. Online bookings will receive digital tickets (SOFT).
                    </p>
                    {!isLoadingSettings && hardTicketSettings && (
                      <p className="text-orange-600 text-xs mt-1 font-medium">
                        Maximum: {maxHardTicketPercentage}% | Default: {defaultHardTicketPercentage}% (if not specified)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hard Ticket Percentage (only for HYBRID) */}
            {formData.salesType === 'HYBRID' && (
              <div className="space-y-2 pt-2 border-t border-blue-200">
                <label htmlFor="hardTicketPercentage" className="block text-sm font-bold text-gray-900">
                  Hard Ticket Percentage <span className="text-red-600">*</span>
                </label>
                <Input
                  id="hardTicketPercentage"
                  type="number"
                  min="1"
                  max={maxHardTicketPercentage}
                  value={hardTicketPercentageValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHardTicketPercentageValue(value);
                    const numValue = value === '' ? 0 : parseInt(value) || 0;
                    handleInputChange('hardTicketPercentage', Math.min(maxHardTicketPercentage, Math.max(0, numValue)));
                  }}
                  onFocus={(e) => e.target.select()}
                  disabled={true}
                  placeholder="40"
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-600">
                  Percentage of tickets that will be physical (HARD). The remaining will be digital (SOFT) for online sales.
                  {!isLoadingSettings && hardTicketSettings && (
                    <span className="block mt-1 text-blue-700 font-medium">
                      Maximum: {maxHardTicketPercentage}% | Default: {defaultHardTicketPercentage}% (if not specified)
                    </span>
                  )}
                  {hardTicketPercentageValue && formData.quantity > 0 && (
                    <span className="block mt-1 font-medium text-blue-700">
                      → {Math.floor((parseInt(hardTicketPercentageValue) || 0) * formData.quantity / 100)} hard tickets will be generated, {formData.quantity - Math.floor((parseInt(hardTicketPercentageValue) || 0) * formData.quantity / 100)} soft tickets for online sales
                    </span>
                  )}
                </p>
                {errors.hardTicketPercentage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{errors.hardTicketPercentage}</p>
                    {!isLoadingSettings && hardTicketSettings && (
                      <p className="text-red-600 text-xs mt-1">Current limit: Maximum {maxHardTicketPercentage}%</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sales Period */}
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Plus className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Sales Period (Optional)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Start */}
              <div className="space-y-2">
                <label htmlFor="salesStart" className="block text-sm font-bold text-gray-900">
                  Sales Start Date & Time
                </label>
                <Input
                  id="salesStart"
                  type="datetime-local"
                  value={formData.salesStart}
                  onChange={(e) => handleInputChange('salesStart', e.target.value)}
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Sales End */}
              <div className="space-y-2">
                <label htmlFor="salesEnd" className="block text-sm font-bold text-gray-900">
                  Sales End Date & Time
                </label>
                <Input
                  id="salesEnd"
                  type="datetime-local"
                  value={formData.salesEnd}
                  onChange={(e) => handleInputChange('salesEnd', e.target.value)}
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 bg-white"
                />
                {errors.salesEnd && (
                  <p className="text-red-600 text-sm">{errors.salesEnd}</p>
                )}
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Leave empty to allow sales until the event date or manually stop sales.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition-all"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket Category
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
