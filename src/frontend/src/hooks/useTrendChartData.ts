import { useMemo } from "react";
import type { KlineData } from "../lib/binanceHistoricalService";
import { useBinanceHistoricalData } from "./useBinanceHistoricalData";

export interface TrendChartDataPoint {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UseTrendChartDataResult {
  data: TrendChartDataPoint[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook that manages trend chart data fetching and transformation
 */
export function useTrendChartData(symbol: string): UseTrendChartDataResult {
  const {
    data: klineData,
    isLoading,
    isError,
    error,
  } = useBinanceHistoricalData({
    symbol,
    interval: "4h",
    limit: 100,
    enabled: !!symbol,
  });

  const chartData = useMemo(() => {
    if (!klineData || klineData.length === 0) {
      return undefined;
    }

    return klineData.map((kline: KlineData) => ({
      timestamp: kline.timestamp,
      date: new Date(kline.timestamp).toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      }),
      open: kline.open,
      high: kline.high,
      low: kline.low,
      close: kline.close,
      volume: kline.volume,
    }));
  }, [klineData]);

  return {
    data: chartData,
    isLoading,
    isError,
    error,
  };
}
