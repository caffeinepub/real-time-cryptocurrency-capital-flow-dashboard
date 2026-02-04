import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useBinanceData } from './useBinanceData';
import type { 
  CapitalFlow, 
  PredictiveProjection, 
  ConfluenceZone, 
  CryptoAsset, 
  RecoveryAsset,
  Region,
  RegionalFlow,
  InstitutionalAlert,
  RegionalCorrelation,
  ModelPerformance,
  PerformanceSummary,
  ConfidenceMetrics,
  PredictionOutcome,
  RegionalMetric
} from '../backend';
import { roundToTwoDecimals } from '../lib/formatters';
import { normalizeToQuoteSymbol, symbolsMatch, WHITELISTED_SYMBOLS } from '../lib/symbols';

export interface PredictionWithLivePrice {
  symbol: string;
  prediction: PredictiveProjection | null;
  livePrice: number;
  priceChange: number;
}

export interface EnrichedRegionalData {
  regionId: number;
  name: string;
  coordinates: [number, number];
  intensity: number;
  volume: number;
  capitalFlow: number;
  flowRatio: number;
  // Enriched institutional metrics
  institutionalFlowIntensity: number;
  fundingBias: number;
  aggregatedInterestTrend: number;
  openInterest: number;
  fundingRate: number;
  exchangeVolume: number;
  timestamp: bigint;
}

