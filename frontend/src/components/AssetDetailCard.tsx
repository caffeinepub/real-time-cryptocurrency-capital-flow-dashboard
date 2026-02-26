import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useBinanceData } from '../hooks/useBinanceData';
import TrendChart from './TrendChart';

interface AssetDetailCardProps {
  symbol: string;
  name?: string;
  onClick?: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (price >= 1)
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(2)}K`;
  return `$${vol.toFixed(2)}`;
}

export default function AssetDetailCard({
  symbol,
  name,
  onClick,
}: AssetDetailCardProps) {
  const { tickers } = useBinanceData();

  const tickerKey = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
  const ticker = tickers[tickerKey] ?? tickers[symbol];

  const price = ticker?.lastPrice ?? 0;
  const change24h = ticker?.priceChangePercent ?? 0;
  const volume = ticker?.quoteVolume ?? ticker?.volume ?? 0;

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  const changeColor = isPositive
    ? 'text-neon-green'
    : isNegative
    ? 'text-neon-red'
    : 'text-muted-foreground';
  const changeBg = isPositive
    ? 'bg-neon-green/10'
    : isNegative
    ? 'bg-neon-red/10'
    : 'bg-muted/10';

  const displaySymbol = symbol.replace('USDT', '').replace('BUSD', '');
  const displayName = name || displaySymbol;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface border border-border/50 rounded-xl p-3 hover:border-neon-green/30 hover:bg-surface/80 transition-all duration-200 active:scale-[0.98] min-h-[44px]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground">
              {displaySymbol}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${changeBg} ${changeColor}`}
            >
              {isPositive ? '+' : ''}
              {change24h.toFixed(2)}%
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {displayName}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-sm font-semibold text-foreground">
            ${formatPrice(price)}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {formatVolume(volume)}
          </div>
        </div>
      </div>

      {/* Mini sparkline — fetches by symbol */}
      <div className="h-10 w-full">
        <TrendChart
          symbol={tickerKey}
          height={40}
          showAxes={false}
          showTooltip={false}
        />
      </div>

      {/* Trend indicator */}
      <div className={`flex items-center gap-1 mt-1 ${changeColor}`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : isNegative ? (
          <TrendingDown className="w-3 h-3" />
        ) : (
          <Minus className="w-3 h-3" />
        )}
        <span className="text-[10px] font-medium">
          {isPositive ? 'Alta' : isNegative ? 'Baixa' : 'Neutro'} 24h
        </span>
      </div>
    </button>
  );
}
