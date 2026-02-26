import { useEffect } from 'react';
import { toast } from 'sonner';
import { checkForUpdates, activateUpdate } from '@/lib/pwaUtils';

/**
 * Hook to check for PWA updates and show a toast notification.
 */
export function usePWAUpdateToast() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let hasShownToast = false;

    const checkAndNotify = async () => {
      let reg: ServiceWorkerRegistration | undefined;
      try {
        reg = await navigator.serviceWorker.getRegistration();
      } catch {
        return;
      }
      if (!reg) return;

      const hasUpdate = await checkForUpdates(reg);
      if (hasUpdate && !hasShownToast) {
        hasShownToast = true;
        toast('Atualização disponível', {
          description: 'Uma nova versão do app está disponível.',
          duration: Infinity,
          action: {
            label: 'Atualizar',
            onClick: () => activateUpdate(reg),
          },
          cancel: {
            label: 'Depois',
            onClick: () => {
              // dismissed
            },
          },
        });
      }
    };

    checkAndNotify();

    const handleControllerChange = () => {
      if (!hasShownToast) checkAndNotify();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const interval = setInterval(() => {
      if (!hasShownToast) checkAndNotify();
    }, 5 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(interval);
    };
  }, []);
}
