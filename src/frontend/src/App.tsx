import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import FlowVisualization from './components/FlowVisualization';
import PredictiveIntelligence from './components/PredictiveIntelligence';
import ConfluenceZones from './components/ConfluenceZones';
import RecoveryPanel from './components/RecoveryPanel';
import PerformancePreditiva from './components/PerformancePreditiva';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Toaster } from '@/components/ui/sonner';
import { initPWAInstallPrompt, isStandalone } from './lib/pwaUtils';

type ModuleType = 'flows' | 'predictions' | 'confluence' | 'recovery' | 'performance';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('flows');

  useEffect(() => {
    // Initialize PWA install prompt
    initPWAInstallPrompt();

    // Log PWA status
    if (isStandalone()) {
      console.log('[PWA] Aplicativo rodando em modo standalone');
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header activeModule={activeModule} setActiveModule={setActiveModule} />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {activeModule === 'flows' && <FlowVisualization />}
          {activeModule === 'predictions' && <PredictiveIntelligence />}
          {activeModule === 'confluence' && <ConfluenceZones />}
          {activeModule === 'recovery' && <RecoveryPanel />}
          {activeModule === 'performance' && <PerformancePreditiva />}
        </main>

        <Footer />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
