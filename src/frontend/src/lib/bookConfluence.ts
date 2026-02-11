/**
 * Book Confluence Analysis
 * Detects confluence events where order book dynamics align with trade flow
 */

import { BookTicker } from './binanceOrderFlowRest';
import { RollingWindowStats } from './orderFlowAnalysis';

export interface SpreadMetrics {
  bidPrice: number;
  askPrice: number;
  spread: number;
  spreadPercent: number;
  midPrice: number;
}

export interface BookDirection {
  bidTrend: 'up' | 'down' | 'stable';
  askTrend: 'up' | 'down' | 'stable';
  spreadTrend: 'tightening' | 'widening' | 'stable';
}

export interface ConfluenceEvent {
  id: string;
  timestamp: number;
  type: 'buy_confluence' | 'sell_confluence' | 'neutral';
  description: string;
  severity: 'low' | 'medium' | 'high';
  metrics: {
    flowImbalance: number;
    spreadChange: number;
    bidAskMovement: string;
  };
}

export interface ConfluenceThresholds {
  minImbalancePercent: number;
  minSpreadChangePercent: number;
  detectionWindowMs: number;
}

/**
 * Calculate spread metrics from book ticker
 */
export function calculateSpreadMetrics(bookTicker: BookTicker | null): SpreadMetrics | null {
  if (!bookTicker) return null;

  const bidPrice = parseFloat(bookTicker.bidPrice);
  const askPrice = parseFloat(bookTicker.askPrice);
  const spread = askPrice - bidPrice;
  const midPrice = (bidPrice + askPrice) / 2;
  const spreadPercent = (spread / midPrice) * 100;

  return {
    bidPrice,
    askPrice,
    spread,
    spreadPercent,
    midPrice,
  };
}

/**
 * Track book direction over time
 * Compares current metrics with previous to determine trend
 */
export function determineBookDirection(
  current: SpreadMetrics | null,
  previous: SpreadMetrics | null,
  threshold: number = 0.01 // 0.01% threshold for "stable"
): BookDirection {
  if (!current || !previous) {
    return {
      bidTrend: 'stable',
      askTrend: 'stable',
      spreadTrend: 'stable',
    };
  }

  const bidChange = ((current.bidPrice - previous.bidPrice) / previous.bidPrice) * 100;
  const askChange = ((current.askPrice - previous.askPrice) / previous.askPrice) * 100;
  const spreadChange = ((current.spreadPercent - previous.spreadPercent) / previous.spreadPercent) * 100;

  return {
    bidTrend: Math.abs(bidChange) < threshold ? 'stable' : bidChange > 0 ? 'up' : 'down',
    askTrend: Math.abs(askChange) < threshold ? 'stable' : askChange > 0 ? 'up' : 'down',
    spreadTrend: Math.abs(spreadChange) < threshold ? 'stable' : spreadChange > 0 ? 'widening' : 'tightening',
  };
}

/**
 * Detect confluence events
 * Confluence occurs when:
 * 1. Significant trade flow imbalance (buy or sell pressure)
 * 2. Corresponding book movement (spread tightening/widening, bid/ask stepping)
 */
export function detectConfluenceEvents(
  flowStats: RollingWindowStats,
  currentSpread: SpreadMetrics | null,
  previousSpread: SpreadMetrics | null,
  direction: BookDirection,
  thresholds: ConfluenceThresholds,
  previousEvents: ConfluenceEvent[]
): ConfluenceEvent[] {
  if (!currentSpread || !previousSpread) return previousEvents;

  const totalFlow = flowStats.totalBuyNotional + flowStats.totalSellNotional;
  if (totalFlow === 0) return previousEvents;

  const imbalancePercent = (flowStats.netDelta / totalFlow) * 100;
  const spreadChangePercent = ((currentSpread.spreadPercent - previousSpread.spreadPercent) / previousSpread.spreadPercent) * 100;

  // Check if we have significant imbalance
  const hasSignificantImbalance = Math.abs(imbalancePercent) >= thresholds.minImbalancePercent;
  const hasSignificantSpreadChange = Math.abs(spreadChangePercent) >= thresholds.minSpreadChangePercent;

  if (!hasSignificantImbalance) return previousEvents;

  const now = Date.now();
  const isBuyPressure = imbalancePercent > 0;

  // Buy confluence: buy imbalance + tightening spread or rising bid
  if (isBuyPressure && (direction.spreadTrend === 'tightening' || direction.bidTrend === 'up') && hasSignificantSpreadChange) {
    const event: ConfluenceEvent = {
      id: `confluence_${now}`,
      timestamp: now,
      type: 'buy_confluence',
      description: `Pressão de compra (${imbalancePercent.toFixed(1)}%) + ${direction.spreadTrend === 'tightening' ? 'spread fechando' : 'bid subindo'}`,
      severity: Math.abs(imbalancePercent) > 70 ? 'high' : Math.abs(imbalancePercent) > 50 ? 'medium' : 'low',
      metrics: {
        flowImbalance: imbalancePercent,
        spreadChange: spreadChangePercent,
        bidAskMovement: `Bid ${direction.bidTrend}, Ask ${direction.askTrend}`,
      },
    };
    return [event, ...previousEvents].slice(0, 20);
  }

  // Sell confluence: sell imbalance + widening spread or falling ask
  if (!isBuyPressure && (direction.spreadTrend === 'widening' || direction.askTrend === 'down') && hasSignificantSpreadChange) {
    const event: ConfluenceEvent = {
      id: `confluence_${now}`,
      timestamp: now,
      type: 'sell_confluence',
      description: `Pressão de venda (${Math.abs(imbalancePercent).toFixed(1)}%) + ${direction.spreadTrend === 'widening' ? 'spread abrindo' : 'ask caindo'}`,
      severity: Math.abs(imbalancePercent) > 70 ? 'high' : Math.abs(imbalancePercent) > 50 ? 'medium' : 'low',
      metrics: {
        flowImbalance: imbalancePercent,
        spreadChange: spreadChangePercent,
        bidAskMovement: `Bid ${direction.bidTrend}, Ask ${direction.askTrend}`,
      },
    };
    return [event, ...previousEvents].slice(0, 20);
  }

  return previousEvents;
}
