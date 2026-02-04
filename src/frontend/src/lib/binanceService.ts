// Binance Futures API WebSocket integration service
export interface BinanceTickerData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  lastUpdateId: number;
}

export interface BinanceAggTrade {
  symbol: string;
  price: string;
  quantity: string;
  timestamp: number;
  isBuyerMaker: boolean;
}

export type BinanceConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const BINANCE_WS_BASE = 'wss://fstream.binance.com/ws';
const BINANCE_REST_BASE = 'https://fapi.binance.com/fapi/v1';

// Whitelisted trading pairs for the dashboard
export const WHITELISTED_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'ICPUSDT',
] as const;

export type WhitelistedSymbol = typeof WHITELISTED_SYMBOLS[number];

export class BinanceWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;

  constructor(
    private symbols: string[],
    private onTicker: (data: BinanceTickerData) => void,
    private onStatusChange: (status: BinanceConnectionStatus) => void
  ) {}

  connect() {
    this.isIntentionallyClosed = false;
    this.onStatusChange('connecting');

    try {
      // Create stream names for all symbols
      const streams = this.symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const wsUrl = `${BINANCE_WS_BASE}/${streams}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Binance WebSocket connected');
        this.reconnectAttempts = 0;
        this.onStatusChange('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle stream data format
          if (data.stream && data.data) {
            const tickerData: BinanceTickerData = {
              symbol: data.data.s,
              price: data.data.c,
              priceChange: data.data.p,
              priceChangePercent: data.data.P,
              volume: data.data.v,
              quoteVolume: data.data.q,
              lastUpdateId: data.data.E,
            };
            this.onTicker(tickerData);
          } else if (data.e === '24hrTicker') {
            // Handle single ticker format
            const tickerData: BinanceTickerData = {
              symbol: data.s,
              price: data.c,
              priceChange: data.p,
              priceChangePercent: data.P,
              volume: data.v,
              quoteVolume: data.q,
              lastUpdateId: data.E,
            };
            this.onTicker(tickerData);
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
        this.ws = null;
        
        if (!this.isIntentionallyClosed) {
          this.onStatusChange('disconnected');
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.onStatusChange('error');
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onStatusChange('error');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.onStatusChange('disconnected');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// REST API fallback for fetching current prices
export async function fetchBinancePrices(symbols: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  try {
    const response = await fetch(`${BINANCE_REST_BASE}/ticker/price`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for our whitelisted symbols
    const filteredData = Array.isArray(data) 
      ? data.filter((item: any) => symbols.includes(item.symbol))
      : [];

    filteredData.forEach((item: any) => {
      priceMap.set(item.symbol, parseFloat(item.price));
    });

    return priceMap;
  } catch (error) {
    console.error('Error fetching Binance prices:', error);
    return priceMap;
  }
}

// Fetch 24hr ticker statistics
export async function fetchBinanceTicker24hr(symbol: string): Promise<BinanceTickerData | null> {
  try {
    const response = await fetch(`${BINANCE_REST_BASE}/ticker/24hr?symbol=${symbol}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      symbol: data.symbol,
      price: data.lastPrice,
      priceChange: data.priceChange,
      priceChangePercent: data.priceChangePercent,
      volume: data.volume,
      quoteVolume: data.quoteVolume,
      lastUpdateId: data.closeTime,
    };
  } catch (error) {
    console.error(`Error fetching ticker for ${symbol}:`, error);
    return null;
  }
}
