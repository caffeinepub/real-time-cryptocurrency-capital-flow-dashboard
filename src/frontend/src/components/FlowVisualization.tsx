import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Activity, AlertCircle, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useCapitalFlows } from '../hooks/useQueries';
import { useBinanceData } from '../hooks/useBinanceData';
import type { CapitalFlow } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatPercentage, formatNumber, roundToTwoDecimals } from '../lib/formatters';

export default function FlowVisualization() {
  const { data: flows, isLoading, error } = useCapitalFlows();
  const { isLive, hasData, marketData } = useBinanceData();
  const [animatedFlows, setAnimatedFlows] = useState<CapitalFlow[]>([]);
  const [interpretationSummary, setInterpretationSummary] = useState<string>('');

  useEffect(() => {
    if (flows && Array.isArray(flows)) {
      setAnimatedFlows(flows);
    }
  }, [flows]);

  // Generate synthetic flows from live Binance data when backend has no data
  useEffect(() => {
    if ((!flows || flows.length === 0) && marketData.length > 0) {
      const syntheticFlows: CapitalFlow[] = marketData.map(data => ({
        fromAsset: {
          symbol: 'USD',
          name: 'Dólar Americano',
          usdValue: 1.0,
        },
        toAsset: {
          symbol: data.symbol.replace('USDT', ''),
          name: data.symbol.replace('USDT', ''),
          usdValue: roundToTwoDecimals(data.price),
        },
        amount: roundToTwoDecimals(data.quoteVolume),
        timestamp: BigInt(data.lastUpdate),
        flowIntensity: roundToTwoDecimals(Math.min(1, Math.abs(data.priceChangePercent) / 10)),
        pnlRatio: roundToTwoDecimals(data.priceChangePercent / 100),
        marketImpact: roundToTwoDecimals(Math.min(1, data.volume / 1000000)),
      }));
      setAnimatedFlows(syntheticFlows);
    }
  }, [flows, marketData]);

  // Generate interpretation summary based on flow data
  useEffect(() => {
    if (animatedFlows.length > 0) {
      const btcFlow = animatedFlows.find(f => f.toAsset.symbol === 'BTC');
      const ethFlow = animatedFlows.find(f => f.toAsset.symbol === 'ETH');
      
      // Calculate total altcoin flow (excluding BTC and ETH)
      const altcoinFlows = animatedFlows.filter(f => 
        f.toAsset.symbol !== 'BTC' && f.toAsset.symbol !== 'ETH'
      );
      const totalAltcoinIntensity = altcoinFlows.reduce((sum, f) => sum + f.flowIntensity, 0);
      const avgAltcoinIntensity = altcoinFlows.length > 0 ? totalAltcoinIntensity / altcoinFlows.length : 0;

      // Determine dominant flow
      if (btcFlow && btcFlow.flowIntensity > 0.6) {
        setInterpretationSummary('Capital migrando para BTC');
      } else if (ethFlow && ethFlow.flowIntensity > 0.6) {
        setInterpretationSummary('Capital concentrando em ETH');
      } else if (avgAltcoinIntensity > 0.5) {
        setInterpretationSummary('Altcoins ganhando influxo');
      } else if (btcFlow && ethFlow && btcFlow.flowIntensity > 0.4 && ethFlow.flowIntensity > 0.4) {
        setInterpretationSummary('Fluxo distribuído entre principais ativos');
      } else {
        setInterpretationSummary('Mercado em consolidação');
      }
    }
  }, [animatedFlows]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Carregando dados de fluxo de capital...</p>
        </div>
      </div>
    );
  }

  const calculatePercentages = () => {
    if (!animatedFlows || animatedFlows.length === 0) return [];
    const total = animatedFlows.reduce((sum, flow) => sum + flow.amount, 0);
    return animatedFlows.map(flow => ({
      ...flow,
      percentage: roundToTwoDecimals(total > 0 ? (flow.amount / total) * 100 : 0)
    }));
  };

  const flowsWithPercentages = calculatePercentages();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
            Fluxo de Capital
          </h2>
          <p className="text-muted-foreground mt-1">Movimentação de capital USD para criptomoedas em tempo real</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
          <Activity className={`w-4 h-4 text-neon-cyan ${isLive ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium text-neon-cyan">{isLive ? 'Ao Vivo' : 'Cache'}</span>
        </div>
      </div>

      {/* Interpretation Summary */}
      {interpretationSummary && (
        <div className="bg-gradient-to-r from-neon-cyan/10 via-neon-blue/10 to-neon-purple/10 border border-neon-cyan/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center animate-pulse-slow">
              <Activity className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Interpretação em Tempo Real</p>
              <p className="text-lg font-semibold text-foreground">{interpretationSummary}</p>
            </div>
          </div>
        </div>
      )}

      {!isLive && !hasData && (
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="text-neon-pink">
            Não foi possível conectar à API Binance. Exibindo dados em cache. Tentando reconectar...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="text-neon-pink">
            Erro ao carregar dados: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      )}

      {flowsWithPercentages.length === 0 ? (
        <div className="text-center py-16 bg-card/50 rounded-xl border border-border/50">
          <Activity className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhum dado de fluxo de capital disponível ainda</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            {isLive ? 'Os dados de fluxo aparecerão aqui em tempo real' : 'Aguardando dados de mercado...'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {flowsWithPercentages.map((flow, index) => (
            <FlowCard key={`${flow.toAsset.symbol}-${index}`} flow={flow} index={index} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <StatCard
          title="Total de Fluxos"
          value={animatedFlows.length.toString()}
          icon={<Activity className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          title="Volume Total"
          value={formatCurrency(animatedFlows.reduce((sum, f) => sum + f.amount, 0))}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Intensidade Média"
          value={
            animatedFlows.length > 0
              ? formatNumber(animatedFlows.reduce((sum, f) => sum + f.flowIntensity, 0) / animatedFlows.length)
              : formatNumber(0)
          }
          icon={<TrendingDown className="w-5 h-5" />}
          color="green"
        />
      </div>
    </div>
  );
}

interface FlowCardProps {
  flow: CapitalFlow & { percentage?: number };
  index: number;
}

function FlowCard({ flow, index }: FlowCardProps) {
  const getIntensityStyles = () => {
    if (flow.flowIntensity > 0.7) {
      return {
        color: 'text-neon-green',
        bg: 'bg-neon-green/10',
        border: 'border-neon-green/30',
        shadow: 'shadow-neon-green-sm',
        gradient: 'from-neon-green/50 to-neon-green',
        glow: 'bg-neon-green/5 group-hover:bg-neon-green/10'
      };
    } else if (flow.flowIntensity > 0.4) {
      return {
        color: 'text-neon-blue',
        bg: 'bg-neon-blue/10',
        border: 'border-neon-blue/30',
        shadow: 'shadow-neon-blue-sm',
        gradient: 'from-neon-blue/50 to-neon-blue',
        glow: 'bg-neon-blue/5 group-hover:bg-neon-blue/10'
      };
    }
    return {
      color: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/30',
      shadow: 'shadow-neon-cyan-sm',
      gradient: 'from-neon-cyan/50 to-neon-cyan',
      glow: 'bg-neon-cyan/5 group-hover:bg-neon-cyan/10'
    };
  };

  const styles = getIntensityStyles();

  // Determine flow direction indicator
  const getFlowIndicator = () => {
    if (flow.flowIntensity > 0.7) {
      return { icon: ArrowUp, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', label: 'Influxo Forte', emoji: '🟢' };
    } else if (flow.flowIntensity > 0.4) {
      return { icon: RefreshCw, color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/30', label: 'Transição', emoji: '🔁' };
    } else {
      return { icon: ArrowDown, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30', label: 'Fluxo Fraco', emoji: '🔴' };
    }
  };

  const indicator = getFlowIndicator();
  const IndicatorIcon = indicator.icon;

  return (
    <div
      className="group relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-neon-cyan-sm animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground">{flow.fromAsset.symbol}</div>
              <div className="text-xs text-muted-foreground/70">{flow.fromAsset.name}</div>
            </div>
            <ArrowRight className={`w-6 h-6 ${styles.color} animate-pulse-slow`} />
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">{flow.toAsset.symbol}</div>
              <div className="text-xs text-muted-foreground/70">{flow.toAsset.name}</div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground animate-pulse-slow">{formatCurrency(flow.amount)}</div>
          {flow.percentage !== undefined && (
            <div className="text-sm text-muted-foreground">{formatNumber(flow.percentage)}% do total</div>
          )}
        </div>
      </div>

      {/* Symbolic Indicator */}
      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${indicator.bg} border ${indicator.border}`}>
        <span className="text-xl">{indicator.emoji}</span>
        <IndicatorIcon className={`w-4 h-4 ${indicator.color} animate-pulse`} />
        <span className={`text-sm font-medium ${indicator.color}`}>{indicator.label}</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Intensidade do Fluxo</span>
            <span className={`font-medium ${styles.color} animate-pulse-slow`}>{formatPercentage(flow.flowIntensity)}</span>
          </div>
          <div className="h-2 bg-accent/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${styles.gradient} transition-all duration-1000 ${styles.shadow} animate-pulse-slow`}
              style={{ width: `${flow.flowIntensity * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>De: {formatCurrency(flow.fromAsset.usdValue)}</span>
          <span>Para: {formatCurrency(flow.toAsset.usdValue)}</span>
        </div>
      </div>

      <div className={`absolute top-0 right-0 w-24 h-24 ${styles.glow} rounded-full blur-3xl -z-10 transition-all duration-500 animate-pulse-slow`}></div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'cyan' | 'blue' | 'green';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    cyan: {
      text: 'text-neon-cyan',
      border: 'hover:border-neon-cyan/50'
    },
    blue: {
      text: 'text-neon-blue',
      border: 'hover:border-neon-blue/50'
    },
    green: {
      text: 'text-neon-green',
      border: 'hover:border-neon-green/50'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 ${classes.border} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={classes.text}>{icon}</div>
      </div>
      <div className={`text-3xl font-bold ${classes.text} animate-pulse-slow`}>{value}</div>
    </div>
  );
}
