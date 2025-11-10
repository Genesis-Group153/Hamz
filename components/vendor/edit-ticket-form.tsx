'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateTicket, useHardTicketSettings } from '@/lib/hooks/useTickets';
import { TicketResponse, UpdateTicketDto } from '@/lib/api/tickets';
import { toast } from 'sonner';
import { X, Loader2, Store, Printer, Lock, AlertCircle, Edit, Calendar } from 'lucide-react';

interface EditTicketFormProps {
  ticket: TicketResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditTicketForm({ ticket, onSuccess, onCancel }: EditTicketFormProps) {
  const [formData, setFormData] = useState<UpdateTicketDto>({
    categoryName: ticket.categoryName,
    price: ticket.price,
    quantity: ticket.quantity,
    description: ticket.description || '',
    salesStart: ticket.salesStart ? new Date(ticket.salesStart).toISOString().slice(0, 16) : '',
    salesEnd: ticket.salesEnd ? new Date(ticket.salesEnd).toISOString().slice(0, 16) : '',
    salesType: ticket.salesType || 'ONLINE_ONLY',
    hardTicketPercentage: ticket.hardTicketPercentage 
      ? (typeof ticket.hardTicketPercentage === 'string' 
          ? parseFloat(ticket.hardTicketPercentage) 
          : ticket.hardTicketPercentage)
      : undefined,
  });

  const [hardTicketPercentageValue, setHardTicketPercentageValue] = useState<string>(
    formData.hardTicketPercentage?.toString() || ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [priceInputValue, setPriceInputValue] = useState<string>('');

  const updateTicketMutation = useUpdateTicket();
  
  // Fetch hard ticket settings
  const { data: hardTicketSettings, isLoading: isLoadingSettings } = useHardTicketSettings();
  const maxHardTicketPercentage = hardTicketSettings?.maxPercentage || 100;
  const defaultHardTicketPercentage = hardTicketSettings?.defaultPercentage || 40;

  // Initialize priceInputValue
  useEffect(() => {
    if (ticket.price > 0) {
      setPriceInputValue(ticket.price.toString());
    }
  }, [ticket.price]);

  // Check if sales have started
  const hasSalesStarted = () => {
    if (ticket.status !== 'AVAILABLE') return false;
    if (!ticket.salesStart) return false;
    const salesStartDate = new Date(ticket.salesStart);
    const now = new Date();
    return now >= salesStartDate;
  };

  // Check if price can be changed (protected if tickets sold)
  const canChangePrice = () => {
    return (ticket.soldQuantity || 0) === 0;
  };

  // Check if sales dates can be changed
  const canChangeSalesStart = () => {
    if (hasSalesStarted()) return false;
    if (!formData.salesStart) return true;
    const salesStartDate = new Date(formData.salesStart);
    const now = new Date();
    return salesStartDate >= now;
  };

  const canEdit = !hasSalesStarted();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryName?.trim()) {
      newErrors.categoryName = 'Category name is required';
    }

    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }

