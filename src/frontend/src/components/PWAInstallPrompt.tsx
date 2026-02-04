import { useState, useEffect } from 'react';
import { X, Download, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  showInstallPrompt, 
  isStandalone, 
  getInstallationStatus,
  isDesktopDevice
} from '@/lib/pwaUtils';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installStatus, setInstallStatus] = useState(getInstallationStatus());

  useEffect(() => {
    // Don't show if already installed
    if (installStatus.isInstalled) {
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissedKey = installStatus.platform === 'desktop' 
      ? 'pwa-install-dismissed-desktop' 
      : 'pwa-install-dismissed';
    const dismissed = localStorage.getItem(dismissedKey);
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    // Show prompt again after 3 days if previously dismissed
    if (dismissedTime && now - dismissedTime < threeDays) {
      return;
    }

    // For iOS, show custom instructions after delay
    if (installStatus.platform === 'ios') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // For desktop and Android/Chrome, listen for install availability
    const handleInstallAvailable = () => {
      setInstallStatus(getInstallationStatus());
      setShowPrompt(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Check periodically if prompt becomes available
    const checkInterval = setInterval(() => {
      const status = getInstallationStatus();
      if (status.canPrompt && !showPrompt) {
        setInstallStatus(status);
        setShowPrompt(true);
        clearInterval(checkInterval);
      }
    }, 1000);

    // Fallback: show after 3 seconds for Android/Desktop even without prompt
    const fallbackTimer = setTimeout(() => {
      if ((installStatus.platform === 'android' || installStatus.platform === 'desktop') && !isStandalone()) {
        setShowPrompt(true);
      }
      clearInterval(checkInterval);
    }, 3000);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      clearInterval(checkInterval);
      clearTimeout(fallbackTimer);
    };
  }, [installStatus.isInstalled, installStatus.platform, showPrompt]);

  const handleInstall = async () => {
    if (installStatus.platform === 'ios') {
      // For iOS, instructions are already shown
      return;
    }

    // For Android/Chrome/Desktop with native prompt support
    if (installStatus.canPrompt) {
      const installed = await showInstallPrompt();
      if (installed) {
        setShowPrompt(false);
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.removeItem('pwa-install-dismissed-desktop');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const dismissedKey = installStatus.platform === 'desktop' 
      ? 'pwa-install-dismissed-desktop' 
      : 'pwa-install-dismissed';
    localStorage.setItem(dismissedKey, Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  const isIOS = installStatus.platform === 'ios';
  const isAndroid = installStatus.platform === 'android';
  const isDesktop = installStatus.platform === 'desktop';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-neon-cyan/20 via-neon-blue/20 to-neon-purple/20 backdrop-blur-lg border border-neon-cyan/30 rounded-lg shadow-2xl shadow-neon-cyan/20 overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-20 bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 flex items-center justify-center overflow-hidden">
          <img 
            src="/assets/generated/install-prompt-banner.dim_800x120.png" 
            alt="Install Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 flex items-center gap-3">
            {isDesktop ? (
              <Monitor className="w-8 h-8 text-neon-cyan animate-pulse" />
            ) : (
              <Smartphone className="w-8 h-8 text-neon-cyan animate-pulse" />
            )}
            <span className="text-xl font-bold text-neon-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              Crypto Flow Dashboard
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8">
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDesktop 
                ? 'Instale este aplicativo no seu computador' 
                : 'Instale este aplicativo no seu celular'}
            </h3>
            
            {isIOS && (
              <div className="space-y-2 text-sm text-gray-300">
                <p className="text-neon-cyan font-medium">Para instalar no iOS Safari:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Toque no ícone de compartilhar <span className="inline-block text-lg">⎋</span> (na barra inferior)</li>
                  <li>Role para baixo e toque em <span className="font-semibold text-white">"Adicionar à Tela de Início"</span></li>
                  <li>Toque em <span className="font-semibold text-white">"Adicionar"</span> no canto superior direito</li>
                </ol>
                <p className="text-xs text-gray-400 mt-2">
                  O app aparecerá na sua tela inicial como um aplicativo nativo.
                </p>
              </div>
            )}

            {isAndroid && !installStatus.canPrompt && (
              <div className="space-y-2 text-sm text-gray-300">
                <p className="mb-2">
                  Acesse o dashboard de fluxo de capital cripto diretamente da sua tela inicial.
                </p>
                <p className="text-neon-cyan font-medium">Para instalar no Chrome Android:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Toque no menu <span className="inline-block text-lg">⋮</span> (três pontos)</li>
                  <li>Selecione <span className="font-semibold text-white">"Adicionar à tela inicial"</span> ou <span className="font-semibold text-white">"Instalar app"</span></li>
                  <li>Confirme tocando em <span className="font-semibold text-white">"Adicionar"</span></li>
                </ol>
              </div>
            )}

            {isDesktop && !installStatus.canPrompt && (
              <div className="space-y-2 text-sm text-gray-300">
                <p className="mb-2">
                  Instale o dashboard como um aplicativo nativo no seu computador para acesso rápido e funcionalidade offline.
                </p>
                <p className="text-neon-cyan font-medium">Para instalar no Chrome/Edge:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Clique no ícone de instalação <span className="inline-block text-lg">⊕</span> na barra de endereço</li>
                  <li>Ou abra o menu <span className="inline-block text-lg">⋮</span> e selecione <span className="font-semibold text-white">"Instalar Crypto Flow Dashboard"</span></li>
                  <li>Confirme clicando em <span className="font-semibold text-white">"Instalar"</span></li>
                </ol>
                <p className="text-xs text-gray-400 mt-2">
                  O app aparecerá como um aplicativo independente com ícone próprio.
                </p>
              </div>
            )}

            {(isAndroid || isDesktop) && installStatus.canPrompt && (
              <p className="text-sm text-gray-300 mb-4">
                {isDesktop 
                  ? 'Instale o dashboard como aplicativo nativo no seu computador para acesso rápido, funcionalidade offline completa e experiência otimizada.'
                  : 'Acesse o dashboard de fluxo de capital cripto diretamente da sua tela inicial com experiência nativa e offline.'}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              {(isAndroid || isDesktop) && installStatus.canPrompt && (
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-cyan/80 hover:to-neon-blue/80 text-black font-semibold shadow-lg shadow-neon-cyan/30 transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar Agora
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                className={`${(isAndroid || isDesktop) && installStatus.canPrompt ? '' : 'flex-1'} border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10`}
              >
                {isIOS || !installStatus.canPrompt ? 'Entendi' : 'Mais Tarde'}
              </Button>
            </div>

            {/* Security indicator */}
            {!installStatus.isSecure && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>Requer conexão HTTPS para instalação</span>
              </p>
            )}

            {/* Offline support indicator */}
            {installStatus.isSecure && (
              <p className="text-xs text-neon-cyan/70 mt-2 flex items-center gap-1">
                <span>✓</span>
                <span>Suporte offline completo para todas as 5 abas principais</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
