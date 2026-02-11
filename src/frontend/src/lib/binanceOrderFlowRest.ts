/**
 * Binance Order Flow REST API Client
 * Fetches public market data for order flow analysis
 * 
 * IMPORTANT: All endpoints here are PUBLIC and do NOT require API keys
 */

import { BINANCE_SPOT_REST_BASE, BINANCE_FUTURES_REST_BASE } from './binanceDomains';

export type MarketType = 'spot' | 'futures';

export interface Ticker24h {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
}

export interface RecentTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
}

export interface BookTicker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

/**
 * Fetch 24h ticker data (public endpoint, no auth required)
 */
export async function fetch24hTicker(
  symbol: string,
  market: MarketType,
  signal?: AbortSignal
): Promise<Ticker24h | null> {
  const base = market === 'futures' ? BINANCE_FUTURES_REST_BASE : BINANCE_SPOT_REST_BASE;
  const endpoint = market === 'futures' ? '/fapi/v1/ticker/24hr' : '/api/v3/ticker/24hr';
  const url = `${base}${endpoint}?symbol=${symbol}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      console.warn(`Failed to fetch 24h ticker: ${response.status}`);
      return null;
    }
    const data = await response.json();
    // Validate response shape
    if (!data || typeof data.symbol !== 'string') {
      console.warn('Invalid 24h ticker response shape');
      return null;
    }
    return data;
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Error fetching 24h ticker:', error);
    }
    return null;
  }
}

/**
 * Fetch recent trades (public endpoint, no auth required)
 */
export async function fetchRecentTrades(
  symbol: string,
  market: MarketType,
  limit: number = 100,
  signal?: AbortSignal
): Promise<RecentTrade[]> {
  const base = market === 'futures' ? BINANCE_FUTURES_REST_BASE : BINANCE_SPOT_REST_BASE;
  const endpoint = market === 'futures' ? '/fapi/v1/trades' : '/api/v3/trades';
  const url = `${base}${endpoint}?symbol=${symbol}&limit=${limit}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      console.warn(`Failed to fetch recent trades: ${response.status}`);
      return [];
    }
    const data = await response.json();
    // Validate response is an array
    if (!Array.isArray(data)) {
      console.warn('Invalid recent trades response: expected array');
      return [];
    }
    // Filter out invalid entries
    return data.filter(trade => 
      trade && 
      typeof trade.price === 'string' && 
      typeof trade.qty === 'string' &&
      typeof trade.time === 'number'
    );
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Error fetching recent trades:', error);
    }
    return [];
  }
}

/**
 * Fetch book ticker (best bid/ask) (public endpoint, no auth required)
 */
export async function fetchBookTicker(
  symbol: string,
  market: MarketType,
  signal?: AbortSignal
): Promise<BookTicker | null> {
  const base = market === 'futures' ? BINANCE_FUTURES_REST_BASE : BINANCE_SPOT_REST_BASE;
  const endpoint = market === 'futures' ? '/fapi/v1/ticker/bookTicker' : '/api/v3/ticker/bookTicker';
  const url = `${base}${endpoint}?symbol=${symbol}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      console.warn(`Failed to fetch book ticker: ${response.status}`);
      return null;
    }
    const data = await response.json();
    // Validate response shape
    if (!data || typeof data.bidPrice !== 'string' || typeof data.askPrice !== 'string') {
      console.warn('Invalid book ticker response shape');
      return null;
    }
    return data;
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Error fetching book ticker:', error);
    }
    return null;
  }
}
