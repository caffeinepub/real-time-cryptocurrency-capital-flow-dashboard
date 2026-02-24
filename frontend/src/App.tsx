import { lazy, Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderFlowErrorBoundary from './components/OrderFlowErrorBoundary';
import { getUrlParameter } from './utils/urlParams';
import { usePWAUpdateToast } from './hooks/usePWAUpdateToast';
import { Loader2 } from 'lucide-react';

// Lazy-load all heavy tab surfaces to split bundles and reduce build memory pressure
const FuturesMonitorTabSurface = lazy(() => import('./surfaces/FuturesMonitorTabSurface'));
const CapitalFlowTabSurface = lazy(() => import('./surfaces/CapitalFlowTabSurface'));
const ConfluenceZonesTabSurface = lazy(() => import('./surfaces/ConfluenceZonesTabSurface'));
const BubbleVisualizationTabSurface = lazy(() => import('./surfaces/BubbleVisualizationTabSurface'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export type ModuleType = 'flows' | 'confluence' | 'futures' | 'bubbles';

function SurfaceLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        <p className="text-muted-foreground text-sm">Carregando módulo...</p>
      </div>
    </div>
  );
}

function App() {
  usePWAUpdateToast();

  const [activeModule, setActiveModule] = useState<ModuleType>('bubbles');
  const [orderFlowResetKey, setOrderFlowResetKey] = useState(0);

  const isStandaloneOrderFlow = getUrlParameter('orderflow') !== null;

  const handleOrderFlowReset = () => {
    setOrderFlowResetKey(prev => prev + 1);
  };

  if (isStandaloneOrderFlow) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Suspense fallback={<SurfaceLoader />}>
            <OrderFlowErrorBoundary onReset={handleOrderFlowReset}>
              <FuturesMonitorTabSurface key={orderFlowResetKey} />
            </OrderFlowErrorBoundary>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header activeModule={activeModule} setActiveModule={setActiveModule} />

          <main className="flex-1 container mx-auto px-4 py-8">
            <Suspense fallback={<SurfaceLoader />}>
              {activeModule === 'flows' && <CapitalFlowTabSurface />}
              {activeModule === 'confluence' && <ConfluenceZonesTabSurface />}
              {activeModule === 'bubbles' && <BubbleVisualizationTabSurface />}
              {activeModule === 'futures' && (
                <OrderFlowErrorBoundary onReset={handleOrderFlowReset}>
                  <FuturesMonitorTabSurface key={orderFlowResetKey} />
                </OrderFlowErrorBoundary>
              )}
            </Suspense>
          </main>

          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
