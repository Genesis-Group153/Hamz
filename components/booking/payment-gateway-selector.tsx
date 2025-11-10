'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAvailableGateways } from '@/lib/hooks/usePaymentGateways';
import { filterGatewaysByCriteria, AvailableGateway } from '@/lib/api/payment-gateways';
import Image from 'next/image';

interface PaymentGatewaySelectorProps {
  amount: number;
  currency: string;
  selectedGateway: string | null;
  onSelectGateway: (code: string) => void;
  className?: string;
}

export const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  amount,
  currency,
  selectedGateway,
  onSelectGateway,
  className = '',
}) => {
  const { data: gateways, isLoading, error } = useAvailableGateways();

  // Filter gateways based on currency and amount
  const availableGateways = useMemo(() => {
    if (!gateways) return [];
    return filterGatewaysByCriteria(gateways, currency, amount);
  }, [gateways, currency, amount]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white border-gray-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-gray-400 text-sm">Loading payment methods...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white border-gray-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Failed to load payment methods</p>
              <p className="text-red-400 text-sm mt-1">
                Please refresh the page or contact support if the problem persists.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No gateways available
  if (!availableGateways || availableGateways.length === 0) {
    return (
      <Card className="bg-white border-gray-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-medium">No payment methods available</p>
              <p className="text-yellow-400 text-sm mt-1">
                No payment gateways support {currency} currency or the amount of {amount.toLocaleString()}. 
                Please contact support for assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-background border-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Select Payment Method
        </CardTitle>
        <p className="text-gray-600 text-sm mt-2">
          Choose your preferred payment gateway to complete the transaction
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info banner */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-600 text-sm">
            All payment methods are secure and encrypted. Select the one that works best for you.
          </p>
        </div>

        {/* Gateway options */}
        <div className="space-y-3">
          {availableGateways.map((gateway) => (
            <GatewayOption
              key={gateway.code}
              gateway={gateway}
              isSelected={selectedGateway === gateway.code}
              onSelect={() => onSelectGateway(gateway.code)}
            />
          ))}
        </div>

        {/* Selected gateway info */}
        {selectedGateway && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-600 text-sm font-medium">
                {availableGateways.find(g => g.code === selectedGateway)?.displayName} selected
              </p>
              <p className="text-blue-600 text-xs mt-0.5">
                You can proceed to complete your payment
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Gateway option component
interface GatewayOptionProps {
  gateway: AvailableGateway;
  isSelected: boolean;
  onSelect: () => void;
}

const GatewayOption: React.FC<GatewayOptionProps> = ({ gateway, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`
        relative border rounded-xl p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="shrink-0">
          {gateway.logo ? (
            <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center p-2 shadow-md">
              <img
                src={gateway.logo}
                alt={gateway.displayName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <CreditCard className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-gray-900 font-semibold text-base">
                {gateway.displayName}
              </h4>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {gateway.description}
              </p>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="shrink-0">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Gateway details */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Supported currencies */}
            <div className="flex items-center gap-1">
              {gateway.supportedCurrencies.slice(0, 3).map((curr) => (
                <Badge
                  key={curr}
                  variant="outline"
                  className="bg-gray-100 border-gray-300 text-gray-600 text-xs"
                >
                  {curr}
                </Badge>
              ))}
              {gateway.supportedCurrencies.length > 3 && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 border-gray-300 text-gray-600 text-xs"
                >
                  +{gateway.supportedCurrencies.length - 3}
                </Badge>
              )}
            </div>

            {/* Amount limits */}
            {(gateway.minAmount || gateway.maxAmount) && (
              <Badge
                variant="outline"
                className="bg-blue-100 border-blue-300 text-blue-600 text-xs"
              >
                {gateway.minAmount && gateway.maxAmount 
                  ? `${gateway.minAmount.toLocaleString()} - ${gateway.maxAmount.toLocaleString()}`
                  : gateway.minAmount 
                  ? `Min: ${gateway.minAmount.toLocaleString()}`
                  : `Max: ${gateway.maxAmount?.toLocaleString()}`
                }
              </Badge>
            )}

            {/* Priority indicator (optional, only for high priority) */}
            {gateway.priority >= 5 && (
              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                ⭐ Recommended
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Selected indicator border */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-primary pointer-events-none" />
      )}
    </div>
  );
};

