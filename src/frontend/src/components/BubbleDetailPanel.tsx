import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  BarChart3,
  Layers,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAssetDetailData } from "../hooks/useAssetDetailData";
import type { EnrichedBubbleAsset } from "../hooks/useBubbleAssets";
import { useTrendChartData } from "../hooks/useTrendChartData";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../lib/formatters";
import TrendChart from "./TrendChart";

interface BubbleDetailPanelProps {
  asset: EnrichedBubbleAsset;
  onClose: () => void;
}

export default function BubbleDetailPanel({
  asset,
  onClose,
}: BubbleDetailPanelProps) {
  const { data: detailData, isLoading } = useAssetDetailData(asset);
  const {
    data: chartData,
    isLoading: chartLoading,
    isError: chartError,
  } = useTrendChartData(asset.symbol);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger slide-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = () => {
    switch (asset.trend.toLowerCase()) {
      case "bullish":
      case "alta":
        return <TrendingUp className="w-5 h-5 text-neon-green" />;
      case "bearish":
      case "baixa":
        return <TrendingDown className="w-5 h-5 text-neon-pink" />;
      default:
        return <Activity className="w-5 h-5 text-neon-yellow" />;
    }
  };

  const getTrendColor = () => {
    switch (asset.trend.toLowerCase()) {
      case "bullish":
      case "alta":
        return "text-neon-green";
      case "bearish":
      case "baixa":
        return "text-neon-pink";
      default:
        return "text-neon-yellow";
    }
  };

  const convergenceScore = Math.min(
    100,
    asset.flowIntensity + asset.confluenceIntensity + asset.confidenceLevel,
  );

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[9] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        onKeyUp={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        className={`absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] overflow-y-auto z-10 transition-all duration-300 ease-out ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div
                className={`flex items-center gap-3 transition-all duration-500 delay-100 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                {getTrendIcon()}
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {asset.symbol.replace("USDT", "")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    {asset.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-110"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Price and Change */}
            <div
              className={`grid grid-cols-2 gap-4 transition-all duration-500 delay-150 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">
                  Preço Atual
                </p>
                <p className="text-lg font-bold">
                  {detailData?.livePrice
                    ? formatCurrency(detailData.livePrice)
                    : formatCurrency(asset.price)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">
                  Variação 24h
                </p>
                <p
                  className={`text-lg font-bold ${detailData?.priceChange && detailData.priceChange > 0 ? "text-neon-green" : "text-neon-pink"}`}
                >
                  {detailData?.priceChange
                    ? `${detailData.priceChange > 0 ? "+" : ""}${formatNumber(detailData.priceChange)}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Volume */}
            {detailData?.volume && (
              <div
                className={`p-3 rounded-lg bg-accent/50 border border-border/30 transition-all duration-500 delay-200 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1 font-semibold">
                  Volume 24h
                </p>
                <p className="text-base font-bold">
                  {formatCurrency(detailData.volume)}
                </p>
              </div>
            )}

            <Separator className="my-4" />

            {/* Trend Chart */}
            <div
              className={`transition-all duration-500 delay-250 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-neon-cyan" />
                <p className="text-sm font-semibold">
                  Gráfico de Tendência (4h)
                </p>
              </div>

              {chartLoading ? (
                <div className="w-full h-64 flex items-center justify-center bg-accent/30 rounded-lg border border-border/30">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Carregando dados...
                    </p>
                  </div>
                </div>
              ) : chartError ? (
                <div className="w-full h-64 flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/30">
                  <div className="text-center space-y-2 px-4">
                    <p className="text-sm text-destructive font-medium">
                      Erro ao carregar gráfico
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dados históricos indisponíveis
                    </p>
                  </div>
                </div>
              ) : chartData && chartData.length > 0 ? (
                <div className="p-3 rounded-lg bg-accent/30 border border-border/30">
                  <TrendChart data={chartData} symbol={asset.symbol} />
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-accent/30 rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Sem dados disponíveis
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Convergence Score */}
            <div
              className={`transition-all duration-500 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Score de Convergência</p>
                <Badge
                  variant="outline"
                  className={`${getTrendColor()} font-bold text-base px-3 py-1`}
                >
                  {formatNumber(convergenceScore)}%
                </Badge>
              </div>
              <Progress value={convergenceScore} className="h-3 shadow-inner" />
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Combinação de fluxo de capital, zonas técnicas e confiança
              </p>
            </div>

            <Separator className="my-4" />

            {/* Metrics */}
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Flow Intensity */}
                <div
                  className={`p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 transition-all duration-500 delay-350 hover:bg-neon-cyan/15 hover:border-neon-cyan/50 hover:shadow-lg hover:shadow-neon-cyan/20 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-neon-cyan" />
                    <p className="text-sm font-semibold">
                      Intensidade de Fluxo
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-neon-cyan mb-1">
                    {formatNumber(asset.flowIntensity)}%
                  </p>
                  {detailData?.capitalFlow && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">
                        PnL Ratio:{" "}
                        <span className="text-foreground">
                          {formatNumber(detailData.capitalFlow.pnlRatio)}
                        </span>
                      </p>
                      <p className="font-medium">
                        Impacto:{" "}
                        <span className="text-foreground">
                          {formatNumber(detailData.capitalFlow.marketImpact)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confluence Intensity */}
                <div
                  className={`p-4 rounded-lg bg-neon-green/10 border border-neon-green/30 transition-all duration-500 delay-400 hover:bg-neon-green/15 hover:border-neon-green/50 hover:shadow-lg hover:shadow-neon-green/20 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-neon-green" />
                    <p className="text-sm font-semibold">
                      Intensidade de Confluência
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-neon-green mb-1">
                    {formatNumber(asset.confluenceIntensity)}%
                  </p>
                  {detailData?.confluenceZone && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p className="font-medium">
                        Indicadores:{" "}
                        <span className="text-foreground">
                          {detailData.confluenceZone.indicators.join(", ")}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confidence Level */}
                <div
                  className={`p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/30 transition-all duration-500 delay-450 hover:bg-neon-purple/15 hover:border-neon-purple/50 hover:shadow-lg hover:shadow-neon-purple/20 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-neon-purple" />
                    <p className="text-sm font-semibold">Nível de Confiança</p>
                  </div>
                  <p className="text-3xl font-bold text-neon-purple mb-1">
                    {formatNumber(asset.confidenceLevel)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tendência:{" "}
                    <span className={`${getTrendColor()} font-bold text-sm`}>
                      {asset.trend}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