    if (formData.quantity !== undefined && formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.salesType === 'HYBRID' && formData.hardTicketPercentage !== undefined) {
      if (formData.hardTicketPercentage < 1 || formData.hardTicketPercentage > maxHardTicketPercentage) {
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

    // Sales start validation
    if (formData.salesStart && canChangeSalesStart()) {
      const salesStartDate = new Date(formData.salesStart);
      const now = new Date();
      if (salesStartDate < now) {
        newErrors.salesStart = 'Sales start date cannot be in the past';
      }
    }

    // Sales end validation
    if (formData.salesEnd && ticket.salesEnd) {
      const salesEndDate = new Date(ticket.salesEnd);
      const now = new Date();
      if (now > salesEndDate) {
        newErrors.salesEnd = 'Cannot change sales end date after it has passed';
      }
    }

    if (formData.salesStart && formData.salesEnd) {
      const startDate = new Date(formData.salesStart);
      const endDate = new Date(formData.salesEnd);
      if (endDate <= startDate) {
        newErrors.salesEnd = 'Sales end date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!canEdit) {
      toast.error('Cannot edit ticket category once sales have started. Please contact admin for assistance.');
      return;
    }

    const updateData: UpdateTicketDto = {
      categoryName: formData.categoryName?.trim(),
      price: formData.price,
      quantity: formData.quantity,
      description: formData.description?.trim() || undefined,
      salesStart: formData.salesStart || undefined,
      salesEnd: formData.salesEnd || undefined,
      salesType: formData.salesType,
      ...(formData.salesType === 'HYBRID' && formData.hardTicketPercentage !== undefined
        ? { hardTicketPercentage: formData.hardTicketPercentage }
        : {}),
    };

    updateTicketMutation.mutate(
      {
        ticketCategoryId: ticket.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success('Ticket category updated successfully!');
          onSuccess?.();
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to update ticket category';
          toast.error(errorMessage);
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
        },
      }
    );
  };

  const handleInputChange = (field: keyof UpdateTicketDto, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const salesStarted = hasSalesStarted();
  const priceProtected = !canChangePrice();

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="p-4 sm:p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Edit Ticket Category</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Update ticket category details</p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {salesStarted && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-1">Sales Have Started</h4>
                <p className="text-sm text-red-700">
                  This ticket category cannot be edited because sales have started. Please contact admin for assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        {priceProtected && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-yellow-900 mb-1">Price Protection</h4>
                <p className="text-sm text-yellow-700">
                  Cannot change price. {ticket.soldQuantity || 0} ticket(s) have already been sold. Please contact admin for assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <label htmlFor="categoryName" className="block text-sm font-bold text-gray-900">
              Category Name <span className="text-red-600">*</span>
            </label>
            <Input
              id="categoryName"
              type="text"
              value={formData.categoryName || ''}
              onChange={(e) => handleInputChange('categoryName', e.target.value)}
              disabled={!canEdit}
              placeholder="e.g., VIP Pass, General Admission, Early Bird"
              className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {errors.categoryName && <p className="text-red-600 text-sm">{errors.categoryName}</p>}
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-bold text-gray-900">
                Price (UGX) <span className="text-red-600">*</span>
                {priceProtected && <Lock className="h-3 w-3 text-yellow-600 inline-block ml-1" />}
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
                  const numValue = value === '' ? 0 : parseFloat(value) || 0;
                  handleInputChange('price', numValue);
                }}
                onFocus={(e) => {
                  if (priceInputValue === '' || priceInputValue === '0') {
                    setPriceInputValue('');
                  } else {
                    e.target.select();
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '0') {
                    setPriceInputValue('');
                    handleInputChange('price', 0);
                  } else {
                    const numValue = parseFloat(value) || 0;
                    setPriceInputValue(numValue > 0 ? numValue.toString() : '');
                  }
                }}
                disabled={!canEdit || priceProtected}
                placeholder="0.00"
                className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {priceProtected && (
                <p className="text-xs text-yellow-700">
                  Price is locked because tickets have been sold. Contact admin to change.
                </p>
              )}
              {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
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
                value={formData.quantity || 0}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                onFocus={(e) => e.target.select()}
                disabled={!canEdit}
                placeholder="100"
                className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.quantity && <p className="text-red-600 text-sm">{errors.quantity}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-900">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={!canEdit}
              placeholder="Describe what this ticket category includes (e.g., premium seating, exclusive access, etc.)"
              rows={3}
              className="w-full px-3 py-2 border-2 rounded-md text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sales Type */}
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Sales Type</h3>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">How would you like to sell tickets for this category?</label>
              <Select
                value={formData.salesType || 'ONLINE_ONLY'}
                onValueChange={(value: 'ONLINE_ONLY' | 'HYBRID') => {
                  handleInputChange('salesType', value);
                  if (value === 'ONLINE_ONLY') {
                    handleInputChange('hardTicketPercentage', undefined);
                    setHardTicketPercentageValue('');
                  } else {
                    const defaultValue = defaultHardTicketPercentage;
                    handleInputChange('hardTicketPercentage', defaultValue);
                    setHardTicketPercentageValue(defaultValue.toString());
                  }
                }}
                disabled={!canEdit}
              >
                <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
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
                    <p className="text-blue-700 text-xs">All tickets will be digital (SOFT). No physical tickets will be generated.</p>
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
                  {hardTicketPercentageValue && formData.quantity && formData.quantity > 0 && (
                    <span className="block mt-1 font-medium text-blue-700">
                      → {Math.floor((parseInt(hardTicketPercentageValue) || 0) * (formData.quantity || 0) / 100)} hard tickets will be generated,{' '}
                      {(formData.quantity || 0) - Math.floor((parseInt(hardTicketPercentageValue) || 0) * (formData.quantity || 0) / 100)}{' '}
                      soft tickets for online sales
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
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Sales Period (Optional)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Start */}
              <div className="space-y-2">
                <label htmlFor="salesStart" className="block text-sm font-bold text-gray-900">
                  Sales Start Date & Time
                  {!canChangeSalesStart() && <Lock className="h-3 w-3 text-yellow-600 inline-block ml-1" />}
                </label>
                <Input
                  id="salesStart"
                  type="datetime-local"
                  value={formData.salesStart || ''}
                  onChange={(e) => handleInputChange('salesStart', e.target.value)}
                  disabled={!canEdit || !canChangeSalesStart()}
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {!canChangeSalesStart() && (
                  <p className="text-xs text-yellow-700">Sales start date cannot be changed after sales have started or if set in the past.</p>
                )}
                {errors.salesStart && <p className="text-red-600 text-sm">{errors.salesStart}</p>}
              </div>

              {/* Sales End */}
              <div className="space-y-2">
                <label htmlFor="salesEnd" className="block text-sm font-bold text-gray-900">
                  Sales End Date & Time
                </label>
                <Input
                  id="salesEnd"
                  type="datetime-local"
                  value={formData.salesEnd || ''}
                  onChange={(e) => handleInputChange('salesEnd', e.target.value)}
                  disabled={!canEdit || !!(ticket.salesEnd && new Date(ticket.salesEnd) < new Date())}
                  className="h-12 text-base border-2 focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {ticket.salesEnd && new Date(ticket.salesEnd) < new Date() && (
                  <p className="text-xs text-yellow-700">Sales end date cannot be changed after it has passed.</p>
                )}
                {errors.salesEnd && <p className="text-red-600 text-sm">{errors.salesEnd}</p>}
              </div>
            </div>
            <p className="text-gray-600 text-sm">Leave empty to allow sales until the event date or manually stop sales.</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition-all">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={updateTicketMutation.isPending || !canEdit}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTicketMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Ticket Category
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

