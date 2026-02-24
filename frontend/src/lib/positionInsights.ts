import type { NormalizedFuturesPosition } from '../backend';

export interface PositionInsight {
  type: 'high-pnl' | 'liquidation-risk' | 'entry-distance' | 'mark-movement';
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export function generatePositionInsights(position: NormalizedFuturesPosition): PositionInsight[] {
  const insights: PositionInsight[] = [];

  // 1. High PnL suggestion
  const pnlPercent = (position.pnl / (position.entryPrice * Math.abs(position.positionAmt))) * 100;
  if (Math.abs(pnlPercent) > 15) {
    if (pnlPercent > 0) {
      insights.push({
        type: 'high-pnl',
        severity: 'info',
        message: `Consider taking partial profits. Current gain: ${pnlPercent.toFixed(1)}%`,
      });
    } else {
      insights.push({
        type: 'high-pnl',
        severity: 'warning',
        message: `Significant loss detected: ${pnlPercent.toFixed(1)}%. Review your risk management.`,
      });
    }
  }

  // 2. Liquidation risk proximity
  if (position.liquidationPrice && position.liquidationPrice > 0) {
    const isLong = position.positionSide.toUpperCase() === 'LONG';
    const distanceToLiquidation = isLong
      ? ((position.markPrice - position.liquidationPrice) / position.markPrice) * 100
      : ((position.liquidationPrice - position.markPrice) / position.markPrice) * 100;

    if (distanceToLiquidation < 5) {
      insights.push({
        type: 'liquidation-risk',
        severity: 'critical',
        message: `Risk: Liquidation price is ${distanceToLiquidation.toFixed(1)}% away. Consider reducing leverage or adding margin.`,
      });
    } else if (distanceToLiquidation < 15) {
      insights.push({
        type: 'liquidation-risk',
        severity: 'warning',
        message: `Caution: Liquidation price is ${distanceToLiquidation.toFixed(1)}% away. Monitor closely.`,
      });
    }
  }

  // 3. Entry vs mark distance
  const entryDistance = ((position.markPrice - position.entryPrice) / position.entryPrice) * 100;
  if (Math.abs(entryDistance) > 20) {
    insights.push({
      type: 'entry-distance',
      severity: 'info',
      message: `Position has drifted ${Math.abs(entryDistance).toFixed(1)}% from entry. Consider reviewing your exit strategy.`,
    });
  }

  // 4. Mark price movement hint (volatility indicator)
  if (Math.abs(entryDistance) > 10 && Math.abs(entryDistance) < 20) {
    insights.push({
      type: 'mark-movement',
      severity: 'info',
      message: `Mark price moved ${Math.abs(entryDistance).toFixed(1)}% from entry, indicating elevated volatility.`,
    });
  }

  return insights;
}

export function getInsightIcon(type: PositionInsight['type']): string {
  switch (type) {
    case 'high-pnl':
      return '💰';
    case 'liquidation-risk':
      return '⚠️';
    case 'entry-distance':
      return '📊';
    case 'mark-movement':
      return '📈';
    default:
      return 'ℹ️';
  }
}

export function getInsightColor(severity: PositionInsight['severity']): string {
  switch (severity) {
    case 'critical':
      return 'text-neon-red border-neon-red/30 bg-neon-red/5';
    case 'warning':
      return 'text-neon-yellow border-neon-yellow/30 bg-neon-yellow/5';
    case 'info':
      return 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5';
    default:
      return 'text-muted-foreground border-border bg-muted/5';
  }
}
