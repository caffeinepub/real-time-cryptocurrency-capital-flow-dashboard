import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';

export function useHasBinanceCredentials() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasBinanceCredentials'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.hasBinanceCredentials();
      } catch (error) {
        console.error('Error checking credentials:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddOrUpdateBinanceCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ apiKey, apiSecret }: { apiKey: string; apiSecret: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addOrUpdateBinanceCredentials(apiKey, apiSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasBinanceCredentials'] });
    },
    onError: (error: any) => {
      throw new Error(error.message || 'Failed to save credentials');
    },
  });
}

export function useRemoveBinanceCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeBinanceCredentials();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasBinanceCredentials'] });
    },
    onError: (error: any) => {
      throw new Error(error.message || 'Failed to remove credentials');
    },
  });
}

export function useTestBinanceConnection() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.testBinanceConnection();
      return result;
    },
    onError: (error: any) => {
      throw new Error(error.message || 'Connection test failed');
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      throw new Error(error.message || 'Failed to save profile');
    },
  });
}
