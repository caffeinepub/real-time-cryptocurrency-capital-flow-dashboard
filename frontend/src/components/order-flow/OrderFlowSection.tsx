/**
 * Reusable section wrapper for Order Flow Monitor
 * Provides consistent framing with title, optional icon/badges, and content layout
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface OrderFlowSectionProps {
  title: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function OrderFlowSection({
  title,
  icon: Icon,
  badge,
  children,
  className = '',
}: OrderFlowSectionProps) {
  return (
    <Card className={`terminal-panel ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {title}
          </CardTitle>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
