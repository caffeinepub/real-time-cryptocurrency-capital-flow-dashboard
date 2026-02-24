import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Inline PWA detection to avoid potential circular dependency with pwaUtils
function detectPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function checkIsStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

// Module-level deferred install prompt storage
let deferredPrompt: Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> } | null = null;

function captureDeferredPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as typeof deferredPrompt;
    window.dispatchEvent(new Event('pwa-install-available'));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event('pwa-installed'));
  });
}

// Initialize capture once
if (typeof window !== 'undefined') {
  captureDeferredPrompt();
}

export default function PWAInstallButton() {
  const [isStandalone, setIsStandalone] = useState(checkIsStandalone);
  const [hasPrompt, setHasPrompt] = useState(() => deferredPrompt !== null);
  const [showIOSDialog, setShowIOSDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const platform = detectPlatform();

  useEffect(() => {
    const onAvailable = () => setHasPrompt(true);
    const onInstalled = () => {
      setHasPrompt(false);
      setIsStandalone(true);
    };
    const onStandaloneChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);

    window.addEventListener('pwa-install-available', onAvailable);
    window.addEventListener('pwa-installed', onInstalled);

    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', onStandaloneChange);

    return () => {
      window.removeEventListener('pwa-install-available', onAvailable);
      window.removeEventListener('pwa-installed', onInstalled);
      mq.removeEventListener('change', onStandaloneChange);
    };
  }, []);

  // Don't render if already running as installed PWA
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (platform === 'ios') {
      setShowIOSDialog(true);
      return;
    }

    if (deferredPrompt && deferredPrompt.prompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          deferredPrompt = null;
          setHasPrompt(false);
          setIsStandalone(true);
        }
      } catch {
        // ignore
      } finally {
        setIsInstalling(false);
      }
      return;
    }

    // Fallback: show manual instructions
    setShowManualDialog(true);
  };

  const isDesktop = platform === 'desktop';

  return (
    <>
      <Button
        onClick={handleInstallClick}
        disabled={isInstalling}
        size="sm"
        className="flex items-center gap-1.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:border-neon-cyan/70 transition-all duration-300 font-semibold text-xs px-3 py-1.5 h-auto"
        aria-label="Instalar aplicativo"
      >
        {isInstalling ? (
          <span className="w-3.5 h-3.5 border-2 border-neon-cyan/40 border-t-neon-cyan rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">
          {isInstalling ? 'Instalando...' : 'Instalar App'}
        </span>
      </Button>

      {/* iOS Instructions Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="bg-card border border-neon-cyan/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neon-cyan">
              <Smartphone className="w-5 h-5" />
              Instalar no iPhone / iPad
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Siga os passos abaixo para adicionar o app à tela inicial do iOS.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/80 mt-2">
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">1</span>
                <span>
                  Toque no ícone de compartilhar{' '}
                  <span className="text-lg leading-none">⎋</span>{' '}
                  na barra inferior do Safari.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">2</span>
                <span>
                  Role para baixo e toque em{' '}
                  <span className="font-semibold text-neon-cyan">"Adicionar à Tela de Início"</span>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">3</span>
                <span>
                  Toque em{' '}
                  <span className="font-semibold text-neon-cyan">"Adicionar"</span>{' '}
                  no canto superior direito.
                </span>
              </li>
            </ol>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
              O app aparecerá na sua tela inicial como um aplicativo nativo, sem barra do navegador.
            </p>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              onClick={() => setShowIOSDialog(false)}
              className="bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
              size="sm"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Install Instructions Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="bg-card border border-neon-cyan/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neon-cyan">
              {isDesktop ? (
                <Monitor className="w-5 h-5" />
              ) : (
                <Smartphone className="w-5 h-5" />
              )}
              {isDesktop ? 'Instalar no Computador' : 'Instalar no Android'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {isDesktop
                ? 'Instale o app diretamente pelo navegador Chrome ou Edge.'
                : 'Adicione o app à tela inicial pelo Chrome.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/80 mt-2">
            {isDesktop ? (
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">1</span>
                  <span>
                    Clique no ícone de instalação na barra de endereços do Chrome/Edge.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">2</span>
                  <span>
                    Ou abra o menu e selecione{' '}
                    <span className="font-semibold text-neon-cyan">"Instalar CryptoFlow Intelligence"</span>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">3</span>
                  <span>
                    Confirme clicando em{' '}
                    <span className="font-semibold text-neon-cyan">"Instalar"</span>.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">1</span>
                  <span>
                    Toque no menu (três pontos) no Chrome.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">2</span>
                  <span>
                    Selecione{' '}
                    <span className="font-semibold text-neon-cyan">"Adicionar à tela inicial"</span>{' '}
                    ou{' '}
                    <span className="font-semibold text-neon-cyan">"Instalar app"</span>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-bold flex items-center justify-center">3</span>
                  <span>
                    Confirme tocando em{' '}
                    <span className="font-semibold text-neon-cyan">"Adicionar"</span>.
                  </span>
                </li>
              </ol>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
              O app funcionará sem necessidade do navegador, com acesso rápido e suporte offline.
            </p>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              onClick={() => setShowManualDialog(false)}
              className="bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
              size="sm"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
