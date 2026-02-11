/**
 * React hook for Binance Order Flow data
 * Manages polling and state for order flow analysis
 * 
 * CONTRACT: This hook performs ONLY public market data fetching.
 * It does NOT depend on Binance credentials and must never read/send API keys.
 */

import { useState, useEffect, useRef } from 'react';
import {
  fetch24hTicker,
  fetchRecentTrades,
  fetchBookTicker,
  MarketType,
  Ticker24h,
  RecentTrade,
  BookTicker,
} from '../lib/binanceOrderFlowRest';

export interface OrderFlowData {
  ticker: Ticker24h | null;
  recentTrades: RecentTrade[];
  bookTicker: BookTicker | null;
}

export interface UseOrderFlowOptions {
  market: MarketType;
  pollingInterval?: number;
  enabled?: boolean;
}

export interface UseOrderFlowResult {
  data: OrderFlowData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refetch: () => void;
}

const DEFAULT_SYMBOL = 'BTCUSDT';

export function useBinanceOrderFlow(options: UseOrderFlowOptions): UseOrderFlowResult {
  const { market, pollingInterval = 3000, enabled = true } = options;

  const [data, setData] = useState<OrderFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [ticker, trades, book] = await Promise.all([
        fetch24hTicker(DEFAULT_SYMBOL, market, signal),
        fetchRecentTrades(DEFAULT_SYMBOL, market, 100, signal),
        fetchBookTicker(DEFAULT_SYMBOL, market, signal),
      ]);

      // Validate that we have at least some data
      if (!ticker && trades.length === 0 && !book) {
        throw new Error('Nenhum dado disponível da API Binance');
      }

      setData({
        ticker,
        recentTrades: trades,
        bookTicker: book,
      });
      setLastUpdated(Date.now());
      setError(null);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching order flow data:', err);
        setError(err.message || 'Erro ao buscar dados de fluxo de ordens');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      return;
    }

    fetchData();

    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchData, pollingInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [market, pollingInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}
