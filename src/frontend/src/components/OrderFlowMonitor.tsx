/**
 * Order Flow Monitor Component
 * Real-time BTC order flow analysis for Spot and Futures markets with defensive error handling
 */

import { useState, useEffect, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useBinanceOrderFlow } from '../hooks/useBinanceOrderFlow';
import { MarketType } from '../lib/binanceOrderFlowRest';
import { 
  classifyTrades, 
  calculateRollingStats, 
  detectLargeTradeCluster,
  OrderFlowThresholds,
  TradeClassification 
} from '../lib/orderFlowAnalysis';
import {
  calculateSpreadMetrics,
  determineBookDirection,
  detectConfluenceEvents,
  ConfluenceEvent,
  ConfluenceThresholds,
  SpreadMetrics
} from '../lib/bookConfluence';
import {
  generateProxyLiquidationAlert,
  generateVolumeSpikeAlert,
  generateSpreadAnomalyAlert,
  OrderFlowAlert,
  AlertThresholds
} from '../lib/orderFlowAlerts';
import {
  safeJsonParse,
  validateOrderFlowThresholds,
  validateConfluenceThresholds,
  validateAlertThresholds,
} from '../utils/safeJson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lock, 
  RefreshCw,
  Settings,
  Zap,
  Target,
  Bell,
  BellOff,
  Database
} from 'lucide-react';

