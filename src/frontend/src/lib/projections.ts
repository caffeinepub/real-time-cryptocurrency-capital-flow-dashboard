import type { PredictiveProjection, TargetLevel } from '../backend';
import { roundToTwoDecimals } from './formatters';
import { getTargetMultipliers, normalizeToBaseSymbol } from './symbols';
import type { LiveMarketData } from '../hooks/useBinanceData';

/**
 * Validates a projection object and all nested fields
 * Returns true if the projection is safe to render
 */
export function isValidProjection(projection: unknown): projection is PredictiveProjection {
  if (!projection || typeof projection !== 'object') return false;
  
  const p = projection as Partial<PredictiveProjection>;
  
  // Validate asset
  if (!p.asset || typeof p.asset !== 'object') return false;
  if (typeof p.asset.symbol !== 'string' || !p.asset.symbol) return false;
  if (typeof p.asset.usdValue !== 'number' || p.asset.usdValue < 0) return false;
  
  // Validate basic fields
  if (typeof p.trend !== 'string') return false;
  if (typeof p.confidenceLevel !== 'number') return false;
  if (typeof p.precision !== 'number') return false;
  
  return true;
}

/**
 * Validates a target level object
 */
export function isValidTargetLevel(target: unknown): target is TargetLevel {
  if (!target || typeof target !== 'object') return false;
  
  const t = target as Partial<TargetLevel>;
  
  if (typeof t.levelType !== 'string' || !t.levelType) return false;
  if (typeof t.priceLevel !== 'number' || t.priceLevel <= 0) return false;
  if (typeof t.confidenceScore !== 'number') return false;
  
  return true;
}

/**
 * Sanitizes a projection by validating and applying safe defaults
 * Returns null if the projection is fundamentally invalid
 */
export function sanitizeProjection(projection: unknown): PredictiveProjection | null {
  if (!isValidProjection(projection)) return null;
  
  const p = projection as PredictiveProjection;
  
  // Sanitize target levels
  let targetLevels: TargetLevel[] = [];
  
  if (Array.isArray(p.targetLevels)) {
    targetLevels = p.targetLevels.filter(isValidTargetLevel);
  }
  
  // Generate deterministic fallback targets if none exist or all were invalid
  if (targetLevels.length === 0 && p.asset.usdValue > 0) {
    targetLevels = generateDeterministicTargets(
      p.asset.symbol,
      p.asset.usdValue,
      p.trend,
      p.confidenceLevel
    );
  }
  
  return {
    asset: {
      symbol: p.asset.symbol,
      name: p.asset.name || p.asset.symbol,
      usdValue: roundToTwoDecimals(p.asset.usdValue),
    },
    trend: p.trend,
    confidenceLevel: roundToTwoDecimals(Math.max(0, Math.min(1, p.confidenceLevel))),
    precision: roundToTwoDecimals(Math.max(0, Math.min(1, p.precision))),
    timeHorizon: p.timeHorizon || BigInt(24),
    targetLevels,
  };
}

/**
 * Sanitizes an array of projections, dropping invalid items
 */
export function sanitizeProjections(projections: unknown): PredictiveProjection[] {
  if (!Array.isArray(projections)) return [];
  
  const sanitized: PredictiveProjection[] = [];
  
  for (const projection of projections) {
    const sanitizedProjection = sanitizeProjection(projection);
    if (sanitizedProjection) {
      sanitized.push(sanitizedProjection);
    }
  }
  
  return sanitized;
}

/**
 * Generates deterministic target levels for a given asset
 */
export function generateDeterministicTargets(
  symbol: string,
  currentPrice: number,
  trend: string,
  confidence: number
): TargetLevel[] {
  if (currentPrice <= 0) return [];
  
  const baseSymbol = normalizeToBaseSymbol(symbol);
  const multipliers = getTargetMultipliers(baseSymbol, trend);
  const safeConfidence = Math.max(0.3, Math.min(1, confidence));
  
  const trendLower = trend.toLowerCase();
  const isBearish = trendLower.includes('baixa') || trendLower.includes('down') || trendLower.includes('bearish');
  
  return [
    {
      levelType: isBearish ? 'Suporte' : 'Acumulação',
      priceLevel: roundToTwoDecimals(currentPrice * multipliers.lower),
      confidenceScore: roundToTwoDecimals(safeConfidence * 0.85),
      timestamp: BigInt(Date.now() * 1000000),
      source: isBearish ? 'Double Bottom' : 'Volume Cluster',
    },
    {
      levelType: isBearish ? 'Liquidação' : 'Resistência',
      priceLevel: roundToTwoDecimals(currentPrice * multipliers.upper),
      confidenceScore: roundToTwoDecimals(safeConfidence * 0.75),
      timestamp: BigInt(Date.now() * 1000000),
      source: isBearish ? 'Open Interest' : 'Análise Técnica',
    },
  ];
}

/**
 * Generates a synthetic projection from live market data
 */
export function generateSyntheticProjection(marketData: LiveMarketData): PredictiveProjection | null {
  if (!marketData || typeof marketData.symbol !== 'string' || typeof marketData.price !== 'number') {
    return null;
  }
  
  if (marketData.price <= 0) return null;
  
  const baseSymbol = normalizeToBaseSymbol(marketData.symbol);
  const priceChange = typeof marketData.priceChangePercent === 'number' ? marketData.priceChangePercent : 0;
  
  // Determine trend
  let trend = 'Neutro';
  if (priceChange > 2) {
    trend = 'Alta';
  } else if (priceChange < -2) {
    trend = 'Baixa';
  }
  
  // Calculate confidence
  const confidence = roundToTwoDecimals(Math.min(0.95, Math.max(0.3, Math.abs(priceChange) / 5)));
  
  // Generate targets
  const targetLevels = generateDeterministicTargets(
    baseSymbol,
    marketData.price,
    trend,
    confidence
  );
  
  return {
    asset: {
      symbol: baseSymbol,
      name: baseSymbol,
      usdValue: roundToTwoDecimals(marketData.price),
    },
    trend,
    confidenceLevel: confidence,
    precision: roundToTwoDecimals(confidence * 0.9),
    timeHorizon: BigInt(24),
    targetLevels,
  };
}

/**
 * Generates synthetic projections from an array of market data
 */
export function generateSyntheticProjections(marketData: LiveMarketData[]): PredictiveProjection[] {
  if (!Array.isArray(marketData)) return [];
  
  const projections: PredictiveProjection[] = [];
  
  for (const data of marketData) {
    const projection = generateSyntheticProjection(data);
    if (projection) {
      projections.push(projection);
    }
  }
  
  return projections;
}
