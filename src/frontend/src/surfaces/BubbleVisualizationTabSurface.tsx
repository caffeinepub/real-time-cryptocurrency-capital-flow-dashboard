import { AlertCircle, Info } from 'lucide-react';
import BubbleVisualization from '../components/BubbleVisualization';
import { useBubbleAssets } from '../hooks/useBubbleAssets';
import { useBinanceData } from '../hooks/useBinanceData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BubbleVisualizationTabSurface() {
  const { data, isLoading, error } = useBubbleAssets();
  const { connectionStatus, isLive, marketData } = useBinanceData();

  const bubbleAssets = data?.assets || [];
  const hasBackendData = data?.hasBackendData || false;
  const backendCount = data?.backendCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
          Visualização de Convergência
        </h2>
        <p className="text-muted-foreground">
          Ativos com alta convergência de fluxo de capital e zonas técnicas
        </p>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <span className="text-muted-foreground">
            Status: <span className={isLive ? 'text-neon-green' : 'text-neon-pink'}>{isLive ? 'AO VIVO' : 'OFFLINE'}</span>
          </span>
          <span className="text-muted-foreground">
            Ativos: <span className="text-foreground font-semibold">{bubbleAssets.length}</span>
          </span>
          <span className="text-muted-foreground">
            Mercado: <span className="text-foreground font-semibold">{marketData.length} símbolos</span>
          </span>
          {!hasBackendData && bubbleAssets.length > 0 && (
            <span className="text-xs text-neon-yellow">
              (Dados sintéticos de mercado)
            </span>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os ativos de convergência. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Warning */}
      {!isLive && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conexão Offline</AlertTitle>
          <AlertDescription>
            A conexão com o mercado está offline. Os dados podem estar desatualizados.
          </AlertDescription>
        </Alert>
      )}

      {/* Synthetic Data Info */}
      {!hasBackendData && bubbleAssets.length > 0 && isLive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Dados de Mercado ao Vivo</AlertTitle>
          <AlertDescription>
            Exibindo ativos com movimentação significativa baseados em dados ao vivo da Binance. 
            As bolhas representam os principais movimentos de preço e volume do mercado.
          </AlertDescription>
        </Alert>
      )}

      {/* Visualization */}
      <BubbleVisualization />

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card/30 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neon-green/30 border-2 border-neon-green"></div>
          <div>
            <p className="text-sm font-medium">Tendência de Alta</p>
            <p className="text-xs text-muted-foreground">Convergência bullish</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neon-pink/30 border-2 border-neon-pink"></div>
          <div>
            <p className="text-sm font-medium">Tendência de Baixa</p>
            <p className="text-xs text-muted-foreground">Convergência bearish</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neon-yellow/30 border-2 border-neon-yellow"></div>
          <div>
            <p className="text-sm font-medium">Tendência Neutra</p>
            <p className="text-xs text-muted-foreground">Convergência lateral</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-card/20 rounded-lg border border-border/30">
        <h3 className="text-sm font-semibold mb-2">Como usar:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Clique e arraste para rotacionar a visualização</li>
          <li>Use a roda do mouse para zoom</li>
          <li>Clique em uma bolha para ver detalhes do ativo</li>
          <li>Bolhas maiores indicam maior convergência ou movimentação</li>
          <li>Cores indicam a tendência do ativo (verde=alta, vermelho=baixa, amarelo=neutro)</li>
        </ul>
      </div>
    </div>
  );
}
