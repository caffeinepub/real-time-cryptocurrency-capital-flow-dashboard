import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TrendChartDataPoint } from '../hooks/useTrendChartData';

interface TrendChartProps {
  data: TrendChartDataPoint[];
  symbol: string;
}

export default function TrendChart({ data, symbol }: TrendChartProps) {
  // Calculate trend direction
  const trend = useMemo(() => {
    if (data.length < 2) return 'neutral';
    const firstClose = data[0].close;
    const lastClose = data[data.length - 1].close;
    return lastClose > firstClose ? 'bullish' : lastClose < firstClose ? 'bearish' : 'neutral';
  }, [data]);

  // Calculate price range for Y-axis domain
  const priceRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100 };
    
    const prices = data.flatMap(d => [d.low, d.high]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // 10% padding
    
    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding),
    };
  }, [data]);

  // Determine colors based on trend
  const lineColor = trend === 'bullish' ? 'hsl(142, 85%, 55%)' : trend === 'bearish' ? 'hsl(0, 85%, 60%)' : 'hsl(48, 90%, 58%)';
  const gradientId = `gradient-${symbol}`;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isGreen = data.close >= data.open;

    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-2 font-medium">{data.date}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Abertura:</span>
            <span className="font-bold">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Máxima:</span>
            <span className="font-bold text-neon-green">${data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Mínima:</span>
            <span className="font-bold text-neon-pink">${data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Fechamento:</span>
            <span className={`font-bold ${isGreen ? 'text-neon-green' : 'text-neon-pink'}`}>
              ${data.close.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.2}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            domain={[priceRange.min, priceRange.max]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: lineColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
