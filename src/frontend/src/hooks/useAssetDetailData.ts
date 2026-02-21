import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useBinanceData } from './useBinanceData';
import type { CapitalFlow, ConfluenceZone } from '../backend';
import type { EnrichedBubbleAsset } from './useBubbleAssets';
import { symbolsMatch } from '../lib/symbols';

export interface AssetDetailData {
  asset: EnrichedBubbleAsset;
  capitalFlow?: CapitalFlow;
  confluenceZone?: ConfluenceZone;
  livePrice?: number;
  volume?: number;
  priceChange?: number;
}

export function useAssetDetailData(asset: EnrichedBubbleAsset | null) {
  const { actor, isFetching } = useActor();
  const { marketData } = useBinanceData();

  return useQuery<AssetDetailData | null>({
    queryKey: ['assetDetail', asset?.symbol],
    queryFn: async () => {
      if (!actor || !asset) return null;

      try {
        let capitalFlow: CapitalFlow | undefined;
        let confluenceZone: ConfluenceZone | undefined;

        // Fetch capital flow
        try {
          capitalFlow = await actor.getCapitalFlow(asset.symbol);
        } catch (err) {
          // Capital flow might not exist for this asset
        }

        // Fetch confluence zone
        try {
          confluenceZone = await actor.getConfluenceZone(asset.symbol);
        } catch (err) {
          // Confluence zone might not exist for this asset
        }

        // Get live market data
        const liveData = marketData.find(m => symbolsMatch(m.symbol, asset.symbol));

        return {
          asset,
          capitalFlow,
          confluenceZone,
          livePrice: liveData?.price,
          volume: liveData?.volume,
          priceChange: liveData?.priceChangePercent,
        };
      } catch (error) {
        console.error('Error fetching asset detail data:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!asset,
    staleTime: 5000,
  });
}
