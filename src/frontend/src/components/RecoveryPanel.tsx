import { useMemo } from 'react';
import { TrendingUp, Zap, Compass, AlertCircle, Activity } from 'lucide-react';
import { useRecoveryAssets } from '../hooks/useQueries';
import { formatNumber, formatPercentage, formatCompactNumber } from '../lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RecoveryPanel() {
  const { data: recoveryAssets, isLoading, isError } = useRecoveryAssets();

  const sortedAssets = useMemo(() => {
    if (!recoveryAssets || !Array.isArray(recoveryAssets)) return [];
    return [...recoveryAssets].sort((a, b) => b.recoveryStrength - a.recoveryStrength);
  }, [recoveryAssets]);

  const getRecoveryStyles = (asset: typeof sortedAssets[0]) => {
    if (asset.isMomentumBreakout) {
      return {
        icon: '⚡',
        label: 'Breakout de Momentum',
        color: 'text-neon-yellow',
        bg: 'bg-neon-yellow/5',
        border: 'border-neon-yellow/30',
        hoverBorder: 'hover:border-neon-yellow/50',
        hoverShadow: 'hover:shadow-neon-yellow-sm',
        badgeBorder: 'border-neon-yellow/50'
      };
    }
    if (asset.isInstitutionalEntry) {
      return {
        icon: '🧭',
        label: 'Convergência Institucional',
        color: 'text-neon-blue',
        bg: 'bg-neon-blue/5',
        border: 'border-neon-blue/30',
        hoverBorder: 'hover:border-neon-blue/50',
        hoverShadow: 'hover:shadow-neon-blue-sm',
        badgeBorder: 'border-neon-blue/50'
      };
    }
    return {
      icon: '💚',
      label: 'Recuperação Forte',
      color: 'text-neon-green',
      bg: 'bg-neon-green/5',
      border: 'border-neon-green/30',
      hoverBorder: 'hover:border-neon-green/50',
      hoverShadow: 'hover:shadow-neon-green-sm',
      badgeBorder: 'border-neon-green/50'
    };
  };

  const getStrengthStyles = (strength: number) => {
    if (strength >= 0.8) {
      return {
        color: 'text-neon-green',
        bg: 'bg-neon-green'
      };
    }
    if (strength >= 0.6) {
      return {
        color: 'text-neon-cyan',
        bg: 'bg-neon-cyan'
      };
    }
    if (strength >= 0.4) {
      return {
        color: 'text-neon-blue',
        bg: 'bg-neon-blue'
      };
    }
    return {
      color: 'text-neon-purple',
      bg: 'bg-neon-purple'
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
              Painel de Recuperação
            </h2>
            <p className="text-muted-foreground mt-1">
              Detectando ativos em recuperação após correções
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
              Painel de Recuperação
            </h2>
            <p className="text-muted-foreground mt-1">
              Detectando ativos em recuperação após correções
            </p>
          </div>
        </div>

        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados de recuperação. Verifique a conexão com a API Binance.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sortedAssets || sortedAssets.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
              Painel de Recuperação
            </h2>
            <p className="text-muted-foreground mt-1">
              Detectando ativos em recuperação após correções
            </p>
          </div>
        </div>

        <Alert className="bg-accent/50 border-border/50">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Nenhum ativo em recuperação detectado no momento. Aguardando sinais de mercado...
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
            Painel de Recuperação
          </h2>
          <p className="text-muted-foreground mt-1">
            Detectando ativos em recuperação após correções • {sortedAssets.length} ativos identificados
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-neon-green/10 to-transparent border-neon-green/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <span className="text-2xl">💚</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recuperação Forte</p>
                <p className="text-2xl font-bold text-neon-green">
                  {sortedAssets.filter(a => !a.isMomentumBreakout && !a.isInstitutionalEntry).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-yellow/10 to-transparent border-neon-yellow/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-neon-yellow/20 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Breakout de Momentum</p>
                <p className="text-2xl font-bold text-neon-yellow">
                  {sortedAssets.filter(a => a.isMomentumBreakout).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-neon-blue/10 to-transparent border-neon-blue/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-neon-blue/20 flex items-center justify-center">
                <span className="text-2xl">🧭</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Convergência Institucional</p>
                <p className="text-2xl font-bold text-neon-blue">
                  {sortedAssets.filter(a => a.isInstitutionalEntry).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAssets.map((asset, index) => {
          const recoveryStyles = getRecoveryStyles(asset);
          const strengthStyles = getStrengthStyles(asset.recoveryStrength);

          return (
            <Card
              key={asset.symbol}
              className={`bg-gradient-to-br ${recoveryStyles.bg} to-transparent ${recoveryStyles.border} ${recoveryStyles.hoverBorder} transition-all duration-300 ${recoveryStyles.hoverShadow} animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl animate-gentle-pulse">{recoveryStyles.icon}</span>
                    {asset.symbol}
                  </CardTitle>
                  <Badge variant="outline" className={`${recoveryStyles.badgeBorder} ${recoveryStyles.color}`}>
                    #{index + 1}
                  </Badge>
                </div>
                <p className={`text-xs ${recoveryStyles.color} font-medium`}>{recoveryStyles.label}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Recovery Strength */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Força de Recuperação</span>
                    <span className={`text-sm font-bold ${strengthStyles.color}`}>
                      {formatPercentage(asset.recoveryStrength)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthStyles.bg} rounded-full transition-all duration-500 animate-gentle-pulse`}
                      style={{ width: `${asset.recoveryStrength * 100}%` }}
                    />
                  </div>
                </div>

                {/* Pattern Type */}
                <div className="flex items-center justify-between py-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">Padrão</span>
                  <span className="text-sm font-medium text-foreground">{asset.patternType}</span>
                </div>

                {/* RSI */}
                <div className="flex items-center justify-between py-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">RSI</span>
                  <span className={`text-sm font-bold ${asset.rsi < 30 ? 'text-neon-green' : 'text-foreground'}`}>
                    {formatNumber(asset.rsi)}
                  </span>
                </div>

                {/* Volume */}
                <div className="flex items-center justify-between py-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCompactNumber(asset.volume)}
                  </span>
                </div>

                {/* Open Interest */}
                <div className="flex items-center justify-between py-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">Open Interest</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCompactNumber(asset.openInterest)}
                  </span>
                </div>

                {/* Support Levels */}
                {asset.supports.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">Níveis de Suporte</p>
                    <div className="flex flex-wrap gap-1">
                      {asset.supports.slice(0, 3).map((support, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-muted/50 text-muted-foreground"
                        >
                          ${formatNumber(support)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicators */}
                <div className="flex gap-2 pt-2">
                  {asset.isMomentumBreakout && (
                    <Badge variant="outline" className="border-neon-yellow/50 text-neon-yellow text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Breakout
                    </Badge>
                  )}
                  {asset.isInstitutionalEntry && (
                    <Badge variant="outline" className="border-neon-blue/50 text-neon-blue text-xs">
                      <Compass className="w-3 h-3 mr-1" />
                      Institucional
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
