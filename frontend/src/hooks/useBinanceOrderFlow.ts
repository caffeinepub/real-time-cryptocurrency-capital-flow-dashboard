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
import {
  generateOrderFlowFingerprint,
  fingerprintsEqual,
  OrderFlowFingerprint,
} from '../lib/orderFlowFingerprint';

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

  // Use refs to track state without causing re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFingerprintRef = useRef<OrderFlowFingerprint | null>(null);
  const isInitialLoadRef = useRef(true);
  const isManualRefetchRef = useRef(false);

  const fetchData = async (isManualRefetch: boolean = false) => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Only show loading for initial load or manual refetch
    if (isInitialLoadRef.current || isManualRefetch) {
      setIsLoading(true);
    }

    // Clear error only on manual refetch or initial load
    if (isInitialLoadRef.current || isManualRefetch) {
      setError(null);
    }

    try {
      // Fetch all data in parallel
      const [ticker, trades, book] = await Promise.all([
        fetch24hTicker(DEFAULT_SYMBOL, market, signal),
        fetchRecentTrades(DEFAULT_SYMBOL, market, 100, signal),
        fetchBookTicker(DEFAULT_SYMBOL, market, signal),
      ]);

      // Validate that we have at least some data
      if (!ticker && trades.length === 0 && !book) {
        throw new Error('No data available from Binance API');
      }

      const newData: OrderFlowData = {
        ticker,
        recentTrades: trades,
        bookTicker: book,
      };

      // Generate fingerprint
      const newFingerprint = generateOrderFlowFingerprint(newData);

      // Only update state if data has meaningfully changed
      if (!fingerprintsEqual(lastFingerprintRef.current, newFingerprint)) {
        setData(newData);
        setLastUpdated(Date.now());
        lastFingerprintRef.current = newFingerprint;
      }

      // Clear error on successful fetch
      setError(null);
      isInitialLoadRef.current = false;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching order flow data:', err);
        // Only set error on initial load or manual refetch
        if (isInitialLoadRef.current || isManualRefetch) {
          setError(err.message || 'Error fetching order flow data');
        }
      }
    } finally {
      // Only clear loading for initial load or manual refetch
      if (isInitialLoadRef.current || isManualRefetch) {
        setIsLoading(false);
      }
    }
  };

  // Manual refetch function
  const refetch = () => {
    isManualRefetchRef.current = true;
    fetchData(true);
    isManualRefetchRef.current = false;
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!enabled) {
      // When disabled, stop polling but keep existing data
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Reset initial load flag when re-enabling
    if (!data) {
      isInitialLoadRef.current = true;
    }

    fetchData(false);

    if (pollingInterval > 0) {
      intervalRef.current = setInterval(() => fetchData(false), pollingInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [market, pollingInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch,
  };
}
