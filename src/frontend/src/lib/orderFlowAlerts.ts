/**
 * Order Flow Alert System
 * Generates proxy alerts for potential liquidation events and market anomalies
 */

import { RollingWindowStats } from './orderFlowAnalysis';
import { SpreadMetrics } from './bookConfluence';

export interface OrderFlowAlert {
  id: string;
  timestamp: number;
  type: 'liquidation_proxy' | 'volume_spike' | 'price_spike' | 'spread_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metrics: Record<string, number>;
}

export interface AlertThresholds {
  volumeSpikeMultiplier: number;
  priceChangePercent: number;
  spreadAnomalyMultiplier: number;
  enabled: boolean;
}

/**
 * Generate proxy liquidation alerts
 * Note: True liquidation detection requires authenticated Binance API access
 * This generates proxy alerts based on observable market behavior
 */
export function generateProxyLiquidationAlert(
  currentStats: RollingWindowStats,
  previousStats: RollingWindowStats | null,
  currentPrice: number,
  previousPrice: number,
  thresholds: AlertThresholds
): OrderFlowAlert | null {
  if (!thresholds.enabled || !previousStats) return null;

  const volumeChange = currentStats.totalBuyNotional + currentStats.totalSellNotional;
  const previousVolume = previousStats.totalBuyNotional + previousStats.totalSellNotional;
  
  if (previousVolume === 0) return null;

  const volumeRatio = volumeChange / previousVolume;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  // Proxy liquidation: sudden volume spike + sharp price movement
  const hasVolumeSpike = volumeRatio >= thresholds.volumeSpikeMultiplier;
  const hasPriceSpike = Math.abs(priceChange) >= thresholds.priceChangePercent;

  if (hasVolumeSpike && hasPriceSpike) {
    const severity: OrderFlowAlert['severity'] = 
      Math.abs(priceChange) > 5 ? 'critical' :
      Math.abs(priceChange) > 3 ? 'high' :
      Math.abs(priceChange) > 2 ? 'medium' : 'low';

    return {
      id: `liquidation_proxy_${Date.now()}`,
      timestamp: Date.now(),
      type: 'liquidation_proxy',
      severity,
      title: 'Possível Liquidação Detectada',
      description: `Spike de volume (${volumeRatio.toFixed(1)}x) + movimento de preço (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%) pode indicar liquidações em cascata`,
      metrics: {
        volumeRatio,
        priceChange,
        totalVolume: volumeChange,
      },
    };
  }

  return null;
}

/**
 * Generate volume spike alert
 */
export function generateVolumeSpikeAlert(
  currentStats: RollingWindowStats,
  avgVolume: number,
  thresholds: AlertThresholds
): OrderFlowAlert | null {
  if (!thresholds.enabled || avgVolume === 0) return null;

  const currentVolume = currentStats.totalBuyNotional + currentStats.totalSellNotional;
  const volumeRatio = currentVolume / avgVolume;

  if (volumeRatio >= thresholds.volumeSpikeMultiplier) {
    return {
      id: `volume_spike_${Date.now()}`,
      timestamp: Date.now(),
      type: 'volume_spike',
      severity: volumeRatio > 5 ? 'high' : volumeRatio > 3 ? 'medium' : 'low',
      title: 'Spike de Volume',
      description: `Volume ${volumeRatio.toFixed(1)}x acima da média - possível entrada institucional`,
      metrics: {
        volumeRatio,
        currentVolume,
        avgVolume,
      },
    };
  }

  return null;
}

/**
 * Generate spread anomaly alert
 */
export function generateSpreadAnomalyAlert(
  currentSpread: SpreadMetrics | null,
  avgSpread: number,
  thresholds: AlertThresholds
): OrderFlowAlert | null {
  if (!thresholds.enabled || !currentSpread || avgSpread === 0) return null;

  const spreadRatio = currentSpread.spreadPercent / avgSpread;

  if (spreadRatio >= thresholds.spreadAnomalyMultiplier) {
    return {
      id: `spread_anomaly_${Date.now()}`,
      timestamp: Date.now(),
      type: 'spread_anomaly',
      severity: spreadRatio > 3 ? 'high' : spreadRatio > 2 ? 'medium' : 'low',
      title: 'Anomalia no Spread',
      description: `Spread ${spreadRatio.toFixed(1)}x maior que a média - possível baixa liquidez ou manipulação`,
      metrics: {
        spreadRatio,
        currentSpread: currentSpread.spreadPercent,
        avgSpread,
      },
    };
  }

  return null;
}
