/**
 * Format currency in UGX (Ugandan Shillings)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false for UGX)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (showDecimals) {
    return `UGX ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Format currency for display (short version without decimals)
 */
export function formatUGX(amount: number): string {
  return formatCurrency(amount, false);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
}