export default function OrderFlowMonitor() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Market selection
  const [market, setMarket] = useState<MarketType>('futures');
  
  // Polling configuration
  const [pollingInterval, setPollingInterval] = useState(3000); // 3 seconds
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

  // State for confluence and alerts
  const [confluenceEvents, setConfluenceEvents] = useState<ConfluenceEvent[]>([]);
  const [alerts, setAlerts] = useState<OrderFlowAlert[]>([]);
  const [previousSpread, setPreviousSpread] = useState<SpreadMetrics | null>(null);
  const [previousStats, setPreviousStats] = useState<any>(null);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [avgVolume, setAvgVolume] = useState<number>(0);
  const [avgSpread, setAvgSpread] = useState<number>(0);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);

  // Fetch order flow data
  const { data, isLoading, error, lastUpdated, refetch } = useBinanceOrderFlow({
    market,
    pollingInterval,
    enabled: enabled && isAuthenticated,
  });

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

    // Guard: ensure recentTrades is a valid array
    if (!Array.isArray(data.recentTrades) || data.recentTrades.length === 0) {
      return null;
    }

    // Guard: ensure bookTicker is valid or null
    const bookTicker = data.bookTicker && 
      typeof data.bookTicker.bidPrice === 'string' && 
      typeof data.bookTicker.askPrice === 'string'
      ? data.bookTicker
      : null;

    try {
      const classifications = classifyTrades(data.recentTrades, flowThresholds);
      const stats = calculateRollingStats(classifications, flowThresholds);
      const hasCluster = detectLargeTradeCluster(classifications);
      const currentSpread = calculateSpreadMetrics(bookTicker);
      const direction = determineBookDirection(currentSpread, previousSpread, 0.01);

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
  }, [data, flowThresholds, previousSpread]);

  // Update confluence events
  useEffect(() => {
    if (!analysis || !analysis.currentSpread) return;

    try {
      const newEvents = detectConfluenceEvents(
        analysis.stats,
        analysis.currentSpread,
        previousSpread,
        analysis.direction,
        confluenceThresholds,
        confluenceEvents
      );

      if (newEvents.length !== confluenceEvents.length) {
        setConfluenceEvents(newEvents);
      }

      setPreviousSpread(analysis.currentSpread);
    } catch (err) {
      console.error('Error detecting confluence events:', err);
    }
  }, [analysis]);

  // Update alerts
  useEffect(() => {
    if (!analysis || !analysis.currentSpread) return;

    try {
      const currentPrice = analysis.currentSpread.midPrice;
      const currentVolume = analysis.stats.totalBuyNotional + analysis.stats.totalSellNotional;

      // Update rolling averages
      if (avgVolume === 0) {
        setAvgVolume(currentVolume);
      } else {
        setAvgVolume(prev => prev * 0.95 + currentVolume * 0.05);
      }

      if (avgSpread === 0) {
        setAvgSpread(analysis.currentSpread.spreadPercent);
      } else {
        setAvgSpread(prev => prev * 0.95 + analysis.currentSpread!.spreadPercent * 0.05);
      }

      // Generate alerts
      const newAlerts: OrderFlowAlert[] = [];

      const liquidationAlert = generateProxyLiquidationAlert(
        analysis.stats,
        previousStats,
        currentPrice,
        previousPrice,
        alertThresholds
      );
      if (liquidationAlert) newAlerts.push(liquidationAlert);

      const volumeAlert = generateVolumeSpikeAlert(analysis.stats, avgVolume, alertThresholds);
      if (volumeAlert) newAlerts.push(volumeAlert);

      const spreadAlert = generateSpreadAnomalyAlert(analysis.currentSpread, avgSpread, alertThresholds);
      if (spreadAlert) newAlerts.push(spreadAlert);

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
      }

      setPreviousStats(analysis.stats);
      setPreviousPrice(currentPrice);
    } catch (err) {
      console.error('Error generating alerts:', err);
    }
  }, [analysis]);

  // Loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
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
            <h2 className="text-2xl font-bold text-neon-yellow">Autenticação Necessária</h2>
            <p className="text-muted-foreground">
              Faça login com Internet Identity para acessar o Monitor de Fluxo de Ordens.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
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
            <h2 className="text-2xl font-bold">Aguardando Dados</h2>
            <p className="text-muted-foreground">
              Ative o polling para começar a receber dados de fluxo de ordens.
            </p>
          </div>
          <Button
            onClick={() => setEnabled(true)}
            className="bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/50"
          >
            <Activity className="w-4 h-4 mr-2" />
            Ativar Polling
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
          <h2 className="text-2xl font-bold text-neon-yellow">Monitor de Fluxo de Ordens</h2>
          <p className="text-sm text-muted-foreground">
            Análise em tempo real de ordens BTC - {market === 'futures' ? 'Futuros' : 'Spot'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Market Toggle */}
      <Card className="terminal-panel">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Mercado:</Label>
              <div className="flex gap-2">
                <Button
                  variant={market === 'futures' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMarket('futures')}
                  className={market === 'futures' ? 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50' : ''}
                >
                  Futuros
                </Button>
                <Button
                  variant={market === 'spot' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMarket('spot')}
                  className={market === 'spot' ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50' : ''}
                >
                  Spot
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                id="polling-toggle"
              />
              <Label htmlFor="polling-toggle" className="text-sm">
                {enabled ? 'Polling Ativo' : 'Polling Pausado'}
              </Label>
              {lastUpdated && (
                <Badge variant="outline" className="text-xs">
                  Última atualização: {formatTime(lastUpdated)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="terminal-panel border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="text-neon-cyan flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações de Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Threshold Ordem Grande (USD)</Label>
                <Input
                  type="number"
                  value={flowThresholds.largeTradeNotional}
                  onChange={(e) => setFlowThresholds(prev => ({ ...prev, largeTradeNotional: Number(e.target.value) }))}
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Janela de Trades</Label>
                <Input
                  type="number"
                  value={flowThresholds.rollingWindowTrades}
                  onChange={(e) => setFlowThresholds(prev => ({ ...prev, rollingWindowTrades: Number(e.target.value) }))}
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Janela de Tempo (min)</Label>
                <Input
                  type="number"
                  value={flowThresholds.rollingWindowMinutes}
                  onChange={(e) => setFlowThresholds(prev => ({ ...prev, rollingWindowMinutes: Number(e.target.value) }))}
                  className="terminal-input"
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Imbalance Mínimo (%)</Label>
                <Input
                  type="number"
                  value={confluenceThresholds.minImbalancePercent}
                  onChange={(e) => setConfluenceThresholds(prev => ({ ...prev, minImbalancePercent: Number(e.target.value) }))}
                  className="terminal-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Mudança Spread Mínima (%)</Label>
                <Input
                  type="number"
                  value={confluenceThresholds.minSpreadChangePercent}
                  onChange={(e) => setConfluenceThresholds(prev => ({ ...prev, minSpreadChangePercent: Number(e.target.value) }))}
                  className="terminal-input"
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={alertThresholds.enabled}
                  onCheckedChange={(checked) => setAlertThresholds(prev => ({ ...prev, enabled: checked }))}
                  id="alerts-toggle"
                />
                <Label htmlFor="alerts-toggle">Alertas Ativos</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFlowThresholds(validateOrderFlowThresholds(null));
                  setConfluenceThresholds(validateConfluenceThresholds(null));
                  setAlertThresholds(validateAlertThresholds(null));
                }}
              >
                Restaurar Padrões
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert className="border-neon-pink/30 bg-neon-pink/5">
          <AlertTriangle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="text-neon-pink">
            {error}
            {market === 'spot' && ' - Tente mudar para Futuros se o problema persistir.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty Analysis State */}
      {!analysis && data && !isLoading && (
        <Alert className="border-neon-yellow/30 bg-neon-yellow/5">
          <Database className="h-4 w-4 text-neon-yellow" />
          <AlertDescription className="text-neon-yellow">
            Dados insuficientes para análise. Aguardando mais trades...
          </AlertDescription>
        </Alert>
      )}

      {/* Main Analysis Panels */}
      {analysis && analysis.currentSpread && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Flow Analysis */}
          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Análise de Fluxo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Compra Total</p>
                  <p className="text-lg font-bold text-neon-green">
                    {formatCurrency(analysis.stats.totalBuyNotional)}
                  </p>
                  <p className="text-xs text-muted-foreground">{analysis.stats.buyCount} trades</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Venda Total</p>
                  <p className="text-lg font-bold text-neon-pink">
                    {formatCurrency(analysis.stats.totalSellNotional)}
                  </p>
                  <p className="text-xs text-muted-foreground">{analysis.stats.sellCount} trades</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delta Líquido</span>
                  <span className={`text-sm font-bold ${analysis.stats.netDelta > 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                    {analysis.stats.netDelta > 0 ? '+' : ''}{formatCurrency(analysis.stats.netDelta)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ordens Grandes</span>
                  <Badge variant="outline" className="text-neon-yellow border-neon-yellow/30">
                    {analysis.stats.largeTradeCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tamanho Médio</span>
                  <span className="text-sm">{formatCurrency(analysis.stats.avgTradeSize)}</span>
                </div>
              </div>
              {analysis.hasCluster && (
                <Alert className="border-neon-yellow/30 bg-neon-yellow/5">
                  <Zap className="h-4 w-4 text-neon-yellow" />
                  <AlertDescription className="text-xs text-neon-yellow">
                    Cluster de ordens grandes detectado!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Book Metrics */}
          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center gap-2">
                <Target className="w-5 h-5" />
                Métricas do Book
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Melhor Bid</p>
                  <p className="text-lg font-bold text-neon-green">
                    ${analysis.currentSpread.bidPrice.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Melhor Ask</p>
                  <p className="text-lg font-bold text-neon-pink">
                    ${analysis.currentSpread.askPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Preço Médio</span>
                  <span className="text-sm font-bold">${analysis.currentSpread.midPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Spread</span>
                  <span className="text-sm">${analysis.currentSpread.spread.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Spread %</span>
                  <span className="text-sm">{analysis.currentSpread.spreadPercent.toFixed(4)}%</span>
                </div>
              </div>
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tendência Bid:</span>
                  <Badge variant="outline" className="text-xs">
                    {analysis.direction.bidTrend === 'up' && <TrendingUp className="w-3 h-3 mr-1 text-neon-green" />}
                    {analysis.direction.bidTrend === 'down' && <TrendingDown className="w-3 h-3 mr-1 text-neon-pink" />}
                    {analysis.direction.bidTrend}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tendência Ask:</span>
                  <Badge variant="outline" className="text-xs">
                    {analysis.direction.askTrend === 'up' && <TrendingUp className="w-3 h-3 mr-1 text-neon-green" />}
                    {analysis.direction.askTrend === 'down' && <TrendingDown className="w-3 h-3 mr-1 text-neon-pink" />}
                    {analysis.direction.askTrend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confluence Events */}
          <Card className="terminal-panel lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Eventos de Confluência
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confluenceEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento de confluência detectado
                </p>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {confluenceEvents.map((event) => (
                      <Alert
                        key={event.id}
                        className={`border-${
                          event.type === 'buy_confluence' ? 'neon-green' : 'neon-pink'
                        }/30 bg-${
                          event.type === 'buy_confluence' ? 'neon-green' : 'neon-pink'
                        }/5`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {event.type === 'buy_confluence' ? (
                                <TrendingUp className="w-4 h-4 text-neon-green" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-neon-pink" />
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  event.severity === 'high'
                                    ? 'border-neon-yellow text-neon-yellow'
                                    : event.severity === 'medium'
                                    ? 'border-neon-orange text-neon-orange'
                                    : ''
                                }`}
                              >
                                {event.severity}
                              </Badge>
                            </div>
                            <AlertDescription className="text-xs">
                              {event.description}
                            </AlertDescription>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="terminal-panel lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-neon-orange flex items-center gap-2">
                  {alertThresholds.enabled ? (
                    <Bell className="w-5 h-5" />
                  ) : (
                    <BellOff className="w-5 h-5" />
                  )}
                  Alertas de Mercado
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {alerts.length} alertas
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!alertThresholds.enabled ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Alertas desativados. Ative nas configurações.
                </p>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum alerta gerado
                </p>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <Alert
                        key={alert.id}
                        className={`border-${
                          alert.severity === 'high'
                            ? 'neon-pink'
                            : alert.severity === 'medium'
                            ? 'neon-orange'
                            : 'neon-yellow'
                        }/30 bg-${
                          alert.severity === 'high'
                            ? 'neon-pink'
                            : alert.severity === 'medium'
                            ? 'neon-orange'
                            : 'neon-yellow'
                        }/5`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle
                                className={`w-4 h-4 ${
                                  alert.severity === 'high'
                                    ? 'text-neon-pink'
                                    : alert.severity === 'medium'
                                    ? 'text-neon-orange'
                                    : 'text-neon-yellow'
                                }`}
                              />
                              <Badge variant="outline" className="text-xs">
                                {alert.type}
                              </Badge>
                            </div>
                            <AlertDescription className="text-xs">
                              {alert.description}
                            </AlertDescription>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
