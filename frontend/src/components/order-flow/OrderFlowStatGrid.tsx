/**
 * Responsive stat grid component for Order Flow Monitor
 * Displays key metrics in a clean, mobile-friendly layout
 */

import { ReactNode } from 'react';

interface StatItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}

interface OrderFlowStatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export default function OrderFlowStatGrid({ stats, columns = 3 }: OrderFlowStatGridProps) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border border-border/50 bg-muted/20 ${stat.className || ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </span>
            {stat.icon}
          </div>
          <div className="text-xl font-bold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
