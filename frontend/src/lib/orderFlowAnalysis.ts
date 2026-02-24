/**
 * Order Flow Analysis Utilities
 * Analyzes trade data to identify institutional activity and market imbalances
 */

import { RecentTrade } from './binanceOrderFlowRest';

export interface TradeClassification {
  trade: RecentTrade;
  side: 'buy' | 'sell';
  notional: number;
  isLarge: boolean;
}

export interface RollingWindowStats {
  totalBuyNotional: number;
  totalSellNotional: number;
  netDelta: number;
  buyCount: number;
  sellCount: number;
  largeTradeCount: number;
  avgTradeSize: number;
  windowStart: number;
  windowEnd: number;
}

export interface OrderFlowThresholds {
  largeTradeNotional: number;
  rollingWindowTrades: number;
  rollingWindowMinutes: number;
}

/**
 * Classify trade side based on isBuyerMaker field
 * isBuyerMaker=true means buyer is maker (passive) -> sell side aggression
 * isBuyerMaker=false means buyer is taker (aggressive) -> buy side aggression
 */
export function classifyTradeSide(trade: RecentTrade): 'buy' | 'sell' {
  return trade.isBuyerMaker ? 'sell' : 'buy';
}

/**
 * Calculate trade notional value (price * quantity)
 */
export function calculateNotional(trade: RecentTrade): number {
  return parseFloat(trade.price) * parseFloat(trade.qty);
}

/**
 * Classify trades with side, notional, and large trade detection
 */
export function classifyTrades(
  trades: RecentTrade[],
  thresholds: OrderFlowThresholds
): TradeClassification[] {
  return trades.map(trade => {
    const notional = calculateNotional(trade);
    return {
      trade,
      side: classifyTradeSide(trade),
      notional,
      isLarge: notional >= thresholds.largeTradeNotional,
    };
  });
}

/**
 * Calculate rolling window statistics
 * Uses either last N trades or last M minutes, whichever is more restrictive
 */
export function calculateRollingStats(
  classifications: TradeClassification[],
  thresholds: OrderFlowThresholds
): RollingWindowStats {
  if (classifications.length === 0) {
    return {
      totalBuyNotional: 0,
      totalSellNotional: 0,
      netDelta: 0,
      buyCount: 0,
      sellCount: 0,
      largeTradeCount: 0,
      avgTradeSize: 0,
      windowStart: Date.now(),
      windowEnd: Date.now(),
    };
  }

  // Get window by trade count
  const windowByCount = classifications.slice(0, thresholds.rollingWindowTrades);
  
  // Get window by time
  const now = Date.now();
  const windowMs = thresholds.rollingWindowMinutes * 60 * 1000;
  const windowByTime = classifications.filter(c => now - c.trade.time < windowMs);
  
  // Use the smaller window
  const window = windowByCount.length < windowByTime.length ? windowByCount : windowByTime;

  let totalBuyNotional = 0;
  let totalSellNotional = 0;
  let buyCount = 0;
  let sellCount = 0;
  let largeTradeCount = 0;

  window.forEach(c => {
    if (c.side === 'buy') {
      totalBuyNotional += c.notional;
      buyCount++;
    } else {
      totalSellNotional += c.notional;
      sellCount++;
    }
    if (c.isLarge) largeTradeCount++;
  });

  const netDelta = totalBuyNotional - totalSellNotional;
  const totalNotional = totalBuyNotional + totalSellNotional;
  const avgTradeSize = window.length > 0 ? totalNotional / window.length : 0;

  return {
    totalBuyNotional,
    totalSellNotional,
    netDelta,
    buyCount,
    sellCount,
    largeTradeCount,
    avgTradeSize,
    windowStart: window[window.length - 1]?.trade.time || now,
    windowEnd: window[0]?.trade.time || now,
  };
}

/**
 * Detect large trade clusters
 * Returns true if multiple large trades occurred within a short time window
 */
export function detectLargeTradeCluster(
  classifications: TradeClassification[],
  clusterWindow: number = 60000, // 1 minute
  minClusterSize: number = 3
): boolean {
  const largeTrades = classifications.filter(c => c.isLarge);
  if (largeTrades.length < minClusterSize) return false;

  // Check if first N large trades are within cluster window
  const recentLarge = largeTrades.slice(0, minClusterSize);
  const timeSpan = recentLarge[0].trade.time - recentLarge[minClusterSize - 1].trade.time;
  
  return timeSpan <= clusterWindow;
}