export function useCapitalFlows() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();

  return useQuery<CapitalFlow[]>({
    queryKey: ['capitalFlows'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const flows = await actor.getAllFlows();
        
        // Enhance flows with live Binance data
        if (marketData.length > 0 && flows.length > 0) {
          return flows.map(flow => {
            const liveData = marketData.find(m => symbolsMatch(m.symbol, flow.toAsset.symbol));
            if (liveData) {
              return {
                ...flow,
                toAsset: {
                  ...flow.toAsset,
                  usdValue: roundToTwoDecimals(liveData.price),
                },
                flowIntensity: roundToTwoDecimals(Math.min(1, Math.abs(liveData.priceChangePercent) / 10)),
              };
            }
            return flow;
          });
        }
        
        return flows;
      } catch (error) {
        console.error('Error fetching capital flows:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 3000 : 10000,
    staleTime: 2000,
    placeholderData: (previousData) => previousData,
  });
}

export function usePredictiveProjections() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();

  return useQuery<PredictiveProjection[]>({
    queryKey: ['predictiveProjections'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Fetch projections for each whitelisted symbol
        const projections: PredictiveProjection[] = [];
        
        for (const symbol of WHITELISTED_SYMBOLS) {
          try {
            const projection = await actor.getPredictiveProjection(symbol);
            projections.push(projection);
          } catch (err) {
            // Projection might not exist for this symbol, continue
          }
        }
        
        // Enhance projections with live Binance data using symbol matching
        if (marketData.length > 0 && projections.length > 0) {
          return projections.map(proj => {
            // Match using normalized symbols
            const liveData = marketData.find(m => symbolsMatch(m.symbol, proj.asset.symbol));
            if (liveData) {
              // Determine trend based on price change
              let trend = proj.trend;
              if (liveData.priceChangePercent > 2) {
                trend = 'Alta';
              } else if (liveData.priceChangePercent < -2) {
                trend = 'Baixa';
              } else {
                trend = 'Neutro';
              }
              
              return {
                ...proj,
                asset: {
                  ...proj.asset,
                  usdValue: roundToTwoDecimals(liveData.price),
                },
                trend,
                confidenceLevel: roundToTwoDecimals(Math.min(0.95, Math.abs(liveData.priceChangePercent) / 5)),
              };
            }
            return proj;
          });
        }
        
        return projections;
      } catch (error) {
        console.error('Error fetching predictive projections:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 5000 : 15000,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });
}

export function useConfluenceZones() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();

  return useQuery<ConfluenceZone[]>({
    queryKey: ['confluenceZones'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Fetch confluence zones for each whitelisted symbol
        const zones: ConfluenceZone[] = [];
        
        for (const symbol of WHITELISTED_SYMBOLS) {
          try {
            const zone = await actor.getConfluenceZone(symbol);
            zones.push(zone);
          } catch (err) {
            // Zone might not exist for this symbol, continue
          }
        }
        
        // Enhance zones with live market volatility
        if (marketData.length > 0 && zones.length > 0) {
          return zones.map(zone => {
            // Calculate average volatility from market data
            const avgVolatility = marketData.reduce((sum, m) => 
              sum + Math.abs(m.priceChangePercent), 0) / marketData.length;
            
            return {
              ...zone,
              intensity: roundToTwoDecimals(Math.min(1, zone.intensity * (1 + avgVolatility / 100))),
            };
          });
        }
        
        return zones;
      } catch (error) {
        console.error('Error fetching confluence zones:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 4000 : 12000,
    staleTime: 2500,
    placeholderData: (previousData) => previousData,
  });
}

export function useRecoveryAssets() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();

  return useQuery<RecoveryAsset[]>({
    queryKey: ['recoveryAssets'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Fetch recovery assets for each whitelisted symbol
        const assets: RecoveryAsset[] = [];
        
        for (const symbol of WHITELISTED_SYMBOLS) {
          try {
            const asset = await actor.getRecoveryAsset(symbol);
            assets.push(asset);
          } catch (err) {
            // Asset might not exist for this symbol, continue
          }
        }
        
        // Enhance recovery assets with live Binance data
        if (marketData.length > 0 && assets.length > 0) {
          return assets.map(asset => {
            const liveData = marketData.find(m => symbolsMatch(m.symbol, asset.symbol));
            if (liveData) {
              // Adjust recovery strength based on live price change
              const priceChangeBoost = liveData.priceChangePercent > 0 ? 
                Math.min(0.2, liveData.priceChangePercent / 50) : 0;
              
              return {
                ...asset,
                recoveryStrength: roundToTwoDecimals(Math.min(1, asset.recoveryStrength + priceChangeBoost)),
                volume: roundToTwoDecimals(liveData.volume || asset.volume),
              };
            }
            return asset;
          });
        }
        
        return assets;
      } catch (error) {
        console.error('Error fetching recovery assets:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 5000 : 15000,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });
}

// Regional Flow Queries
export function useRegions() {
  const { actor, isFetching } = useActor();

  return useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Fetch regions by known IDs
        const regionIds = [1, 2, 3, 4, 5, 6];
        const regions: Region[] = [];
        
        for (const id of regionIds) {
          try {
            const region = await actor.getRegion(BigInt(id));
            regions.push(region);
          } catch (err) {
            // Region might not exist, continue
          }
        }
        
        return regions;
      } catch (error) {
        console.error('Error fetching regions:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useRegionalFlows() {
  const { actor, isFetching } = useActor();

  return useQuery<RegionalFlow[]>({
    queryKey: ['regionalFlows'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        // Mock regional flows since backend doesn't have getRegionalFlow
        // In production, this would fetch from backend
        return [];
      } catch (error) {
        console.error('Error fetching regional flows:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

export function useInstitutionalAlerts() {
  const { actor, isFetching } = useActor();

  return useQuery<InstitutionalAlert[]>({
    queryKey: ['institutionalAlerts'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const alerts = await actor.getInstitutionalAlerts();
        // Sort by timestamp descending (most recent first)
        return alerts.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      } catch (error) {
        console.error('Error fetching institutional alerts:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
    staleTime: 2000,
  });
}

export function useRegionalCorrelations() {
  const { actor, isFetching } = useActor();

  return useQuery<RegionalCorrelation[]>({
    queryKey: ['regionalCorrelations'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const correlations = await actor.getRegionalCorrelations();
        return correlations;
      } catch (error) {
        console.error('Error fetching regional correlations:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 8000,
    staleTime: 5000,
  });
}

// New hook to fetch enriched regional data with institutional metrics
export function useEnrichedRegionalData() {
  const { actor, isFetching } = useActor();
  const { data: regions = [] } = useRegions();

  return useQuery<EnrichedRegionalData[]>({
    queryKey: ['enrichedRegionalData', regions.length],
    queryFn: async () => {
      if (!actor || regions.length === 0) return [];
      
      try {
        const enrichedData: EnrichedRegionalData[] = [];
        
        for (const region of regions) {
          const regionId = Number(region.regionId);
          
          // Fetch institutional metrics from backend
          let openInterestMetric: RegionalMetric | null = null;
          let fundingRateMetric: RegionalMetric | null = null;
          let exchangeVolumeMetric: RegionalMetric | null = null;
          
          try {
            openInterestMetric = await actor.getRegionalMetric(BigInt(regionId), 'openInterest');
          } catch (err) {
            // Metric might not exist
          }
          
          try {
            fundingRateMetric = await actor.getRegionalMetric(BigInt(regionId), 'fundingRate');
          } catch (err) {
            // Metric might not exist
          }
          
          try {
            exchangeVolumeMetric = await actor.getRegionalMetric(BigInt(regionId), 'exchangeVolume');
          } catch (err) {
            // Metric might not exist
          }
          
          // Calculate enriched metrics
          const openInterest = openInterestMetric ? openInterestMetric.value : 0;
          const fundingRate = fundingRateMetric ? fundingRateMetric.value : 0;
          const exchangeVolume = exchangeVolumeMetric ? exchangeVolumeMetric.value : 0;
          
          // Calculate institutional flow intensity (normalized 0-1)
          const institutionalFlowIntensity = roundToTwoDecimals(
            Math.min(1, (openInterest / 1000000) * 0.4 + (exchangeVolume / 5000000) * 0.6)
          );
          
          // Calculate funding bias (-1 to 1, negative = bearish, positive = bullish)
          const fundingBias = roundToTwoDecimals(
            Math.max(-1, Math.min(1, fundingRate * 100))
          );
          
          // Calculate aggregated interest trend (0-1)
          const aggregatedInterestTrend = roundToTwoDecimals(
            Math.min(1, (openInterest / 800000) * 0.5 + region.intensity * 0.5)
          );
          
          enrichedData.push({
            regionId,
            name: region.name,
            coordinates: region.coordinates,
            intensity: region.intensity,
            volume: region.volume,
            capitalFlow: region.capitalFlow,
            flowRatio: region.flowRatio,
            institutionalFlowIntensity,
            fundingBias,
            aggregatedInterestTrend,
            openInterest: roundToTwoDecimals(openInterest),
            fundingRate: roundToTwoDecimals(fundingRate),
            exchangeVolume: roundToTwoDecimals(exchangeVolume),
            timestamp: region.timestamp,
          });
        }
        
        return enrichedData;
      } catch (error) {
        console.error('Error fetching enriched regional data:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && regions.length > 0,
    refetchInterval: 8000,
    staleTime: 5000,
  });
}

// Performance Preditiva Queries with Binance Integration
export function useModelPerformances(symbol: string) {
  const { actor, isFetching } = useActor();
  const { getMarketData } = useBinanceData();

  return useQuery<ModelPerformance[]>({
    queryKey: ['modelPerformances', symbol],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const performances = await actor.getAllModelPerformances(symbol);
        
        // Enhance with real-time Binance data
        const liveData = getMarketData(normalizeToQuoteSymbol(symbol));
        if (liveData && performances.length > 0) {
          return performances.map(perf => ({
            ...perf,
            // Update predictions with current market price as actual value
            predictions: perf.predictions.map(pred => ({
              ...pred,
              actualValue: roundToTwoDecimals(liveData.price),
            })),
          }));
        }
        
        return performances;
      } catch (error) {
        console.error('Error fetching model performances:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function usePerformanceSummaries() {
  const { actor, isFetching } = useActor();
  const { marketData } = useBinanceData();

  return useQuery<PerformanceSummary[]>({
    queryKey: ['performanceSummaries', marketData.length],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ICPUSDT'];
        const summaries: PerformanceSummary[] = [];
        
        for (const symbol of symbols) {
          try {
            const summary = await actor.getPerformanceSummary(symbol);
            summaries.push(summary);
          } catch (err) {
            console.error(`Error fetching summary for ${symbol}:`, err);
          }
        }
        
        return summaries;
      } catch (error) {
        console.error('Error fetching performance summaries:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function usePerformanceMetrics(symbol: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ConfidenceMetrics>({
    queryKey: ['performanceMetrics', symbol],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const metrics = await actor.getConfidenceMetrics(symbol);
        return metrics;
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 12000,
    staleTime: 8000,
  });
}

// New hook to get prediction outcomes with real-time Binance prices
export function usePredictionOutcomes(symbol: string) {
  const { actor, isFetching } = useActor();
  const { getMarketData } = useBinanceData();

  return useQuery<PredictionOutcome[]>({
    queryKey: ['predictionOutcomes', symbol],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const outcomes = await actor.getPredictionOutcomes(symbol);
        
        // Update with current market price
        const liveData = getMarketData(normalizeToQuoteSymbol(symbol));
        if (liveData && outcomes.length > 0) {
          return outcomes.map(outcome => ({
            ...outcome,
            actualValue: roundToTwoDecimals(liveData.price),
          }));
        }
        
        return outcomes;
      } catch (error) {
        console.error('Error fetching prediction outcomes:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 8000,
    staleTime: 5000,
  });
}

// New hook to merge predictions with real-time prices
export function usePredictionsWithLivePrices() {
  const { actor, isFetching } = useActor();
  const { marketData } = useBinanceData();

  return useQuery<PredictionWithLivePrice[]>({
    queryKey: ['predictionsWithLivePrices', marketData.length],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ICPUSDT'];
        const results: PredictionWithLivePrice[] = [];
        
        for (const symbol of symbols) {
          const liveData = marketData.find(m => m.symbol === symbol);
          let prediction: PredictiveProjection | null = null;
          
          try {
            prediction = await actor.getPredictiveProjection(symbol);
          } catch (err) {
            // Prediction might not exist
          }
          
          results.push({
            symbol,
            prediction,
            livePrice: liveData ? roundToTwoDecimals(liveData.price) : 0,
            priceChange: liveData ? roundToTwoDecimals(liveData.priceChangePercent) : 0,
          });
        }
        
        return results;
      } catch (error) {
        console.error('Error fetching predictions with live prices:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && marketData.length > 0,
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

// Mutation to sync live Binance data to backend
export function useSyncBinanceData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, price, volume }: { symbol: string; price: number; volume: number }) => {
      if (!actor) throw new Error('Actor not initialized');

      const usdAsset: CryptoAsset = {
        symbol: 'USD',
        name: 'US Dollar',
        usdValue: 1.0,
      };

      const cryptoAsset: CryptoAsset = {
        symbol: symbol.replace('USDT', ''),
        name: symbol.replace('USDT', ''),
        usdValue: roundToTwoDecimals(price),
      };

      const intensity = roundToTwoDecimals(Math.min(1, volume / 1000000));

      await actor.addCapitalFlow(
        symbol,
        usdAsset,
        cryptoAsset,
        volume,
        intensity,
        0,
        0
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capitalFlows'] });
    },
  });
}
