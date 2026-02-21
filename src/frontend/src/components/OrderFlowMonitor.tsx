/**
 * Order Flow Monitor Component
 * Real-time BTC order flow analysis with improved UX, clear sections, and English copy
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useBinanceOrderFlow } from '../hooks/useBinanceOrderFlow';
import { useOrderFlowStableMemory } from '../hooks/useOrderFlowStableMemory';
import { MarketType } from '../lib/binanceOrderFlowRest';
import {
  classifyTrades,
  calculateRollingStats,
  detectLargeTradeCluster,
  OrderFlowThresholds,
} from '../lib/orderFlowAnalysis';
import {
  calculateSpreadMetrics,
  determineBookDirection,
  detectConfluenceEvents,
  ConfluenceEvent,
  ConfluenceThresholds,
} from '../lib/bookConfluence';
import {
  generateProxyLiquidationAlert,
  generateVolumeSpikeAlert,
  generateSpreadAnomalyAlert,
  OrderFlowAlert,
  AlertThresholds,
} from '../lib/orderFlowAlerts';
import {
  safeJsonParse,
  validateOrderFlowThresholds,
  validateConfluenceThresholds,
  validateAlertThresholds,
} from '../utils/safeJson';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lock,
  Database,
  Zap,
  BarChart3,
} from 'lucide-react';
import OrderFlowSection from './order-flow/OrderFlowSection';
import OrderFlowStatGrid from './order-flow/OrderFlowStatGrid';
import OrderFlowControlsBar from './order-flow/OrderFlowControlsBar';
import AlertsPanel from './order-flow/AlertsPanel';
import ConfluencePanel from './order-flow/ConfluencePanel';
import { COPY } from './order-flow/orderFlowCopy';

export default function OrderFlowMonitor() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Market selection
  const [market, setMarket] = useState<MarketType>('futures');

  // Polling configuration
  const [pollingInterval, setPollingInterval] = useState(3000);
  const [enabled, setEnabled] = useState(true);

  // Order flow thresholds (persisted in localStorage with safe parsing)
  const [flowThresholds, setFlowThresholds] = useState<OrderFlowThresholds>(() => {
    const saved = localStorage.getItem('orderFlowThresholds');
    const parsed = safeJsonParse(saved, null);
    return validateOrderFlowThresholds(parsed);
  });

  // Confluence thresholds (safe parsing)
  const [confluenceThresholds, setConfluenceThresholds] = useState<ConfluenceThresholds>(() => {
    const saved = localStorage.getItem('confluenceThresholds');
    const parsed = safeJsonParse(saved, null);
    return validateConfluenceThresholds(parsed);
  });

  // Alert thresholds (safe parsing)
  const [alertThresholds, setAlertThresholds] = useState<AlertThresholds>(() => {
    const saved = localStorage.getItem('alertThresholds');
    const parsed = safeJsonParse(saved, null);
    return validateAlertThresholds(parsed);
  });

  // State for confluence and alerts (only for display)
  const [confluenceEvents, setConfluenceEvents] = useState<ConfluenceEvent[]>([]);
  const [alerts, setAlerts] = useState<OrderFlowAlert[]>([]);

  // Stable memory (refs) for internal tracking without re-renders
  const memory = useOrderFlowStableMemory();

  // Track previous confluence/alert arrays to detect actual changes
  const prevConfluenceRef = useRef<ConfluenceEvent[]>([]);
  const prevAlertsRef = useRef<OrderFlowAlert[]>([]);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);

  // Fetch order flow data
  const { data, isLoading, error, lastUpdated, refetch } = useBinanceOrderFlow({
    market,
    pollingInterval,
    enabled: enabled && isAuthenticated,
  });

  // Reset memory when market changes
  useEffect(() => {
    memory.reset();
    setConfluenceEvents([]);
    setAlerts([]);
    prevConfluenceRef.current = [];
    prevAlertsRef.current = [];
  }, [market]);

  // Persist thresholds (safe)
  useEffect(() => {
    try {
      localStorage.setItem('orderFlowThresholds', JSON.stringify(flowThresholds));
    } catch (e) {
      console.warn('Failed to save orderFlowThresholds to localStorage');
    }
  }, [flowThresholds]);

  useEffect(() => {
    try {
      localStorage.setItem('confluenceThresholds', JSON.stringify(confluenceThresholds));
    } catch (e) {
      console.warn('Failed to save confluenceThresholds to localStorage');
    }
  }, [confluenceThresholds]);

  useEffect(() => {
    try {
      localStorage.setItem('alertThresholds', JSON.stringify(alertThresholds));
    } catch (e) {
      console.warn('Failed to save alertThresholds to localStorage');
    }
  }, [alertThresholds]);

  // Analyze order flow with defensive guards
  const analysis = useMemo(() => {
    if (!data) return null;

    if (!Array.isArray(data.recentTrades) || data.recentTrades.length === 0) {
      return null;
    }

    const bookTicker =
      data.bookTicker &&
      typeof data.bookTicker.bidPrice === 'string' &&
      typeof data.bookTicker.askPrice === 'string'
        ? data.bookTicker
        : null;

    try {
      const classifications = classifyTrades(data.recentTrades, flowThresholds);
      const stats = calculateRollingStats(classifications, flowThresholds);
      const hasCluster = detectLargeTradeCluster(classifications);
      const currentSpread = calculateSpreadMetrics(bookTicker);
      const direction = determineBookDirection(currentSpread, memory.previousSpread, 0.01);

      return {
        classifications,
        stats,
        hasCluster,
        currentSpread,
        direction,
      };
    } catch (err) {
      console.error('Error analyzing order flow:', err);
      return null;
    }
  }, [data, flowThresholds]);

  // Update confluence events and alerts (single effect, no feedback loops)
  useEffect(() => {
    if (!analysis || !analysis.currentSpread) return;

    try {
      // Detect confluence events
      const newEvents = detectConfluenceEvents(
        analysis.stats,
        analysis.currentSpread,
        memory.previousSpread,
        analysis.direction,
        confluenceThresholds,
        prevConfluenceRef.current
      );

      // Only update state if events actually changed
      if (JSON.stringify(newEvents) !== JSON.stringify(prevConfluenceRef.current)) {
        setConfluenceEvents(newEvents);
        prevConfluenceRef.current = newEvents;
      }

      // Update memory (no re-render)
      memory.setPreviousSpread(analysis.currentSpread);

      // Generate alerts
      const currentPrice = analysis.currentSpread.midPrice;
      const currentVolume = analysis.stats.totalBuyNotional + analysis.stats.totalSellNotional;

      // Update rolling averages in memory (no re-render)
      memory.updateAvgVolume(currentVolume);
      memory.updateAvgSpread(analysis.currentSpread.spreadPercent);

      const newAlerts: OrderFlowAlert[] = [];

      const liquidationAlert = generateProxyLiquidationAlert(
        analysis.stats,
        memory.previousStats,
        currentPrice,
        memory.previousPrice,
        alertThresholds
      );
      if (liquidationAlert) newAlerts.push(liquidationAlert);

      const volumeAlert = generateVolumeSpikeAlert(analysis.stats, memory.avgVolume, alertThresholds);
      if (volumeAlert) newAlerts.push(volumeAlert);

      const spreadAlert = generateSpreadAnomalyAlert(
        analysis.currentSpread,
        memory.avgSpread,
        alertThresholds
      );
      if (spreadAlert) newAlerts.push(spreadAlert);

      // Only update alerts state if we have new alerts
      if (newAlerts.length > 0) {
        setAlerts((prev) => {
          const updated = [...newAlerts, ...prev].slice(0, 20);
          prevAlertsRef.current = updated;
          return updated;
        });
      }

      // Update memory (no re-render)
      memory.setPreviousStats(analysis.stats);
      memory.setPreviousPrice(currentPrice);
    } catch (err) {
      console.error('Error processing order flow analysis:', err);
    }
  }, [analysis, confluenceThresholds, alertThresholds]);

  // Loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">{COPY.loading}</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-neon-yellow/10 border-2 border-neon-yellow/30 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-neon-yellow" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neon-yellow">{COPY.authRequired}</h2>
            <p className="text-muted-foreground">{COPY.authMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate imbalance percent from stats
  const calculateImbalancePercent = (stats: any): number => {
    const totalFlow = stats.totalBuyNotional + stats.totalSellNotional;
    if (totalFlow === 0) return 0;
    return (stats.netDelta / totalFlow) * 100;
  };

  // Empty state when no data available
  if (!data && !isLoading && !error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/10 border-2 border-muted/30 flex items-center justify-center mx-auto">
            <Database className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{COPY.waitingForData}</h2>
            <p className="text-muted-foreground">{COPY.waitingMessage}</p>
          </div>
          <Button
            onClick={() => setEnabled(true)}
            className="bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            {COPY.enablePolling}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neon-yellow">{COPY.title}</h2>
          <p className="text-sm text-muted-foreground">
            {COPY.subtitle} - {market === 'futures' ? COPY.marketFutures : COPY.marketSpot}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <OrderFlowControlsBar
        market={market}
        onMarketChange={setMarket}
        enabled={enabled}
        onEnabledChange={setEnabled}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={refetch}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Settings Panel */}
      {showSettings && (
        <OrderFlowSection title={COPY.analysisSettings} icon={Activity} className="border-neon-cyan/30">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{COPY.largeTradeThreshold}</Label>
                <Input
                  type="number"
                  value={flowThresholds.largeTradeNotional}
                  onChange={(e) =>
                    setFlowThresholds((prev) => ({
                      ...prev,
                      largeTradeNotional: Number(e.target.value),
                    }))
                  }
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{COPY.tradeWindow}</Label>
                <Input
                  type="number"
                  value={flowThresholds.rollingWindowTrades}
                  onChange={(e) =>
                    setFlowThresholds((prev) => ({
                      ...prev,
                      rollingWindowTrades: Number(e.target.value),
                    }))
                  }
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{COPY.timeWindow}</Label>
                <Input
                  type="number"
                  value={flowThresholds.rollingWindowMinutes}
                  onChange={(e) =>
                    setFlowThresholds((prev) => ({
                      ...prev,
                      rollingWindowMinutes: Number(e.target.value),
                    }))
                  }
                  className="terminal-input"
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">{COPY.minImbalance}</Label>
                <Input
                  type="number"
                  value={confluenceThresholds.minImbalancePercent}
                  onChange={(e) =>
                    setConfluenceThresholds((prev) => ({
                      ...prev,
                      minImbalancePercent: Number(e.target.value),
                    }))
                  }
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{COPY.minSpreadChange}</Label>
                <Input
                  type="number"
                  value={confluenceThresholds.minSpreadChangePercent}
                  onChange={(e) =>
                    setConfluenceThresholds((prev) => ({
                      ...prev,
                      minSpreadChangePercent: Number(e.target.value),
                    }))
                  }
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{COPY.pollingInterval}</Label>
                <Input
                  type="number"
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(Math.max(1000, Number(e.target.value)))}
                  className="terminal-input"
                  min={1000}
                  step={1000}
                />
              </div>
            </div>
          </div>
        </OrderFlowSection>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {data && analysis && (
        <>
          {/* Overview Section */}
          <OrderFlowSection title={COPY.overview} icon={BarChart3}>
            <OrderFlowStatGrid
              stats={[
                {
                  label: COPY.currentPrice,
                  value: data.ticker ? (
                    <span className="text-neon-cyan">
                      ${parseFloat(data.ticker.lastPrice).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  ),
                },
                {
                  label: COPY.spread,
                  value: analysis.currentSpread ? (
                    <span className="text-neon-yellow">
                      {analysis.currentSpread.spreadPercent.toFixed(3)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  ),
                },
                {
                  label: COPY.volume24h,
                  value: data.ticker ? (
                    <span className="text-neon-green">
                      {formatCurrency(parseFloat(data.ticker.quoteVolume))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  ),
                },
              ]}
            />
          </OrderFlowSection>

          {/* Flow & Imbalance Section */}
          <OrderFlowSection title={COPY.flowImbalance} icon={Activity}>
            <OrderFlowStatGrid
              columns={4}
              stats={[
                {
                  label: COPY.buyFlow,
                  value: <span className="text-neon-green">{formatCurrency(analysis.stats.totalBuyNotional)}</span>,
                  icon: <TrendingUp className="w-4 h-4 text-neon-green" />,
                },
                {
                  label: COPY.sellFlow,
                  value: <span className="text-neon-pink">{formatCurrency(analysis.stats.totalSellNotional)}</span>,
                  icon: <TrendingDown className="w-4 h-4 text-neon-pink" />,
                },
                {
                  label: COPY.netDelta,
                  value: (
                    <span
                      className={
                        analysis.stats.netDelta > 0
                          ? 'text-neon-green'
                          : analysis.stats.netDelta < 0
                          ? 'text-neon-pink'
                          : 'text-muted-foreground'
                      }
                    >
                      {formatCurrency(analysis.stats.netDelta)}
                    </span>
                  ),
                },
                {
                  label: COPY.imbalance,
                  value: (
                    <span
                      className={
                        calculateImbalancePercent(analysis.stats) > 0
                          ? 'text-neon-green'
                          : calculateImbalancePercent(analysis.stats) < 0
                          ? 'text-neon-pink'
                          : 'text-muted-foreground'
                      }
                    >
                      {calculateImbalancePercent(analysis.stats).toFixed(1)}%
                    </span>
                  ),
                },
              ]}
            />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {COPY.largeOrders}
                  </span>
                  <Zap className="w-4 h-4 text-neon-yellow" />
                </div>
                <div className="text-xl font-bold">{analysis.stats.largeTradeCount}</div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {COPY.clusterDetected}
                  </span>
                </div>
                <div className="text-xl font-bold">
                  {analysis.hasCluster ? (
                    <span className="text-neon-pink">{COPY.clusterDetected}</span>
                  ) : (
                    <span className="text-muted-foreground">{COPY.noCluster}</span>
                  )}
                </div>
              </div>
            </div>
          </OrderFlowSection>

          {/* Confluence Events */}
          <ConfluencePanel events={confluenceEvents} />

          {/* Alerts */}
          <AlertsPanel alerts={alerts} onClearAlerts={() => setAlerts([])} />
        </>
      )}
    </div>
  );
}
