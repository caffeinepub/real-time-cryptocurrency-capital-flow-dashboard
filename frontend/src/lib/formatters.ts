// Portuguese number formatting utilities with 2 decimal places maximum

/**
 * Formats a number to Portuguese locale with maximum 2 decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2, max: 2)
 * @returns Formatted string with comma as decimal separator
 */
export function formatNumber(value: number, decimals: number = 2): string {
  const maxDecimals = Math.min(decimals, 2);
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: maxDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Formats a number as currency in Portuguese locale (BRL style but with $ symbol)
 * @param value - The number to format
 * @returns Formatted currency string with $ symbol
 */
export function formatCurrency(value: number): string {
  return `$${formatNumber(value, 2)}`;
}

/**
 * Formats a number as percentage in Portuguese locale
 * @param value - The decimal value (e.g., 0.75 for 75%)
 * @param includeSymbol - Whether to include the % symbol (default: true)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, includeSymbol: boolean = true): string {
  const percentage = value * 100;
  const formatted = formatNumber(percentage, 2);
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Formats a large number with K/M/B suffixes in Portuguese locale
 * @param value - The number to format
 * @returns Formatted string with suffix
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${formatNumber(value / 1_000_000_000, 2)}B`;
  }
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 2)}M`;
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, 2)}K`;
  }
  return formatNumber(value, 2);
}

/**
 * Rounds a number to 2 decimal places
 * @param value - The number to round
 * @returns Rounded number
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
