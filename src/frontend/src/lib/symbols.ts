// Symbol normalization helpers for matching Binance tickers

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

/**
 * Check if two symbols match (handles both base and quote formats)
 */
export function symbolsMatch(symbol1: string, symbol2: string): boolean {
  const normalize = (s: string) => {
    const upper = s.toUpperCase();
    if (upper.endsWith('USDT')) return upper;
    return `${upper}USDT`;
  };
  
  return normalize(symbol1) === normalize(symbol2);
}
