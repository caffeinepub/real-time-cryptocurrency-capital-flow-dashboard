/**
 * PWA utility functions for managing installation and updates
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Check if browser supports BeforeInstallPromptEvent
 */
export function supportsInstallPrompt(): boolean {
  return 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window;
}

/**
 * Check if running on HTTPS (required for PWA)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
}

/**
 * Validate PWA installability requirements
 */
export function validatePWARequirements(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isSecureContext()) {
    errors.push('App deve ser servido via HTTPS');
  }

  if (!('serviceWorker' in navigator)) {
    errors.push('Service Worker não suportado');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Initialize PWA install prompt listener
 */
export function initPWAInstallPrompt(): void {
  // Validate requirements first
  const validation = validatePWARequirements();
  if (!validation.isValid) {
    console.warn('[PWA] Requisitos não atendidos:', validation.errors);
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[PWA] Prompt de instalação disponível');
    
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App instalado com sucesso');
    deferredPrompt = null;
    // Clear dismissed flag when app is installed
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-dismissed-desktop');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

/**
 * Show the PWA install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] Prompt de instalação não disponível');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
    
    if (outcome === 'accepted') {
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-install-dismissed-desktop');
    }
    
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Erro ao mostrar prompt de instalação:', error);
    return false;
  }
}

/**
 * Check if the app is running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is desktop
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice();
}

/**
 * Check if device is iOS
 */
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Check if device is Android
 */
export function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Get PWA display mode
 */
export function getPWADisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (isStandalone()) {
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    return 'standalone';
  }
  return 'browser';
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    await registration.update();
    return registration.waiting !== null;
  } catch (error) {
    console.error('[PWA] Erro ao verificar atualizações:', error);
    return false;
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function activateUpdate(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });
}

/**
 * Get installation status information
 */
export function getInstallationStatus(): {
  isInstallable: boolean;
  isInstalled: boolean;
  canPrompt: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  supportsPrompt: boolean;
  isSecure: boolean;
} {
  const isInstalled = isStandalone();
  const canPrompt = canInstallPWA();
  const supportsPrompt = supportsInstallPrompt();
  const isSecure = isSecureContext();
  
  let platform: 'ios' | 'android' | 'desktop' | 'unknown' = 'unknown';
  if (isIOSDevice()) {
    platform = 'ios';
  } else if (isAndroidDevice()) {
    platform = 'android';
  } else if (isDesktopDevice()) {
    platform = 'desktop';
  }

  return {
    isInstallable: !isInstalled && (canPrompt || platform === 'ios'),
    isInstalled,
    canPrompt,
    platform,
    supportsPrompt,
    isSecure,
  };
}

/**
 * Request caching of specific URLs for offline support
 */
export function cacheURLsForOffline(urls: string[]): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
    }
  });
}
