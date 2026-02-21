import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import FuturesMonitorTabSurface from './surfaces/FuturesMonitorTabSurface';
import CapitalFlowTabSurface from './surfaces/CapitalFlowTabSurface';
import ConfluenceZonesTabSurface from './surfaces/ConfluenceZonesTabSurface';
import BubbleVisualizationTabSurface from './surfaces/BubbleVisualizationTabSurface';
import OrderFlowErrorBoundary from './components/OrderFlowErrorBoundary';
import { getUrlParameter } from './utils/urlParams';
import { usePWAUpdateToast } from './hooks/usePWAUpdateToast';

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
          <OrderFlowErrorBoundary onReset={handleOrderFlowReset}>
            <FuturesMonitorTabSurface key={orderFlowResetKey} />
          </OrderFlowErrorBoundary>
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
            {activeModule === 'flows' && <CapitalFlowTabSurface />}
            {activeModule === 'confluence' && <ConfluenceZonesTabSurface />}
            {activeModule === 'bubbles' && <BubbleVisualizationTabSurface />}
            {activeModule === 'futures' && (
              <OrderFlowErrorBoundary onReset={handleOrderFlowReset}>
                <FuturesMonitorTabSurface key={orderFlowResetKey} />
              </OrderFlowErrorBoundary>
            )}
          </main>

          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
