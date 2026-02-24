import { useEffect } from 'react';
import { toast } from 'sonner';
import { checkForUpdates, activateUpdate } from '@/lib/pwaUtils';

/**
 * Hook to check for PWA updates and show toast notification
 */
export function usePWAUpdateToast() {
  useEffect(() => {
    // Don't check for updates if service worker is not supported
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let hasShownToast = false;

    // Check for updates on mount
    const checkAndNotify = async () => {
      const hasUpdate = await checkForUpdates();
      if (hasUpdate && !hasShownToast) {
        hasShownToast = true;
        toast('Update Available', {
          description: 'A new version of the app is available.',
          duration: Infinity,
          action: {
            label: 'Update',
            onClick: () => {
              activateUpdate();
            },
          },
          cancel: {
            label: 'Later',
            onClick: () => {
              // User dismissed, will check again on next visit
            },
          },
        });
      }
    };

    // Check immediately
    checkAndNotify();

    // Listen for service worker updates
    const handleControllerChange = () => {
      if (!hasShownToast) {
        checkAndNotify();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check periodically (every 5 minutes)
    const interval = setInterval(() => {
      if (!hasShownToast) {
        checkAndNotify();
      }
    }, 5 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(interval);
    };
  }, []);
}
