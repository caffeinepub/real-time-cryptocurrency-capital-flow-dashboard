import { lazy, Suspense } from 'react';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { useBubbleAssets } from '../hooks/useBubbleAssets';
import { useBinanceData } from '../hooks/useBinanceData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Lazy-load the 3D canvas component to isolate three.js/R3F from the main bundle
const BubbleVisualization = lazy(() => import('../components/BubbleVisualization'));

function BubbleLoader() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-card/30 rounded-lg border border-border/50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        <p className="text-muted-foreground">Carregando visualização 3D...</p>
      </div>
    </div>
  );
}

export default function BubbleVisualizationTabSurface() {
  const { data, isLoading, error } = useBubbleAssets();
  const { isLive, marketData } = useBinanceData();

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
            Status:{' '}
            <span className={isLive ? 'text-neon-green' : 'text-neon-pink'}>
              {isLive ? 'AO VIVO' : 'OFFLINE'}
            </span>
          </span>
          <span className="text-muted-foreground">
            Ativos: <span className="text-foreground font-semibold">{bubbleAssets.length}</span>
          </span>
          <span className="text-muted-foreground">
            Mercado: <span className="text-foreground font-semibold">{marketData.length} símbolos</span>
          </span>
          {!hasBackendData && bubbleAssets.length > 0 && (
            <span className="text-xs text-neon-yellow">(Dados sintéticos de mercado)</span>
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
            Exibindo ativos com movimentação significativa detectada em tempo real.
            {backendCount > 0 && ` Backend retornou ${backendCount} ativos, mas foram filtrados.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(142, 85%, 55%)' }} />
          <span className="text-muted-foreground">Bullish (Alta)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(0, 85%, 60%)' }} />
          <span className="text-muted-foreground">Bearish (Baixa)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(48, 90%, 58%)' }} />
          <span className="text-muted-foreground">Neutral</span>
        </div>
      </div>

      {/* Visualization — lazy loaded to isolate three.js bundle */}
      <Suspense fallback={<BubbleLoader />}>
        <BubbleVisualization />
      </Suspense>

      {/* Usage Instructions */}
      <div className="text-sm text-muted-foreground space-y-2 bg-card/30 p-4 rounded-lg border border-border/50">
        <p className="font-semibold text-foreground">Como usar:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Clique e arraste para rotacionar a visualização</li>
          <li>Use a roda do mouse para zoom</li>
          <li>Clique em uma bolha para ver detalhes do ativo</li>
          <li>Bolhas maiores indicam maior convergência de sinais</li>
          <li>Bolhas brilhantes indicam alta convergência (&gt;70%)</li>
        </ul>
      </div>
    </div>
  );
}
