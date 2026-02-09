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
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8">
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDesktop 
                ? 'Install this app on your computer' 
                : 'Install this app on your phone'}
            </h3>
            
            {isIOS && (
              <div className="space-y-2 text-sm text-gray-300">
                <p className="text-neon-cyan font-medium">To install on iOS Safari:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Tap the share icon <span className="inline-block text-lg">⎋</span> (at the bottom bar)</li>
                  <li>Scroll down and tap <span className="font-semibold text-white">"Add to Home Screen"</span></li>
                  <li>Tap <span className="font-semibold text-white">"Add"</span> in the top right corner</li>
                </ol>
                <p className="text-xs text-gray-400 mt-2">
                  The app will appear on your home screen like a native app.
                </p>
              </div>
            )}

            {isAndroid && !installStatus.canPrompt && (
              <div className="space-y-2 text-sm text-gray-300">
                <p className="mb-2">
                  Access the crypto capital flow dashboard directly from your home screen.
                </p>
                <p className="text-neon-cyan font-medium">To install on Chrome Android:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Tap the menu <span className="inline-block text-lg">⋮</span> (three dots)</li>
                  <li>Select <span className="font-semibold text-white">"Add to Home screen"</span> or <span className="font-semibold text-white">"Install app"</span></li>
                  <li>Confirm by tapping <span className="font-semibold text-white">"Add"</span></li>
                </ol>
              </div>
            )}

            {isDesktop && !installStatus.canPrompt && (
              <div className="space-y-2 text-sm text-gray-300">
                <p className="mb-2">
                  Install the dashboard as a native app on your computer for quick access and offline functionality.
                </p>
                <p className="text-neon-cyan font-medium">To install on Chrome/Edge:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click the install icon <span className="inline-block text-lg">⊕</span> in the address bar</li>
                  <li>Or open the menu <span className="inline-block text-lg">⋮</span> and select <span className="font-semibold text-white">"Install Crypto Flow Dashboard"</span></li>
                  <li>Confirm by clicking <span className="font-semibold text-white">"Install"</span></li>
                </ol>
                <p className="text-xs text-gray-400 mt-2">
                  The app will appear as a standalone application with its own icon.
                </p>
              </div>
            )}

            {(isAndroid || isDesktop) && installStatus.canPrompt && (
              <p className="text-sm text-gray-300 mb-4">
                {isDesktop 
                  ? 'Install the dashboard as a native app on your computer for quick access, full offline functionality, and an optimized experience.'
                  : 'Access the crypto capital flow dashboard directly from your home screen with a native experience and offline support.'}
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
                  Install Now
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                className={`${(isAndroid || isDesktop) && installStatus.canPrompt ? '' : 'flex-1'} border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10`}
              >
                {isIOS || !installStatus.canPrompt ? 'Got it' : 'Later'}
              </Button>
            </div>

            {/* Security indicator */}
            {!installStatus.isSecure && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>Requires HTTPS connection for installation</span>
              </p>
            )}

            {/* Offline support indicator */}
            {installStatus.isSecure && (
              <p className="text-xs text-neon-cyan/70 mt-2 flex items-center gap-1">
                <span>✓</span>
                <span>Full offline support for all main features</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
