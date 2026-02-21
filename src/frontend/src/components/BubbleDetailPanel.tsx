import { X, TrendingUp, TrendingDown, Activity, Layers, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { EnrichedBubbleAsset } from '../hooks/useBubbleAssets';
import { useAssetDetailData } from '../hooks/useAssetDetailData';
import { formatCurrency, formatNumber, formatPercentage } from '../lib/formatters';

interface BubbleDetailPanelProps {
  asset: EnrichedBubbleAsset;
  onClose: () => void;
}

export default function BubbleDetailPanel({ asset, onClose }: BubbleDetailPanelProps) {
  const { data: detailData, isLoading } = useAssetDetailData(asset);

  const getTrendIcon = () => {
    switch (asset.trend.toLowerCase()) {
      case 'bullish':
      case 'alta':
        return <TrendingUp className="w-5 h-5 text-neon-green" />;
      case 'bearish':
      case 'baixa':
        return <TrendingDown className="w-5 h-5 text-neon-pink" />;
      default:
        return <Activity className="w-5 h-5 text-neon-yellow" />;
    }
  };

  const getTrendColor = () => {
    switch (asset.trend.toLowerCase()) {
      case 'bullish':
      case 'alta':
        return 'text-neon-green';
      case 'bearish':
      case 'baixa':
        return 'text-neon-pink';
      default:
        return 'text-neon-yellow';
    }
  };

  const convergenceScore = Math.min(100, asset.flowIntensity + asset.confluenceIntensity + asset.confidenceLevel);

  return (
    <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] overflow-y-auto z-10">
      <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getTrendIcon()}
              <div>
                <CardTitle className="text-xl">{asset.symbol.replace('USDT', '')}</CardTitle>
                <p className="text-sm text-muted-foreground">{asset.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-accent transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price and Change */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Preço Atual</p>
              <p className="text-lg font-bold">
                {detailData?.livePrice ? formatCurrency(detailData.livePrice) : formatCurrency(asset.price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Variação 24h</p>
              <p className={`text-lg font-bold ${detailData?.priceChange && detailData.priceChange > 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                {detailData?.priceChange ? `${detailData.priceChange > 0 ? '+' : ''}${formatNumber(detailData.priceChange)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Volume */}
          {detailData?.volume && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volume 24h</p>
              <p className="text-base font-semibold">{formatCurrency(detailData.volume)}</p>
            </div>
          )}

          <Separator />

          {/* Convergence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Score de Convergência</p>
              <Badge variant="outline" className={getTrendColor()}>
                {formatNumber(convergenceScore)}%
              </Badge>
            </div>
            <Progress value={convergenceScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Combinação de fluxo de capital, zonas técnicas e confiança
            </p>
          </div>

          <Separator />

          {/* Metrics */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Flow Intensity */}
              <div className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-neon-cyan" />
                  <p className="text-sm font-medium">Intensidade de Fluxo</p>
                </div>
                <p className="text-2xl font-bold text-neon-cyan">{formatNumber(asset.flowIntensity)}%</p>
                {detailData?.capitalFlow && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>PnL Ratio: {formatNumber(detailData.capitalFlow.pnlRatio)}</p>
                    <p>Impacto: {formatNumber(detailData.capitalFlow.marketImpact)}</p>
                  </div>
                )}
              </div>

              {/* Confluence Intensity */}
              <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/30">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-neon-green" />
                  <p className="text-sm font-medium">Intensidade de Confluência</p>
                </div>
                <p className="text-2xl font-bold text-neon-green">{formatNumber(asset.confluenceIntensity)}%</p>
                {detailData?.confluenceZone && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Indicadores: {detailData.confluenceZone.indicators.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Confidence Level */}
              <div className="p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-neon-purple" />
                  <p className="text-sm font-medium">Nível de Confiança</p>
                </div>
                <p className="text-2xl font-bold text-neon-purple">{formatNumber(asset.confidenceLevel)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tendência: <span className={getTrendColor()}>{asset.trend}</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
