import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTrendChartData } from '../hooks/useTrendChartData';
import type { TrendChartDataPoint } from '../hooks/useTrendChartData';

interface TrendChartProps {
  /** Symbol to fetch data for (new API) */
  symbol?: string;
  /** Pre-fetched data (legacy API used by BubbleDetailPanel) */
  data?: TrendChartDataPoint[];
  height?: number;
  showAxes?: boolean;
  showTooltip?: boolean;
}

function ChartContent({
  data,
  height,
  showAxes,
  showTooltip,
  symbol,
}: {
  data: TrendChartDataPoint[];
  height: number;
  showAxes: boolean;
  showTooltip: boolean;
  symbol: string;
}) {
  const prices = data.map((d) => d.close);
  const firstPrice = prices[0] ?? 0;
  const lastPrice = prices[prices.length - 1] ?? 0;
  const isBullish = lastPrice >= firstPrice;

  const strokeColor = isBullish ? '#00e676' : '#ff1744';
  const gradientId = `grad-${symbol}-${height}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxes && (
          <>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#666' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 9, fill: '#666' }}
              tickLine={false}
              axisLine={false}
              width={45}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(2)
              }
            />
          </>
        )}
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d1117',
              border: '1px solid #1e2530',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#e2e8f0',
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              'Preço',
            ]}
            labelFormatter={(label) => String(label)}
          />
        )}
        <Area
          type="monotone"
          dataKey="close"
          stroke={strokeColor}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Wrapper that fetches data by symbol */
function TrendChartBySymbol({
  symbol,
  height,
  showAxes,
  showTooltip,
}: {
  symbol: string;
  height: number;
  showAxes: boolean;
  showTooltip: boolean;
}) {
  const { data, isLoading, isError } = useTrendChartData(symbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="w-4 h-4 border border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-[10px] text-muted-foreground">—</span>
      </div>
    );
  }

  return (
    <ChartContent
      data={data}
      height={height}
      showAxes={showAxes}
      showTooltip={showTooltip}
      symbol={symbol}
    />
  );
}

export default function TrendChart({
  symbol,
  data,
  height = 120,
  showAxes = true,
  showTooltip = true,
}: TrendChartProps) {
  // Legacy path: data was passed directly (BubbleDetailPanel)
  if (data && data.length > 0) {
    const sym = symbol ?? 'chart';
    return (
      <ChartContent
        data={data}
        height={height}
        showAxes={showAxes}
        showTooltip={showTooltip}
        symbol={sym}
      />
    );
  }

  // New path: fetch by symbol
  if (symbol) {
    return (
      <TrendChartBySymbol
        symbol={symbol}
        height={height}
        showAxes={showAxes}
        showTooltip={showTooltip}
      />
    );
  }

  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <span className="text-[10px] text-muted-foreground">—</span>
    </div>
  );
}
