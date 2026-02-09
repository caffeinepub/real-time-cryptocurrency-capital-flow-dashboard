import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useHasBinanceCredentials } from './useBinanceFuturesMonitor';
import { useInternetIdentity } from './useInternetIdentity';
import type { NormalizedFuturesPosition } from '../backend';

export function useOpenFuturesPositions(enablePolling: boolean = false) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: hasCredentials } = useHasBinanceCredentials();

  const isAuthenticated = !!identity;
  const canFetch = isAuthenticated && hasCredentials;

  return useQuery<NormalizedFuturesPosition[]>({
    queryKey: ['openFuturesPositions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const positions = await actor.getOpenFuturesPositions();
        return positions;
      } catch (error: any) {
        // Map backend errors to actionable English messages
        const errorMessage = error.message || String(error);
        
        if (errorMessage.includes('No Binance credentials')) {
          throw new Error('Please configure your Binance API credentials to view positions.');
        }
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('Authentication required. Please log in to continue.');
        }
        
        if (errorMessage.includes('Binance') || errorMessage.includes('API')) {
          throw new Error('Failed to fetch positions from Binance. Please check your credentials and try again.');
        }
        
        throw new Error('Failed to load positions. Please try again later.');
      }
    },
    enabled: !!actor && !actorFetching && canFetch,
    retry: 1,
    refetchInterval: enablePolling && canFetch ? 10000 : false, // Poll every 10 seconds when enabled
    refetchOnWindowFocus: true,
  });
}
