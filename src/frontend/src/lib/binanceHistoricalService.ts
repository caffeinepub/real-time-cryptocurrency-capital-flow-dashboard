/**
 * Binance Historical Data Service
 * Fetches historical candlestick (klines) data from Binance public API
 * No API keys required - public endpoint only
 */

import { BINANCE_SPOT_REST_BASE } from "./binanceDomains";

export interface KlineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Fetch historical candlestick data from Binance
 * @param symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @param interval - Candlestick interval (e.g., '1h', '4h', '1d')
 * @param limit - Number of data points to fetch (max 1000)
 * @returns Array of parsed kline data
 */
export async function fetchKlines(
  symbol: string,
  interval = "4h",
  limit = 100,
): Promise<KlineData[]> {
  try {
    const url = `${BINANCE_SPOT_REST_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Binance API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from Binance API");
    }

    // Parse Binance kline format: [timestamp, open, high, low, close, volume, ...]
    return data.map((kline: any[]) => ({
      timestamp: kline[0],
      open: Number.parseFloat(kline[1]),
      high: Number.parseFloat(kline[2]),
      low: Number.parseFloat(kline[3]),
      close: Number.parseFloat(kline[4]),
      volume: Number.parseFloat(kline[5]),
    }));
  } catch (error) {
    console.error("[Binance Historical] Error fetching klines:", error);
    throw error;
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function fetchKlinesWithRetry(
  symbol: string,
  interval = "4h",
  limit = 100,
  maxRetries = 3,
): Promise<KlineData[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchKlines(symbol, interval, limit);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes("4")) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        const delay = 2 ** attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed to fetch klines after retries");
}
