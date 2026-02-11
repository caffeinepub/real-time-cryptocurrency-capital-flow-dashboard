import OrderFlowMonitor from '../components/OrderFlowMonitor';
import LoginButton from '../components/LoginButton';
import { BarChart3 } from 'lucide-react';

/**
 * Standalone Order Flow Monitor tab surface with error boundary wrapper
 * Renders the Order Flow Monitor module without the multi-module navigation shell
 * Includes minimal header with auth controls for standalone usage
 */
export default function FuturesMonitorTabSurface() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Minimal standalone header with auth */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-yellow via-neon-orange to-neon-pink flex items-center justify-center shadow-neon-yellow">
                <BarChart3 className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neon-yellow">
                  Monitor de Fluxo de Ordens
                </h1>
                <p className="text-xs text-muted-foreground">Análise BTC Spot & Futuros</p>
              </div>
            </div>

            {/* Auth Controls */}
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <OrderFlowMonitor />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-yellow hover:text-neon-yellow/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
