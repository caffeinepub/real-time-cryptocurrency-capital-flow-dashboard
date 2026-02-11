import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import FlowVisualization from './components/FlowVisualization';
import ConfluenceZones from './components/ConfluenceZones';
import OrderFlowErrorBoundary from './components/OrderFlowErrorBoundary';
import OrderFlowMonitor from './components/OrderFlowMonitor';
import FuturesMonitorTabSurface from './surfaces/FuturesMonitorTabSurface';
import { isUrlFlagEnabled } from './utils/urlParams';
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

type Module = 'flows' | 'confluence' | 'futures';

function App() {
  const [activeModule, setActiveModule] = useState<Module>('flows');

  // Check if running in standalone Order Flow Monitor mode
  const isStandaloneOrderFlow = isUrlFlagEnabled('orderFlowTab');

  if (isStandaloneOrderFlow) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <OrderFlowErrorBoundary>
            <FuturesMonitorTabSurface />
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
            {activeModule === 'flows' && (
              <div className="space-y-8">
                <section>
                  <FlowVisualization />
                </section>

                <section>
                  <ConfluenceZones />
                </section>
              </div>
            )}

            {activeModule === 'confluence' && (
              <div className="space-y-8">
                <section>
                  <ConfluenceZones />
                </section>
              </div>
            )}

            {activeModule === 'futures' && (
              <OrderFlowErrorBoundary>
                <OrderFlowMonitor />
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
