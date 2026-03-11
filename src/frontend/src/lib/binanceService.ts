// Binance public market data service - no API key required
import { BINANCE_SPOT_REST_BASE } from "./binanceDomains";

export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "polling"
  | "loading";

export interface TickerData {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  closeTime: number;
}

export const WHITELISTED_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "DOTUSDT",
  "MATICUSDT",
  "LINKUSDT",
  "UNIUSDT",
  "LTCUSDT",
  "ATOMUSDT",
  "NEARUSDT",
  "APTUSDT",
  "ARBUSDT",
  "OPUSDT",
  "INJUSDT",
  "SUIUSDT",
];

export async function fetchTickerREST(
  symbol: string,
): Promise<TickerData | null> {
  try {
    const res = await fetch(
      `${BINANCE_SPOT_REST_BASE}/api/v3/ticker/24hr?symbol=${symbol}`,
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      symbol: d.symbol,
      lastPrice: Number.parseFloat(d.lastPrice) || 0,
      priceChangePercent: Number.parseFloat(d.priceChangePercent) || 0,
      volume: Number.parseFloat(d.volume) || 0,
      quoteVolume: Number.parseFloat(d.quoteVolume) || 0,
      highPrice: Number.parseFloat(d.highPrice) || 0,
      lowPrice: Number.parseFloat(d.lowPrice) || 0,
      openPrice: Number.parseFloat(d.openPrice) || 0,
      closeTime: d.closeTime || 0,
    };
  } catch {
    return null;
  }
}

// Legacy export used by some existing hooks
export async function fetchBinancePrices(
  symbols: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const results = await Promise.allSettled(
    symbols.map((s) => fetchTickerREST(s)),
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      map.set(symbols[i], r.value.lastPrice);
    }
  });
  return map;
}

type StatusCallback = (status: ConnectionStatus) => void;
type TickerCallback = (symbol: string, data: TickerData) => void;

export class BinanceWebSocketClient {
  private symbols: string[];
  private ws: WebSocket | null = null;
  private statusCallbacks: StatusCallback[] = [];
  private tickerCallbacks: TickerCallback[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isDestroyed = false;

  constructor(symbols: string[]) {
    this.symbols = symbols;
  }

  onStatusChange(cb: StatusCallback) {
    this.statusCallbacks.push(cb);
  }

  onTicker(cb: TickerCallback) {
    this.tickerCallbacks.push(cb);
  }

  connect() {
    if (this.isDestroyed) return;
    const streams = this.symbols
      .map((s) => `${s.toLowerCase()}@ticker`)
      .join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        for (const cb of this.statusCallbacks) cb("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const d = msg.data;
          if (!d || !d.s) return;
          const ticker: TickerData = {
            symbol: d.s,
            lastPrice: Number.parseFloat(d.c) || 0,
            priceChangePercent: Number.parseFloat(d.P) || 0,
            volume: Number.parseFloat(d.v) || 0,
            quoteVolume: Number.parseFloat(d.q) || 0,
            highPrice: Number.parseFloat(d.h) || 0,
            lowPrice: Number.parseFloat(d.l) || 0,
            openPrice: Number.parseFloat(d.o) || 0,
            closeTime: d.C || 0,
          };
          for (const cb of this.tickerCallbacks) cb(d.s, ticker);
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onerror = () => {
        for (const cb of this.statusCallbacks) cb("disconnected");
      };

      this.ws.onclose = () => {
        if (this.isDestroyed) return;
        for (const cb of this.statusCallbacks) cb("disconnected");
        this.scheduleReconnect();
      };
    } catch {
      for (const cb of this.statusCallbacks) cb("disconnected");
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) this.connect();
    }, delay);
  }

  disconnect() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}
