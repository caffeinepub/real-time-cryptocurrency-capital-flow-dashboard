import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import FlowVisualization from './components/FlowVisualization';
import ConfluenceZones from './components/ConfluenceZones';
import FuturesMonitor from './components/FuturesMonitor';
import FuturesMonitorTabSurface from './surfaces/FuturesMonitorTabSurface';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Toaster } from '@/components/ui/sonner';
import { initPWAInstallPrompt, isStandalone } from './lib/pwaUtils';
import { usePWAUpdateToast } from './hooks/usePWAUpdateToast';
import { isUrlFlagEnabled } from './utils/urlParams';

type ModuleType = 'flows' | 'confluence' | 'futures';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('flows');

  // Check for PWA updates
  usePWAUpdateToast();

  /**
   * Runtime mode switch based on URL query parameter
   * 
   * URL Flag: ?tab=futures
   * When present, renders only the Futures Monitor tab surface (single-tab mode)
   * When absent, renders the full multi-module app with navigation
   * 
   * Examples:
   * - Multi-module mode: https://example.com/
   * - Single-tab mode: https://example.com/?tab=futures
   */
  const isSingleTabMode = isUrlFlagEnabled('tab') && new URLSearchParams(window.location.search).get('tab') === 'futures';

  useEffect(() => {
    // Initialize PWA install prompt
    initPWAInstallPrompt();

    // Log PWA status
    if (isStandalone()) {
      console.log('[PWA] App running in standalone mode');
    }

    // Log runtime mode
    if (isSingleTabMode) {
      console.log('[App] Running in single-tab mode (Futures Monitor only)');
    } else {
      console.log('[App] Running in multi-module mode');
    }
  }, [isSingleTabMode]);

  // Single-tab mode: render only Futures Monitor surface
  if (isSingleTabMode) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <FuturesMonitorTabSurface />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Multi-module mode: render full app with navigation
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header activeModule={activeModule} setActiveModule={setActiveModule} />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {activeModule === 'flows' && <FlowVisualization />}
          {activeModule === 'confluence' && <ConfluenceZones />}
          {activeModule === 'futures' && <FuturesMonitor />}
        </main>

        <Footer />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
