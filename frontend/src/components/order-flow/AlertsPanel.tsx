/**
 * Alerts panel component with scrollable list and clear action
 * Displays order flow alerts with severity styling
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';
import { OrderFlowAlert } from '../../lib/orderFlowAlerts';
import OrderFlowSection from './OrderFlowSection';
import { COPY } from './orderFlowCopy';

interface AlertsPanelProps {
  alerts: OrderFlowAlert[];
  onClearAlerts: () => void;
}

export default function AlertsPanel({ alerts, onClearAlerts }: AlertsPanelProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-neon-pink border-neon-pink/50 bg-neon-pink/10';
      case 'medium':
        return 'text-neon-yellow border-neon-yellow/50 bg-neon-yellow/10';
      default:
        return 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10';
    }
  };

  const badge = (
    <div className="flex items-center gap-2">
      {alerts.length > 0 && (
        <Badge variant="outline" className="text-neon-pink border-neon-pink/50">
          {COPY.alertsCount(alerts.length)}
        </Badge>
      )}
      {alerts.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAlerts}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          {COPY.clearAlerts}
        </Button>
      )}
    </div>
  );

  return (
    <OrderFlowSection title={COPY.alerts} icon={Bell} badge={badge}>
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BellOff className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{COPY.noAlerts}</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold text-sm">{alert.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </OrderFlowSection>
  );
}
