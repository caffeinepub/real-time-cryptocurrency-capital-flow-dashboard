/**
 * Safe JSON parsing utilities
 * Provides defensive parsing and validation for localStorage-backed settings
 */

import { OrderFlowThresholds } from '../lib/orderFlowAnalysis';
import { ConfluenceThresholds } from '../lib/bookConfluence';
import { AlertThresholds } from '../lib/orderFlowAlerts';

/**
 * Safely parse JSON with fallback to default value
 */
export function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  
  try {
    const parsed = JSON.parse(json);
    return parsed !== null && typeof parsed === 'object' ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Validate and merge order flow thresholds with defaults
 */
export function validateOrderFlowThresholds(input: any): OrderFlowThresholds {
  const defaults: OrderFlowThresholds = {
    largeTradeNotional: 100000,
    rollingWindowTrades: 50,
    rollingWindowMinutes: 5,
  };

  if (!input || typeof input !== 'object') return defaults;

  return {
    largeTradeNotional: typeof input.largeTradeNotional === 'number' && input.largeTradeNotional > 0
      ? input.largeTradeNotional
      : defaults.largeTradeNotional,
    rollingWindowTrades: typeof input.rollingWindowTrades === 'number' && input.rollingWindowTrades > 0
      ? input.rollingWindowTrades
      : defaults.rollingWindowTrades,
    rollingWindowMinutes: typeof input.rollingWindowMinutes === 'number' && input.rollingWindowMinutes > 0
      ? input.rollingWindowMinutes
      : defaults.rollingWindowMinutes,
  };
}

/**
 * Validate and merge confluence thresholds with defaults
 */
export function validateConfluenceThresholds(input: any): ConfluenceThresholds {
  const defaults: ConfluenceThresholds = {
    minImbalancePercent: 30,
    minSpreadChangePercent: 10,
    detectionWindowMs: 60000,
  };

  if (!input || typeof input !== 'object') return defaults;

  return {
    minImbalancePercent: typeof input.minImbalancePercent === 'number' && input.minImbalancePercent > 0
      ? input.minImbalancePercent
      : defaults.minImbalancePercent,
    minSpreadChangePercent: typeof input.minSpreadChangePercent === 'number' && input.minSpreadChangePercent > 0
      ? input.minSpreadChangePercent
      : defaults.minSpreadChangePercent,
    detectionWindowMs: typeof input.detectionWindowMs === 'number' && input.detectionWindowMs > 0
      ? input.detectionWindowMs
      : defaults.detectionWindowMs,
  };
}

/**
 * Validate and merge alert thresholds with defaults
 */
export function validateAlertThresholds(input: any): AlertThresholds {
  const defaults: AlertThresholds = {
    volumeSpikeMultiplier: 2.5,
    priceChangePercent: 1.5,
    spreadAnomalyMultiplier: 2.0,
    enabled: true,
  };

  if (!input || typeof input !== 'object') return defaults;

  return {
    volumeSpikeMultiplier: typeof input.volumeSpikeMultiplier === 'number' && input.volumeSpikeMultiplier > 0
      ? input.volumeSpikeMultiplier
      : defaults.volumeSpikeMultiplier,
    priceChangePercent: typeof input.priceChangePercent === 'number' && input.priceChangePercent > 0
      ? input.priceChangePercent
      : defaults.priceChangePercent,
    spreadAnomalyMultiplier: typeof input.spreadAnomalyMultiplier === 'number' && input.spreadAnomalyMultiplier > 0
      ? input.spreadAnomalyMultiplier
      : defaults.spreadAnomalyMultiplier,
    enabled: typeof input.enabled === 'boolean' ? input.enabled : defaults.enabled,
  };
}
