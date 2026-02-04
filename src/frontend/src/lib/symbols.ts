// Symbol normalization helpers for matching Binance tickers to projections

export const WHITELISTED_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'ICPUSDT',
  'ADAUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'MATICUSDT',
  'DOTUSDT',
] as const;

export type WhitelistedSymbol = typeof WHITELISTED_SYMBOLS[number];

// Map base symbols to Binance quote symbols
const BASE_TO_QUOTE_MAP: Record<string, string> = {
  'BTC': 'BTCUSDT',
  'ETH': 'ETHUSDT',
  'BNB': 'BNBUSDT',
  'SOL': 'SOLUSDT',
  'ICP': 'ICPUSDT',
  'ADA': 'ADAUSDT',
  'XRP': 'XRPUSDT',
  'DOGE': 'DOGEUSDT',
  'MATIC': 'MATICUSDT',
  'DOT': 'DOTUSDT',
};

// Map Binance quote symbols to base symbols
const QUOTE_TO_BASE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BASE_TO_QUOTE_MAP).map(([base, quote]) => [quote, base])
);

/**
 * Normalize a symbol to Binance quote format (e.g., "BTC" -> "BTCUSDT")
 */
export function normalizeToQuoteSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  
  // Already in quote format
  if (upper.endsWith('USDT')) {
    return upper;
  }
  
  // Convert base to quote
  return BASE_TO_QUOTE_MAP[upper] || `${upper}USDT`;
}

/**
 * Normalize a symbol to base format (e.g., "BTCUSDT" -> "BTC")
 */
export function normalizeToBaseSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  
  // Already in base format
  if (!upper.endsWith('USDT')) {
    return upper;
  }
  
  // Convert quote to base
  return QUOTE_TO_BASE_MAP[upper] || upper.replace('USDT', '');
}

/**
 * Check if two symbols match (handles both base and quote formats)
 */
export function symbolsMatch(symbol1: string, symbol2: string): boolean {
  const normalized1 = normalizeToQuoteSymbol(symbol1);
  const normalized2 = normalizeToQuoteSymbol(symbol2);
  return normalized1 === normalized2;
}

/**
 * Generate a deterministic seed for a symbol (for stable fallback generation)
 */
export function getSymbolSeed(symbol: string): number {
  const normalized = normalizeToBaseSymbol(symbol);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate deterministic target level multipliers for a symbol
 */
export function getTargetMultipliers(symbol: string, trend: string): { upper: number; lower: number } {
  const seed = getSymbolSeed(symbol);
  const variance = (seed % 100) / 1000; // 0-0.099 variance
  
  const trendLower = trend.toLowerCase();
  const isBullish = trendLower.includes('alta') || trendLower.includes('up') || trendLower.includes('bullish');
  const isBearish = trendLower.includes('baixa') || trendLower.includes('down') || trendLower.includes('bearish');
  
  if (isBullish) {
    return {
      upper: 1.05 + variance,
      lower: 0.97 - variance,
    };
  } else if (isBearish) {
    return {
      upper: 0.95 + variance,
      lower: 0.90 - variance,
    };
  }
  
  // Neutral
  return {
    upper: 1.02 + variance,
    lower: 0.98 - variance,
  };
}
