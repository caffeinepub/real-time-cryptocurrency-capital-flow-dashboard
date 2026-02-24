/**
 * Compact controls bar for Order Flow Monitor
 * Handles market selection, polling toggle, refresh, and last updated display
 */

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings } from 'lucide-react';
import { MarketType } from '../../lib/binanceOrderFlowRest';
import { COPY } from './orderFlowCopy';

interface OrderFlowControlsBarProps {
  market: MarketType;
  onMarketChange: (market: MarketType) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  lastUpdated: number | null;
  isLoading: boolean;
  onRefresh: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export default function OrderFlowControlsBar({
  market,
  onMarketChange,
  enabled,
  onEnabledChange,
  lastUpdated,
  isLoading,
  onRefresh,
  showSettings,
  onToggleSettings,
}: OrderFlowControlsBarProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-muted/10">
      {/* Market Selection */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium whitespace-nowrap">{COPY.market}:</Label>
        <div className="flex gap-2">
          <Button
            variant={market === 'futures' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMarketChange('futures')}
            className={
              market === 'futures'
                ? 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50 hover:bg-neon-yellow/30'
                : ''
            }
          >
            {COPY.marketFutures}
          </Button>
          <Button
            variant={market === 'spot' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMarketChange('spot')}
            className={
              market === 'spot'
                ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 hover:bg-neon-cyan/30'
                : ''
            }
          >
            {COPY.marketSpot}
          </Button>
        </div>
      </div>

      {/* Polling & Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch checked={enabled} onCheckedChange={onEnabledChange} id="polling-toggle" />
          <Label htmlFor="polling-toggle" className="text-sm whitespace-nowrap">
            {enabled ? COPY.pollingActive : COPY.pollingPaused}
          </Label>
        </div>

        {lastUpdated && (
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {COPY.lastUpdated}: {formatTime(lastUpdated)}
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {COPY.refresh}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSettings}
          className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          {COPY.settings}
        </Button>
      </div>
    </div>
  );
}
