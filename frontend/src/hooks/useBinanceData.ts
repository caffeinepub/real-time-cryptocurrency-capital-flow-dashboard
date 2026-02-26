import { useState, useEffect, useCallback } from 'react';
import {
  BinanceWebSocketClient,
  TickerData,
  ConnectionStatus,
  WHITELISTED_SYMBOLS,
  fetchTickerREST,
} from '../lib/binanceService';

// Module-level cache so data persists across remounts
const tickerCache: Record<string, TickerData> = {};
let globalStatus: ConnectionStatus = 'loading';
const statusListeners: Set<(s: ConnectionStatus) => void> = new Set();
const tickerListeners: Set<(t: Record<string, TickerData>) => void> = new Set();

function notifyStatus(s: ConnectionStatus) {
  globalStatus = s;
  statusListeners.forEach((fn) => fn(s));
}

function notifyTickers(t: Record<string, TickerData>) {
  tickerListeners.forEach((fn) => fn({ ...t }));
}

let wsClient: BinanceWebSocketClient | null = null;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function startPolling() {
  if (pollInterval) return;
  notifyStatus('polling');
  const poll = async () => {
    try {
      const results = await Promise.allSettled(
        WHITELISTED_SYMBOLS.map((sym) => fetchTickerREST(sym))
      );
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          const sym = WHITELISTED_SYMBOLS[i];
          tickerCache[sym] = {
            ...r.value,
            lastPrice: round2(r.value.lastPrice),
            priceChangePercent: round2(r.value.priceChangePercent),
          };
        }
      });
      notifyTickers(tickerCache);
    } catch {
      // silent
    }
  };
  await poll();
  pollInterval = setInterval(poll, 15_000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function initGlobalConnection() {
  if (initialized) return;
  initialized = true;

  try {
    wsClient = new BinanceWebSocketClient(WHITELISTED_SYMBOLS);

    wsClient.onStatusChange((status) => {
      notifyStatus(status);
      if (status === 'disconnected') {
        stopPolling();
        startPolling();
      } else if (status === 'connected') {
        stopPolling();
      }
    });

    wsClient.onTicker((sym, data) => {
      tickerCache[sym] = {
        ...data,
        lastPrice: round2(data.lastPrice),
        priceChangePercent: round2(data.priceChangePercent),
      };
      notifyTickers(tickerCache);
    });

    wsClient.connect();
  } catch {
    startPolling();
  }
}

// ─── Compatibility helpers ────────────────────────────────────────────────────
// Convert the tickers map to the legacy LiveMarketData array shape so that
// existing consumers (useQueries, useBubbleAssets, etc.) keep working without
// changes to their destructuring.
export interface LiveMarketData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  lastUpdate: number;
}

function tickersToArray(tickers: Record<string, TickerData>): LiveMarketData[] {
  return Object.values(tickers).map((t) => ({
    symbol: t.symbol,
    price: t.lastPrice,
    priceChange: 0,
    priceChangePercent: t.priceChangePercent,
    volume: t.volume,
    quoteVolume: t.quoteVolume,
    lastUpdate: t.closeTime,
  }));
}

export interface UseBinanceDataReturn {
  /** New API: keyed by symbol */
  tickers: Record<string, TickerData>;
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
  /** Legacy API: array of market data (kept for backward compat) */
  marketData: LiveMarketData[];
  isLive: boolean;
  hasData: boolean;
  /** Legacy single-symbol lookup */
  getMarketData: (symbol: string) => LiveMarketData | null;
  lastUpdateTime: number;
}

export function useBinanceData(): UseBinanceDataReturn {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({ ...tickerCache });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(globalStatus);

  useEffect(() => {
    initGlobalConnection();

    const onStatus = (s: ConnectionStatus) => setConnectionStatus(s);
    const onTicker = (t: Record<string, TickerData>) => setTickers(t);

    statusListeners.add(onStatus);
    tickerListeners.add(onTicker);

    // Sync current state immediately
    setConnectionStatus(globalStatus);
    setTickers({ ...tickerCache });

    return () => {
      statusListeners.delete(onStatus);
      tickerListeners.delete(onTicker);
    };
  }, []);

  const reconnect = useCallback(() => {
    if (wsClient) {
      wsClient.disconnect?.();
      wsClient = null;
    }
    stopPolling();
    initialized = false;
    initGlobalConnection();
  }, []);

  const marketData = tickersToArray(tickers);
  const isLive = connectionStatus === 'connected';
  const hasData = Object.keys(tickers).length > 0;

  const getMarketData = useCallback(
    (symbol: string): LiveMarketData | null => {
      const t = tickers[symbol];
      if (!t) return null;
      return {
        symbol: t.symbol,
        price: t.lastPrice,
        priceChange: 0,
        priceChangePercent: t.priceChangePercent,
        volume: t.volume,
        quoteVolume: t.quoteVolume,
        lastUpdate: t.closeTime,
      };
    },
    [tickers]
  );

  return {
    tickers,
    connectionStatus,
    reconnect,
    marketData,
    isLive,
    hasData,
    getMarketData,
    lastUpdateTime: Date.now(),
  };
}
