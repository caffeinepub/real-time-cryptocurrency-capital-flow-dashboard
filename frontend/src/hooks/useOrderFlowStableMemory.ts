/**
 * Stable memory hook for Order Flow Monitor
 * Provides ref-based internal memory that doesn't trigger React re-renders
 */

import { useRef } from 'react';
import { SpreadMetrics } from '../lib/bookConfluence';

export interface OrderFlowMemory {
  previousSpread: SpreadMetrics | null;
  previousStats: any;
  previousPrice: number;
  avgVolume: number;
  avgSpread: number;
}

export interface OrderFlowMemoryHelpers {
  setPreviousSpread: (spread: SpreadMetrics | null) => void;
  setPreviousStats: (stats: any) => void;
  setPreviousPrice: (price: number) => void;
  setAvgVolume: (volume: number) => void;
  setAvgSpread: (spread: number) => void;
  updateAvgVolume: (currentVolume: number) => void;
  updateAvgSpread: (currentSpread: number) => void;
  reset: () => void;
}

export function useOrderFlowStableMemory(): OrderFlowMemory & OrderFlowMemoryHelpers {
  const memoryRef = useRef<OrderFlowMemory>({
    previousSpread: null,
    previousStats: null,
    previousPrice: 0,
    avgVolume: 0,
    avgSpread: 0,
  });

  return {
    // Getters (return current ref values)
    get previousSpread() {
      return memoryRef.current.previousSpread;
    },
    get previousStats() {
      return memoryRef.current.previousStats;
    },
    get previousPrice() {
      return memoryRef.current.previousPrice;
    },
    get avgVolume() {
      return memoryRef.current.avgVolume;
    },
    get avgSpread() {
      return memoryRef.current.avgSpread;
    },

    // Setters (mutate ref without triggering re-render)
    setPreviousSpread: (spread: SpreadMetrics | null) => {
      memoryRef.current.previousSpread = spread;
    },
    setPreviousStats: (stats: any) => {
      memoryRef.current.previousStats = stats;
    },
    setPreviousPrice: (price: number) => {
      memoryRef.current.previousPrice = price;
    },
    setAvgVolume: (volume: number) => {
      memoryRef.current.avgVolume = volume;
    },
    setAvgSpread: (spread: number) => {
      memoryRef.current.avgSpread = spread;
    },

    // Rolling average updaters
    updateAvgVolume: (currentVolume: number) => {
      if (memoryRef.current.avgVolume === 0) {
        memoryRef.current.avgVolume = currentVolume;
      } else {
        memoryRef.current.avgVolume = memoryRef.current.avgVolume * 0.95 + currentVolume * 0.05;
      }
    },
    updateAvgSpread: (currentSpread: number) => {
      if (memoryRef.current.avgSpread === 0) {
        memoryRef.current.avgSpread = currentSpread;
      } else {
        memoryRef.current.avgSpread = memoryRef.current.avgSpread * 0.95 + currentSpread * 0.05;
      }
    },

    // Reset all memory
    reset: () => {
      memoryRef.current = {
        previousSpread: null,
        previousStats: null,
        previousPrice: 0,
        avgVolume: 0,
        avgSpread: 0,
      };
    },
  };
}
