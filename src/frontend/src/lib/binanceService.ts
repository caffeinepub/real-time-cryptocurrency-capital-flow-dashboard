/**
 * Binance WebSocket Service
 * Real-time market data streaming with REST fallback
 * 
 * IMPORTANT: All data fetched here is PUBLIC market data (no API keys required)
 */

import { BINANCE_FUTURES_WS_BASE, BINANCE_FUTURES_REST_BASE } from './binanceDomains';

export interface BinanceMarketData {
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  lastUpdateTime: number;
}

export type BinanceConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface BinanceTickerData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  lastUpdateId: number;
}

// Whitelisted symbols for market data streaming
export const WHITELISTED_SYMBOLS = new Set([
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'XRPUSDT',
  'DOTUSDT',
  'MATICUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'UNIUSDT',
  'ATOMUSDT',
  'LTCUSDT',
  'NEARUSDT',
  'ALGOUSDT',
  'ICPUSDT',
]);

// Module-level cache for stable data across component remounts
const marketDataCache = new Map<string, BinanceMarketData>();

/**
 * Fetch market data via REST API (fallback when WebSocket unavailable)
 * PUBLIC endpoint - no API keys required
 */
async function fetchMarketDataRest(symbol: string): Promise<BinanceMarketData | null> {
  try {
    const url = `${BINANCE_FUTURES_REST_BASE}/fapi/v1/ticker/24hr?symbol=${symbol}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`REST fallback failed for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Validate response shape
    if (!data || typeof data.lastPrice !== 'string') {
      console.warn(`Invalid REST response shape for ${symbol}`);
      return null;
    }

    const marketData: BinanceMarketData = {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      volume24h: parseFloat(data.volume || '0'),
      priceChange24h: parseFloat(data.priceChange || '0'),
      priceChangePercent24h: parseFloat(data.priceChangePercent || '0'),
      high24h: parseFloat(data.highPrice || '0'),
      low24h: parseFloat(data.lowPrice || '0'),
      lastUpdateTime: Date.now(),
    };

    // Round to 2 decimals
    marketData.price = Math.round(marketData.price * 100) / 100;
    marketData.priceChange24h = Math.round(marketData.priceChange24h * 100) / 100;
    marketData.priceChangePercent24h = Math.round(marketData.priceChangePercent24h * 100) / 100;

    marketDataCache.set(symbol, marketData);
    return marketData;
  } catch (error) {
    console.error(`Error fetching REST data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch prices for multiple symbols via REST API
 * PUBLIC endpoint - no API keys required
 */
export async function fetchBinancePrices(symbols: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  
  try {
    const url = `${BINANCE_FUTURES_REST_BASE}/fapi/v1/ticker/price`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Failed to fetch Binance prices: ${response.status}`);
      return prices;
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('Invalid Binance prices response: expected array');
      return prices;
    }

    data.forEach((ticker: any) => {
      if (ticker && typeof ticker.symbol === 'string' && typeof ticker.price === 'string') {
        if (symbols.includes(ticker.symbol)) {
          prices.set(ticker.symbol, parseFloat(ticker.price));
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Binance prices:', error);
  }

  return prices;
}

/**
 * WebSocket client for real-time Binance market data
 * PUBLIC stream - no API keys required
 */
export class BinanceWebSocketClient {
  private ws: WebSocket | null = null;
  private symbols: string[];
  private onData: (data: BinanceTickerData) => void;
  private onStatusChange: (status: BinanceConnectionStatus) => void;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isManualClose = false;

  constructor(
    symbols: string[],
    onData: (data: BinanceTickerData) => void,
    onStatusChange: (status: BinanceConnectionStatus) => void
  ) {
    this.symbols = symbols;
    this.onData = onData;
    this.onStatusChange = onStatusChange;
  }

  connect(): void {
    if (this.symbols.length === 0) return;

    const streams = this.symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const wsUrl = `${BINANCE_FUTURES_WS_BASE}/stream?streams=${streams}`;

    try {
      this.onStatusChange('connecting');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Binance WebSocket connected (public market data)');
        this.onStatusChange('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.data) {
            const ticker = message.data;
            const tickerData: BinanceTickerData = {
              symbol: ticker.s,
              price: ticker.c,
              priceChange: ticker.p || '0',
              priceChangePercent: ticker.P || '0',
              volume: ticker.v || '0',
              quoteVolume: ticker.q || '0',
              lastUpdateId: ticker.E || Date.now(),
            };
            this.onData(tickerData);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        this.onStatusChange('error');
      };

      this.ws.onclose = () => {
        console.log('Binance WebSocket closed');
        this.onStatusChange('disconnected');
        
        if (!this.isManualClose) {
          this.reconnectTimeout = setTimeout(() => {
            console.log('Reconnecting to Binance WebSocket...');
            this.connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.onStatusChange('error');
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Get cached market data or fetch via REST
 * PUBLIC data - no API keys required
 */
export async function getMarketData(symbol: string): Promise<BinanceMarketData | null> {
  const cached = marketDataCache.get(symbol);
  if (cached && Date.now() - cached.lastUpdateTime < 60000) {
    return cached;
  }
  return fetchMarketDataRest(symbol);
}

/**
 * Get all cached market data
 */
export function getAllCachedMarketData(): BinanceMarketData[] {
  return Array.from(marketDataCache.values());
}
