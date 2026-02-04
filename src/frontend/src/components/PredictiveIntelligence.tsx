import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, Crosshair, RefreshCw, Loader2 } from 'lucide-react';
import { usePredictiveProjections } from '../hooks/useQueries';
import { useBinanceData } from '../hooks/useBinanceData';
import { useProjectionsSyncGate } from '../hooks/useProjectionsSyncGate';
import type { PredictiveProjection, TargetLevel } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState, useMemo } from 'react';
import { formatCurrency, formatPercentage, roundToTwoDecimals } from '../lib/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTargetMultipliers, normalizeToBaseSymbol } from '../lib/symbols';
import { 
  sanitizeProjections, 
  generateSyntheticProjections,
  generateDeterministicTargets,
  isValidTargetLevel
} from '../lib/projections';

export default function PredictiveIntelligence() {
  const backendQuery = usePredictiveProjections();
  const { isLive, hasData, marketData } = useBinanceData();
  
  // Synchronization gate
  const syncState = useProjectionsSyncGate({
    binanceHasData: hasData,
    binanceIsLive: isLive,
    backendQuery,
    syncTimeoutMs: 8000,
    noDataTimeoutMs: 15000,
  });

  const [displayProjections, setDisplayProjections] = useState<PredictiveProjection[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize sanitized backend projections
  const sanitizedBackendProjections = useMemo(() => {
    return sanitizeProjections(backendQuery.data);
  }, [backendQuery.data]);

  // Memoize synthetic projections
  const syntheticProjections = useMemo(() => {
    return generateSyntheticProjections(marketData);
  }, [marketData]);

  // Select display projections with safe fallback chain
  useEffect(() => {
    try {
      // Prefer sanitized backend projections when valid
      if (sanitizedBackendProjections.length > 0) {
        setDisplayProjections(sanitizedBackendProjections);
        return;
      }

      // Fallback to synthetic projections from Binance
      if (syntheticProjections.length > 0) {
        setDisplayProjections(syntheticProjections);
        return;
      }

      // No data available
      setDisplayProjections([]);
    } catch (err) {
      console.error('Error selecting display projections:', err);
      setDisplayProjections([]);
    }
  }, [sanitizedBackendProjections, syntheticProjections]);

  // Track background refresh state
  useEffect(() => {
    if (backendQuery.isFetching && displayProjections.length > 0) {
      setIsRefreshing(true);
    } else {
      setIsRefreshing(false);
    }
  }, [backendQuery.isFetching, displayProjections.length]);

  // Safe retry handler
  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      await backendQuery.refetch();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  // Show sync loading state until ready
  if (syncState.isSyncing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Projeções de Inteligência Preditiva
            </h2>
            <p className="text-muted-foreground mt-1">
              Previsões de tendências com delimitação de alvos baseada em análise técnica
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 bg-card/50 rounded-xl border border-border/50">
          <Loader2 className="w-12 h-12 text-neon-blue animate-spin mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">{syncState.syncMessage}</p>
          <p className="text-sm text-muted-foreground">
            Aguardando sincronização de dados de mercado e backend...
          </p>
        </div>
      </div>
    );
  }

  // Show no market data error state
  if (syncState.hasNoMarketData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Projeções de Inteligência Preditiva
            </h2>
            <p className="text-muted-foreground mt-1">
              Previsões de tendências com delimitação de alvos baseada em análise técnica
            </p>
          </div>
        </div>
        
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-neon-pink">
              Não foi possível obter dados de mercado. Verifique sua conexão e tente novamente.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4 border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10"
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Projeções de Inteligência Preditiva
          </h2>
          <p className="text-muted-foreground mt-1">
            Previsões de tendências com delimitação de alvos baseada em análise técnica
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isRefreshing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
              <Loader2 className="w-3 h-3 text-neon-cyan animate-spin" />
              <span className="text-xs font-medium text-neon-cyan">Atualizando...</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
            <Target className={`w-4 h-4 text-neon-blue ${isLive ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-neon-blue">{isLive ? 'Ativo' : 'Cache'}</span>
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {!isLive && !hasData && (
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="text-neon-pink">
            Não foi possível conectar à API Binance. Exibindo previsões em cache. Tentando reconectar...
          </AlertDescription>
        </Alert>
      )}

      {/* Backend Error State */}
      {backendQuery.error && sanitizedBackendProjections.length === 0 && syntheticProjections.length === 0 && (
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-neon-pink">
              Erro ao carregar previsões: {backendQuery.error instanceof Error ? backendQuery.error.message : 'Erro desconhecido'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4 border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10"
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Synthetic Data Notice */}
      {displayProjections.length > 0 && sanitizedBackendProjections.length === 0 && syntheticProjections.length > 0 && (
        <Alert className="border-neon-cyan/50 bg-neon-cyan/10">
          <AlertCircle className="h-4 w-4 text-neon-cyan" />
          <AlertDescription className="text-neon-cyan">
            Exibindo projeções sintéticas geradas a partir de dados de mercado em tempo real.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {displayProjections.length === 0 ? (
        <div className="text-center py-16 bg-card/50 rounded-xl border border-border/50">
          <Target className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-2">Nenhuma projeção preditiva disponível ainda</p>
          <p className="text-sm text-muted-foreground/70 mb-4">
            {isLive ? 'As projeções aparecerão conforme os dados se acumulam' : 'Aguardando dados de mercado...'}
          </p>
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10"
          >
            {isRetrying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Recarregar
          </Button>
        </div>
      ) : (
        /* Projections Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayProjections.map((projection, index) => (
            <ProjectionCard 
              key={`${projection.asset.symbol}-${index}`} 
              projection={projection} 
              index={index} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectionCardProps {
  projection: PredictiveProjection;
  index: number;
}

function ProjectionCard({ projection, index }: ProjectionCardProps) {
  // Safe extraction with validated data
  const symbol = projection.asset.symbol;
  const name = projection.asset.name || symbol;
  const currentPrice = roundToTwoDecimals(projection.asset.usdValue);
  const trend = projection.trend;
  const confidenceLevel = Math.max(0, Math.min(1, projection.confidenceLevel));
  const timeHorizon = Number(projection.timeHorizon);

  // Safe target levels processing with deterministic fallback
  let targetLevels = Array.isArray(projection.targetLevels)
    ? projection.targetLevels.filter(isValidTargetLevel)
    : [];

  // Generate deterministic fallback targets if none exist
  if (targetLevels.length === 0 && currentPrice > 0) {
    targetLevels = generateDeterministicTargets(symbol, currentPrice, trend, confidenceLevel);
  }

  const getTrendStyles = () => {
    const trendLower = trend.toLowerCase();
    if (trendLower.includes('up') || trendLower.includes('alta') || trendLower.includes('bullish')) {
      return {
        icon: TrendingUp,
        color: 'text-neon-green',
        bg: 'bg-neon-green/20',
        border: 'border-neon-green/50',
        glow: 'bg-neon-green/5'
      };
    } else if (trendLower.includes('down') || trendLower.includes('baixa') || trendLower.includes('bearish')) {
      return {
        icon: TrendingDown,
        color: 'text-neon-pink',
        bg: 'bg-neon-pink/20',
        border: 'border-neon-pink/50',
        glow: 'bg-neon-pink/5'
      };
    }
    return {
      icon: Minus,
      color: 'text-neon-blue',
      bg: 'bg-neon-blue/20',
      border: 'border-neon-blue/50',
      glow: 'bg-neon-blue/5'
    };
  };

  const getConfidenceStyles = () => {
    if (confidenceLevel > 0.7) {
      return {
        color: 'text-neon-green',
        gradient: 'from-neon-green/50 to-neon-green',
        shadow: 'shadow-neon-green-sm'
      };
    } else if (confidenceLevel > 0.4) {
      return {
        color: 'text-neon-blue',
        gradient: 'from-neon-blue/50 to-neon-blue',
        shadow: 'shadow-neon-blue-sm'
      };
    }
    return {
      color: 'text-neon-cyan',
      gradient: 'from-neon-cyan/50 to-neon-cyan',
      shadow: 'shadow-neon-cyan-sm'
    };
  };

  const trendStyles = getTrendStyles();
  const confidenceStyles = getConfidenceStyles();
  const TrendIcon = trendStyles.icon;

  // Sort targets safely
  const sortedTargets = [...targetLevels].sort((a, b) => {
    const isUptrend = trend.toLowerCase().includes('alta') || trend.toLowerCase().includes('up');
    return isUptrend ? a.priceLevel - b.priceLevel : b.priceLevel - a.priceLevel;
  });

  const hasValidTargets = sortedTargets.length > 0 && currentPrice > 0;

  return (
    <div
      className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 hover:border-neon-blue/50 transition-all duration-300 hover:shadow-neon-blue-sm"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendIcon className={`w-6 h-6 ${trendStyles.color}`} />
          <div>
            <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${trendStyles.bg} border ${trendStyles.border}`}>
          <span className={`text-xs font-medium ${trendStyles.color}`}>{trend}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Confidence Level */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Nível de Confiança</span>
            <span className={`font-bold ${confidenceStyles.color}`}>
              {formatPercentage(confidenceLevel)}
            </span>
          </div>
          <div className="h-3 bg-accent/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${confidenceStyles.gradient} transition-all duration-1000 ${confidenceStyles.shadow}`}
              style={{ width: `${confidenceLevel * 100}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Horizonte Temporal</p>
            <p className="text-lg font-bold text-foreground">{timeHorizon}h</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Valor Atual</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(currentPrice)}</p>
          </div>
        </div>

        {/* Target Levels Section */}
        {hasValidTargets ? (
          <TargetLevelsSection 
            targets={sortedTargets} 
            currentPrice={currentPrice} 
            trend={trend}
          />
        ) : (
          <EmptyTargetsSection />
        )}
      </div>

      <div className={`absolute bottom-0 left-0 w-32 h-32 ${trendStyles.glow} rounded-full blur-3xl -z-10`} />
    </div>
  );
}

interface TargetLevelsSectionProps {
  targets: TargetLevel[];
  currentPrice: number;
  trend: string;
}

function TargetLevelsSection({ targets, currentPrice, trend }: TargetLevelsSectionProps) {
  const getTargetColorClass = (levelType: string): string => {
    const type = levelType.toLowerCase();
    if (type.includes('acumulação') || type.includes('suporte')) return 'text-neon-green';
    if (type.includes('resistência') || type.includes('liquidação')) return 'text-neon-pink';
    return 'text-neon-cyan';
  };

  const getTargetBgClass = (levelType: string): string => {
    const type = levelType.toLowerCase();
    if (type.includes('acumulação') || type.includes('suporte')) return 'bg-neon-green/5';
    if (type.includes('resistência') || type.includes('liquidação')) return 'bg-neon-pink/5';
    return 'bg-neon-cyan/5';
  };

  const getTargetBorderClass = (levelType: string): string => {
    const type = levelType.toLowerCase();
    if (type.includes('acumulação') || type.includes('suporte')) return 'border-neon-green/20';
    if (type.includes('resistência') || type.includes('liquidação')) return 'border-neon-pink/20';
    return 'border-neon-cyan/20';
  };

  // Calculate price range for visualization
  const prices = targets.map(t => t.priceLevel);
  const minPrice = Math.min(...prices, currentPrice);
  const maxPrice = Math.max(...prices, currentPrice);
  const priceRange = maxPrice - minPrice;

  return (
    <div className="pt-4 border-t border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Crosshair className="w-4 h-4 text-neon-cyan" />
        <span className="text-sm font-semibold text-foreground">Alvos Delimitados</span>
      </div>
      
      {/* Visual Target Chart */}
      <div className="relative h-32 bg-accent/10 rounded-lg p-3 mb-3">
        <div className="absolute inset-0 flex items-center px-3">
          <div className="w-full h-px bg-border/50" />
        </div>
        
        {/* Current Price Marker */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10"
          style={{ top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
          <div className="text-xs font-medium text-neon-blue mt-1 whitespace-nowrap">
            Atual: {formatCurrency(currentPrice)}
          </div>
        </div>

        {/* Target Level Markers */}
        {targets.map((target, idx) => {
          const offset = priceRange > 0 ? ((target.priceLevel - currentPrice) / priceRange) * 30 : 0;
          const position = 50 + offset;
          const colorClass = getTargetColorClass(target.levelType);
          const isAbove = target.priceLevel > currentPrice;
          const confidence = Math.max(0.3, Math.min(1, target.confidenceScore));
          
          return (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute flex flex-col items-center cursor-pointer group z-20"
                    style={{ 
                      left: `${Math.max(10, Math.min(90, position))}%`,
                      top: isAbove ? '20%' : '80%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full ${colorClass} border-2 group-hover:scale-125 transition-transform`}
                      style={{ opacity: confidence }}
                    />
                    <div 
                      className={`w-px h-8 ${colorClass}`}
                      style={{ opacity: 0.3 }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-background/95 border-border">
                  <div className="text-xs space-y-1">
                    <div className="font-semibold">{target.levelType}</div>
                    <div className="text-muted-foreground">Preço: {formatCurrency(target.priceLevel)}</div>
                    <div className="text-muted-foreground">
                      Confiança: {formatPercentage(target.confidenceScore)}
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      Fonte: {target.source || 'N/A'}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Target List */}
      <div className="space-y-2">
        {targets.map((target, idx) => {
          const colorClass = getTargetColorClass(target.levelType);
          const bgClass = getTargetBgClass(target.levelType);
          const borderClass = getTargetBorderClass(target.levelType);
          const isAbove = target.priceLevel > currentPrice;
          const percentDiff = Math.abs((target.priceLevel - currentPrice) / currentPrice);
          const confidence = Math.max(0.3, Math.min(1, target.confidenceScore));
          
          return (
            <div 
              key={idx}
              className={`flex items-center justify-between p-2 rounded-lg ${bgClass} border ${borderClass} hover:border-opacity-60 transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${colorClass}`}
                  style={{ opacity: confidence }}
                />
                <div>
                  <div className="text-xs font-medium text-foreground">{target.levelType}</div>
                  <div className="text-[10px] text-muted-foreground">{target.source || 'N/A'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${colorClass}`}>
                  {formatCurrency(target.priceLevel)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {isAbove ? '↑' : '↓'} {formatPercentage(percentDiff)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyTargetsSection() {
  return (
    <div className="pt-4 border-t border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Crosshair className="w-4 h-4 text-muted-foreground/50" />
        <span className="text-sm font-semibold text-muted-foreground">Alvos Delimitados</span>
      </div>
      <div className="text-center py-4 text-sm text-muted-foreground/70">
        Nenhum alvo delimitado disponível
      </div>
    </div>
  );
}
