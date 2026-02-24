import { useQuery } from '@tanstack/react-query';
import { fetchKlinesWithRetry, type KlineData } from '../lib/binanceHistoricalService';

export interface UseBinanceHistoricalDataOptions {
  symbol: string;
  interval?: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * React Query hook for fetching historical candlestick data from Binance
 */
export function useBinanceHistoricalData({
  symbol,
  interval = '4h',
  limit = 100,
  enabled = true,
}: UseBinanceHistoricalDataOptions) {
  return useQuery<KlineData[], Error>({
    queryKey: ['binanceHistorical', symbol, interval, limit],
    queryFn: () => fetchKlinesWithRetry(symbol, interval, limit),
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
