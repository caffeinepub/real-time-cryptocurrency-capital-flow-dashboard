import FuturesMonitor from '../components/FuturesMonitor';
import LoginButton from '../components/LoginButton';
import { Activity } from 'lucide-react';

/**
 * Standalone Futures Monitor tab surface
 * Renders the Futures Monitor module without the multi-module navigation shell
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
                <Activity className="w-6 h-6 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neon-yellow">
                  Futures Monitor
                </h1>
                <p className="text-xs text-muted-foreground">Binance USD-M Perpetual Futures</p>
              </div>
            </div>

            {/* Auth Controls */}
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <FuturesMonitor />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026. Built with love using{' '}
            <a
              href="https://caffeine.ai"
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
