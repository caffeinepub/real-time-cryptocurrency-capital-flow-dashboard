import type { NormalizedFuturesPosition, BinanceFuturesMarket } from '../backend';

export function formatPrice(price: number): string {
  if (price === 0) return '—';
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSize(size: number): string {
  if (size === 0) return '—';
  return size.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatLeverage(leverage: number): string {
  return `${leverage.toFixed(0)}x`;
}

export function formatPnL(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatLiquidationPrice(position: NormalizedFuturesPosition): string {
  // Handle zero or missing liquidation price
  if (!position.liquidationPrice || position.liquidationPrice === 0) {
    return '—';
  }
  return formatPrice(position.liquidationPrice);
}

export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'text-neon-green';
  if (pnl < 0) return 'text-neon-red';
  return 'text-muted-foreground';
}

export function getPositionSideColor(side: string): string {
  const normalized = side.toUpperCase();
  if (normalized === 'LONG') return 'text-neon-green';
  if (normalized === 'SHORT') return 'text-neon-red';
  return 'text-muted-foreground';
}

export function getMarketTypeLabel(market: BinanceFuturesMarket): string {
  if (market === 'usdt_m') return 'USD-M';
  if (market === 'coin_m') return 'COIN-M';
  return 'UNKNOWN';
}

export function getMarketTypeBadgeColor(market: BinanceFuturesMarket): string {
  if (market === 'usdt_m') return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30';
  if (market === 'coin_m') return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30';
  return 'bg-muted text-muted-foreground';
}
