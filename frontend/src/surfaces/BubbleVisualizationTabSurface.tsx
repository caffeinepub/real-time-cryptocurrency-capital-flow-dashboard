import React, { Suspense, useState } from 'react';
import { useBinanceData } from '../hooks/useBinanceData';
import { useBubbleAssets } from '../hooks/useBubbleAssets';
import AssetDetailCard from '../components/AssetDetailCard';
import { WHITELISTED_SYMBOLS } from '../lib/binanceService';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Maximize2 } from 'lucide-react';

const BubbleVisualization = React.lazy(() => import('../components/BubbleVisualization'));

function SurfaceLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">Carregando visualização 3D...</span>
      </div>
    </div>
  );
}

const TOP_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT'];

function LivePriceTicker() {
  const { tickers, connectionStatus } = useBinanceData();

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-3 py-2 min-w-max">
        {TOP_SYMBOLS.map((sym) => {
          const ticker = tickers[sym];
          const price = ticker?.lastPrice ?? 0;
          const change = ticker?.priceChangePercent ?? 0;
          const isPos = change > 0;
          const isNeg = change < 0;
          const displaySym = sym.replace('USDT', '');

          return (
            <div
              key={sym}
              className="flex items-center gap-2 bg-surface border border-border/40 rounded-lg px-3 py-1.5 flex-shrink-0"
            >
              <span className="text-xs font-bold text-foreground">{displaySym}</span>
              <span className="font-mono text-xs text-foreground">
                ${price >= 1000
                  ? price.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
                  : price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className={`text-[10px] font-medium ${isPos ? 'text-neon-green' : isNeg ? 'text-neon-red' : 'text-muted-foreground'}`}>
                {isPos ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BubbleVisualizationTabSurface() {
  const [show3D, setShow3D] = useState(false);
  const { tickers } = useBinanceData();
  const { data: bubbleResult } = useBubbleAssets();

  const displaySymbols = TOP_SYMBOLS.concat(
    WHITELISTED_SYMBOLS.filter(s => !TOP_SYMBOLS.includes(s)).slice(0, 8)
  );

  return (
    <div className="flex flex-col">
      {/* Live Price Ticker */}
      <div className="border-b border-border/40 bg-background/50">
        <LivePriceTicker />
      </div>

      {/* 3D Visualization Toggle */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Visão do Mercado</h2>
        <button
          onClick={() => setShow3D(!show3D)}
          className="flex items-center gap-1.5 text-xs text-neon-green border border-neon-green/30 rounded-lg px-2.5 py-1.5 hover:bg-neon-green/10 transition-colors min-h-[44px]"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          {show3D ? 'Ocultar 3D' : 'Ver Bolhas 3D'}
        </button>
      </div>

      {/* 3D Bubble Visualization (collapsible) */}
      {show3D && (
        <div className="mx-3 mb-3 rounded-xl overflow-hidden border border-border/40" style={{ height: '300px' }}>
          <Suspense fallback={<SurfaceLoader />}>
            <BubbleVisualization />
          </Suspense>
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="px-3 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {displaySymbols.map((sym) => (
            <AssetDetailCard key={sym} symbol={sym} />
          ))}
        </div>
      </div>
    </div>
  );
}
