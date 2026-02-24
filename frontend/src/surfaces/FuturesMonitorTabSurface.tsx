import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginButton from '../components/LoginButton';
import Footer from '../components/Footer';
import OrderFlowMonitor from '../components/OrderFlowMonitor';
import OrderFlowErrorBoundary from '../components/OrderFlowErrorBoundary';
import { Activity } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function FuturesMonitorTabSurface() {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-neon-cyan" />
                <h1 className="text-xl font-bold text-neon-cyan">Order Flow Monitor</h1>
              </div>
              <LoginButton />
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8">
            <OrderFlowErrorBoundary onReset={handleReset}>
              <OrderFlowMonitor key={resetKey} />
            </OrderFlowErrorBoundary>
          </main>

          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
