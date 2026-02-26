import React, { Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import { useBinanceData } from './hooks/useBinanceData';
import { Globe, TrendingUp, Layers, Activity, BarChart2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

const BubbleVisualizationTabSurface = React.lazy(() => import('./surfaces/BubbleVisualizationTabSurface'));
const CapitalFlowTabSurface = React.lazy(() => import('./surfaces/CapitalFlowTabSurface'));
const ConfluenceZonesTabSurface = React.lazy(() => import('./surfaces/ConfluenceZonesTabSurface'));
const FuturesMonitorTabSurface = React.lazy(() => import('./surfaces/FuturesMonitorTabSurface'));

function SurfaceLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground text-sm">Carregando...</span>
      </div>
    </div>
  );
}

type TabId = 'bubbles' | 'flow' | 'confluence' | 'futures';

const TABS: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: 'bubbles', label: 'Mercado', shortLabel: 'Mercado', icon: <Globe className="w-5 h-5" /> },
  { id: 'flow', label: 'Fluxo de Capital', shortLabel: 'Fluxo', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'confluence', label: 'Confluências', shortLabel: 'Zonas', icon: <Layers className="w-5 h-5" /> },
  { id: 'futures', label: 'Order Flow', shortLabel: 'Futures', icon: <Activity className="w-5 h-5" /> },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('bubbles');
  const { connectionStatus } = useBinanceData();

  return (
    <div className="min-h-screen bg-background flex flex-col overscroll-none">
      <Header activeTab={activeTab} onTabChange={setActiveTab} connectionStatus={connectionStatus} />

      {/* Main content area with bottom padding for mobile nav */}
      <main className="flex-1 pb-20 lg:pb-0 pt-0">
        <Suspense fallback={<SurfaceLoader />}>
          {activeTab === 'bubbles' && <BubbleVisualizationTabSurface />}
          {activeTab === 'flow' && <CapitalFlowTabSurface />}
          {activeTab === 'confluence' && <ConfluenceZonesTabSurface />}
          {activeTab === 'futures' && <FuturesMonitorTabSurface />}
        </Suspense>
      </main>

      {/* Bottom Tab Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface border-t border-border/50 pb-safe">
        <div className="flex items-stretch h-16">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] transition-all duration-200 ${
                  isActive
                    ? 'text-neon-green'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={tab.label}
              >
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-medium leading-none">{tab.shortLabel}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-neon-green rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="hidden lg:block">
        <Footer />
      </div>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
