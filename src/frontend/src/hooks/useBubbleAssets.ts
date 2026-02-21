import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useBinanceData } from './useBinanceData';
import type { BubbleAsset } from '../backend';
import { roundToTwoDecimals } from '../lib/formatters';
import { symbolsMatch } from '../lib/symbols';

export interface EnrichedBubbleAsset extends BubbleAsset {
  livePrice?: number;
  priceChange?: number;
  volume?: number;
}

export interface BubbleAssetsQueryResult {
  assets: EnrichedBubbleAsset[];
  backendCount: number;
  hasBackendData: boolean;
}

export function useBubbleAssets() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();

  return useQuery<BubbleAssetsQueryResult>({
    queryKey: ['bubbleAssets'],
    queryFn: async () => {
      if (!actor) {
        return { assets: [], backendCount: 0, hasBackendData: false };
      }

      try {
        const result = await actor.getBubbleAssets();
        const bubbleAssets = result.bubbleAssets;
        const backendCount = Number(result.count);

        console.log(`[Bubble Assets] Backend returned ${backendCount} assets`);

        // If backend has no assets but we have live market data, create synthetic bubbles
        if (bubbleAssets.length === 0 && marketData.length > 0) {
          console.log('[Bubble Assets] No backend data, creating synthetic bubbles from live market data');
          
          // Create synthetic bubble assets from top market movers
          const syntheticAssets: EnrichedBubbleAsset[] = marketData
            .filter(m => Math.abs(m.priceChangePercent) > 1) // Only significant movers
            .slice(0, 15) // Limit to top 15
            .map(m => {
              const absChange = Math.abs(m.priceChangePercent);
              const trend = m.priceChangePercent > 0 ? 'bullish' : m.priceChangePercent < 0 ? 'bearish' : 'neutral';
              
              // Calculate synthetic convergence metrics based on price movement and volume
              const flowIntensity = roundToTwoDecimals(Math.min(100, absChange * 5));
              const confluenceIntensity = roundToTwoDecimals(Math.min(100, (m.volume / 1000000) * 10));
              const confidenceLevel = roundToTwoDecimals(Math.min(100, absChange * 3 + 50));

              return {
                symbol: m.symbol,
                name: m.symbol.replace('USDT', ''),
                price: roundToTwoDecimals(m.price),
                flowIntensity,
                confluenceIntensity,
                trend,
                confidenceLevel,
                livePrice: roundToTwoDecimals(m.price),
                priceChange: roundToTwoDecimals(m.priceChangePercent),
                volume: roundToTwoDecimals(m.volume),
              };
            });

          console.log(`[Bubble Assets] Created ${syntheticAssets.length} synthetic bubbles`);
          return { 
            assets: syntheticAssets, 
            backendCount: 0, 
            hasBackendData: false 
          };
        }

        // Enrich backend assets with live Binance data
        if (marketData.length > 0 && bubbleAssets.length > 0) {
          const enrichedAssets = bubbleAssets.map(asset => {
            const liveData = marketData.find(m => symbolsMatch(m.symbol, asset.symbol));
            if (liveData) {
              return {
                ...asset,
                livePrice: roundToTwoDecimals(liveData.price),
                priceChange: roundToTwoDecimals(liveData.priceChangePercent),
                volume: roundToTwoDecimals(liveData.volume),
                price: roundToTwoDecimals(liveData.price),
              };
            }
            return asset;
          });

          return { 
            assets: enrichedAssets, 
            backendCount, 
            hasBackendData: true 
          };
        }

        return { 
          assets: bubbleAssets, 
          backendCount, 
          hasBackendData: bubbleAssets.length > 0 
        };
      } catch (error) {
        console.error('[Bubble Assets] Error fetching bubble assets:', error);
        return { assets: [], backendCount: 0, hasBackendData: false };
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 5000 : 10000,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });
}
