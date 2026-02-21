/**
 * Confluence events panel component with scrollable list
 * Displays detected confluence events with distinct styling from alerts
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { ConfluenceEvent } from '../../lib/bookConfluence';
import OrderFlowSection from './OrderFlowSection';
import { COPY } from './orderFlowCopy';

interface ConfluencePanelProps {
  events: ConfluenceEvent[];
}

export default function ConfluencePanel({ events }: ConfluencePanelProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getDirectionIcon = (description: string) => {
    if (description.includes('compra') || description.includes('buy')) {
      return <TrendingUp className="w-4 h-4 text-neon-green" />;
    }
    if (description.includes('venda') || description.includes('sell')) {
      return <TrendingDown className="w-4 h-4 text-neon-pink" />;
    }
    return <Target className="w-4 h-4 text-neon-cyan" />;
  };

  const badge = events.length > 0 ? (
    <Badge variant="outline" className="text-neon-cyan border-neon-cyan/50">
      {events.length}
    </Badge>
  ) : null;

  return (
    <OrderFlowSection title={COPY.confluenceEvents} icon={Target} badge={badge}>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{COPY.noConfluence}</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(event.description)}
                    <span className="font-semibold text-sm text-neon-cyan">{event.type}</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-neon-cyan border-neon-cyan/50">
                    {event.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                <span className="text-xs text-muted-foreground">{formatTime(event.timestamp)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </OrderFlowSection>
  );
}
