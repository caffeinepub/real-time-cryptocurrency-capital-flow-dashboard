import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BinanceWebSocketClient, 
  BinanceTickerData, 
  BinanceConnectionStatus,
  WHITELISTED_SYMBOLS,
  fetchBinancePrices 
} from '../lib/binanceService';
import { roundToTwoDecimals } from '../lib/formatters';

export interface LiveMarketData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  lastUpdate: number;
}

// Module-level cache for stable data across remounts
let cachedMarketData: Map<string, LiveMarketData> = new Map();
let lastCacheUpdate: number = 0;

export function useBinanceData() {
  const [marketData, setMarketData] = useState<Map<string, LiveMarketData>>(cachedMarketData);
  const [connectionStatus, setConnectionStatus] = useState<BinanceConnectionStatus>('disconnected');
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(lastCacheUpdate);
  const wsClientRef = useRef<BinanceWebSocketClient | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleTickerUpdate = useCallback((data: BinanceTickerData) => {
    const newData: LiveMarketData = {
      symbol: data.symbol,
      price: roundToTwoDecimals(parseFloat(data.price)),
      priceChange: roundToTwoDecimals(parseFloat(data.priceChange)),
      priceChangePercent: roundToTwoDecimals(parseFloat(data.priceChangePercent)),
      volume: roundToTwoDecimals(parseFloat(data.volume)),
      quoteVolume: roundToTwoDecimals(parseFloat(data.quoteVolume)),
      lastUpdate: data.lastUpdateId,
    };

    // Update both local and module-level cache
    setMarketData(prev => {
      const newMap = new Map(prev);
      newMap.set(data.symbol, newData);
      cachedMarketData = newMap;
      return newMap;
    });
    
    const now = Date.now();
    setLastUpdateTime(now);
    lastCacheUpdate = now;
  }, []);

  const handleStatusChange = useCallback((status: BinanceConnectionStatus) => {
    setConnectionStatus(status);
    
    // If connection fails, start fallback polling
    if (status === 'error' || status === 'disconnected') {
      startFallbackPolling();
    } else if (status === 'connected') {
      stopFallbackPolling();
    }
  }, []);

  const startFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) return;

    console.log('Starting fallback REST API polling...');
    
    const pollPrices = async () => {
      try {
        const prices = await fetchBinancePrices([...WHITELISTED_SYMBOLS]);
        
        if (prices.size > 0) {
          setMarketData(prev => {
            const newMap = new Map(prev);
            prices.forEach((price, symbol) => {
              const existing = newMap.get(symbol);
              const newData: LiveMarketData = {
                symbol,
                price: roundToTwoDecimals(price),
                priceChange: existing?.priceChange || 0,
                priceChangePercent: existing?.priceChangePercent || 0,
                volume: existing?.volume || 0,
                quoteVolume: existing?.quoteVolume || 0,
                lastUpdate: Date.now(),
              };
              newMap.set(symbol, newData);
            });
            cachedMarketData = newMap;
            return newMap;
          });
          const now = Date.now();
          setLastUpdateTime(now);
          lastCacheUpdate = now;
        }
      } catch (error) {
        console.error('Fallback polling error:', error);
      }
    };

    // Initial fetch
    pollPrices();
    
    // Poll every 5 seconds
    fallbackIntervalRef.current = setInterval(pollPrices, 5000);
  }, []);

  const stopFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
      console.log('Stopped fallback polling');
    }
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection
    const client = new BinanceWebSocketClient(
      [...WHITELISTED_SYMBOLS],
      handleTickerUpdate,
      handleStatusChange
    );

    wsClientRef.current = client;
    client.connect();

    // Cleanup on unmount
    return () => {
      client.disconnect();
      stopFallbackPolling();
    };
  }, [handleTickerUpdate, handleStatusChange, stopFallbackPolling]);

  const getMarketData = useCallback((symbol: string): LiveMarketData | null => {
    return marketData.get(symbol) || null;
  }, [marketData]);

  const getAllMarketData = useCallback((): LiveMarketData[] => {
    return Array.from(marketData.values());
  }, [marketData]);

  const isLive = connectionStatus === 'connected';
  const hasData = marketData.size > 0;

  return {
    marketData: getAllMarketData(),
    getMarketData,
    connectionStatus,
    isLive,
    hasData,
    lastUpdateTime,
  };
}
