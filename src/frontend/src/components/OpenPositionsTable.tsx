import type { NormalizedFuturesPosition } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  formatPrice,
  formatSize,
  formatLeverage,
  formatPnL,
  formatLiquidationPrice,
  getPnLColor,
  getPositionSideColor,
  getMarketTypeLabel,
  getMarketTypeBadgeColor,
} from '../lib/futuresPositionFormat';
import { generatePositionInsights, getInsightColor } from '../lib/positionInsights';

interface OpenPositionsTableProps {
  positions: NormalizedFuturesPosition[];
}

export default function OpenPositionsTable({ positions }: OpenPositionsTableProps) {
  if (positions.length === 0) {
    return (
      <Alert className="border-neon-cyan/30 bg-neon-cyan/5">
        <AlertDescription className="text-sm text-muted-foreground">
          No open positions found. Your positions will appear here once you open trades on Binance Futures.
        </AlertDescription>
      </Alert>
    );
  }

  // Count positions with warnings
  const positionsWithWarnings = positions.filter(
    (pos) => generatePositionInsights(pos).some((i) => i.severity === 'warning' || i.severity === 'critical')
  ).length;

  return (
    <div className="space-y-4">
      {positionsWithWarnings > 0 && (
        <Alert className="border-neon-yellow/30 bg-neon-yellow/5">
          <AlertTriangle className="h-4 w-4 text-neon-yellow" />
          <AlertDescription className="text-sm text-neon-yellow">
            {positionsWithWarnings} position{positionsWithWarnings > 1 ? 's' : ''} with risk alerts detected.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        {positions.map((position, index) => {
          const insights = generatePositionInsights(position);
          const isLong = position.positionSide.toUpperCase() === 'LONG';

          return (
            <Card key={index} className="terminal-panel border-neon-green/30 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isLong ? (
                      <TrendingUp className="w-5 h-5 text-neon-green" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-neon-red" />
                    )}
                    <CardTitle className="text-lg font-bold text-foreground">{position.symbol}</CardTitle>
                    <Badge className={getMarketTypeBadgeColor(position.market)}>
                      {getMarketTypeLabel(position.market)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getPositionSideColor(position.positionSide)}`}>
                      {position.positionSide.toUpperCase()}
                    </span>
                    <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                      {formatLeverage(position.leverage)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Position Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Size</p>
                    <p className="text-sm font-semibold text-foreground">{formatSize(Math.abs(position.positionAmt))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
                    <p className="text-sm font-semibold text-foreground">${formatPrice(position.entryPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mark Price</p>
                    <p className="text-sm font-semibold text-foreground">${formatPrice(position.markPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Liquidation</p>
                    <p className="text-sm font-semibold text-foreground">${formatLiquidationPrice(position)}</p>
                  </div>
                </div>

                {/* PnL Display */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Unrealized PnL</span>
                    <span className={`text-lg font-bold ${getPnLColor(position.pnl)}`}>
                      {formatPnL(position.pnl)} USDT
                    </span>
                  </div>
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded border ${getInsightColor(insight.severity)}`}
                      >
                        {insight.message}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
