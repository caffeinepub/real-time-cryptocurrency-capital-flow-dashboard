import { useState, useEffect } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PredictiveProjection } from '../backend';

export interface ProjectionsSyncState {
  isReady: boolean;
  isSyncing: boolean;
  hasNoMarketData: boolean;
  syncMessage: string;
}

interface SyncGateOptions {
  binanceHasData: boolean;
  binanceIsLive: boolean;
  backendQuery: UseQueryResult<PredictiveProjection[], Error>;
  syncTimeoutMs?: number;
  noDataTimeoutMs?: number;
}

/**
 * Hook that computes synchronization state for Projections module
 * Blocks rendering until both Binance and backend are ready
 */
export function useProjectionsSyncGate({
  binanceHasData,
  binanceIsLive,
  backendQuery,
  syncTimeoutMs = 8000,
  noDataTimeoutMs = 15000,
}: SyncGateOptions): ProjectionsSyncState {
  const [syncStartTime] = useState(Date.now());
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [hasNoDataTimeout, setHasNoDataTimeout] = useState(false);

  // Track sync timeout (backend not settling)
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, syncTimeoutMs);

    return () => clearTimeout(timer);
  }, [syncTimeoutMs]);

  // Track no-data timeout (Binance never produces data)
  useEffect(() => {
    if (!binanceHasData) {
      const timer = setTimeout(() => {
        setHasNoDataTimeout(true);
      }, noDataTimeoutMs);

      return () => clearTimeout(timer);
    }
  }, [binanceHasData, noDataTimeoutMs]);

  // Compute sync state
  const binanceReady = binanceHasData;
  const backendSettled = !backendQuery.isLoading && (backendQuery.isSuccess || backendQuery.isError);
  
  // Ready conditions:
  // 1. Both Binance and backend are ready
  // 2. Binance is ready and backend timed out (fall back to synthetic)
  // 3. Backend is ready but Binance has no data yet (use backend data if available)
  const isReady = 
    (binanceReady && backendSettled) ||
    (binanceReady && hasTimedOut) ||
    (backendSettled && backendQuery.isSuccess && (backendQuery.data?.length ?? 0) > 0);

  const isSyncing = !isReady && !hasNoDataTimeout;
  const hasNoMarketData = hasNoDataTimeout && !binanceHasData;

  // Compute sync message
  let syncMessage = 'Sincronizando dados...';
  
  if (hasNoMarketData) {
    syncMessage = 'Sem dados de mercado disponíveis';
  } else if (isSyncing) {
    if (!binanceReady) {
      syncMessage = 'Aguardando dados da Binance...';
    } else if (!backendSettled) {
      syncMessage = 'Carregando projeções do backend...';
    } else {
      syncMessage = 'Sincronizando...';
    }
  }

  return {
    isReady,
    isSyncing,
    hasNoMarketData,
    syncMessage,
  };
}
