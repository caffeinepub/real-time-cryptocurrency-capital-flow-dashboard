/**
 * PWA utility functions for managing installation and updates
 */

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function isDesktop(): boolean {
  return !isIOS() && !isAndroid();
}

export function isPWAInstallable(): boolean {
  return !isStandalone();
}

export function isSecureContext(): boolean {
  return (
    window.isSecureContext ||
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost"
  );
}

export function supportsInstallPrompt(): boolean {
  return "onbeforeinstallprompt" in window;
}

/**
 * Check for a waiting service worker update.
 * Returns true if an update is available.
 */
export async function checkForUpdates(
  registration?: ServiceWorkerRegistration,
): Promise<boolean> {
  try {
    const reg =
      registration ?? (await navigator.serviceWorker.getRegistration());
    if (!reg) return false;
    await reg.update();
    return !!reg.waiting;
  } catch {
    return false;
  }
}

/**
 * Activate a waiting service worker immediately.
 */
export function activateUpdate(registration?: ServiceWorkerRegistration): void {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    return;
  }
  // Fallback: reload to pick up the new SW
  window.location.reload();
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
