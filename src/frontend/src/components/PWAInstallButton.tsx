import { Download, Smartphone } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { isIOS, isStandalone } from "../lib/pwaUtils";
import IOSInstallModal from "./IOSInstallModal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Don't show if already in standalone mode
    if (isStandalone()) return;

    if (isIOS()) {
      setIsReady(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!isReady) return null;

  const handleClick = async () => {
    if (isIOS()) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsReady(false);
      }
    } catch {
      // ignore
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isInstalling}
        className="flex items-center gap-1.5 text-xs font-medium text-neon-green border border-neon-green/40 rounded-lg px-2.5 py-1.5 hover:bg-neon-green/10 transition-all duration-200 min-h-[44px] disabled:opacity-50"
        aria-label="Instalar aplicativo"
        title="Instalar como app"
      >
        {isInstalling ? (
          <div className="w-3.5 h-3.5 border border-neon-green border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Instalar</span>
      </button>

      <IOSInstallModal
        open={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
}
