import { Plus, Share, X } from "lucide-react";
import React from "react";

interface IOSInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IOSInstallModal({
  open,
  onClose,
}: IOSInstallModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={onClose}
      onKeyUp={(e) => e.key === "Escape" && onClose()}
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-surface border border-border/60 rounded-t-2xl p-6 pb-safe slide-up"
        onClick={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-border rounded-full" />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* App icon + title */}
        <div className="flex items-center gap-3 mb-5 mt-2">
          <img
            src="/assets/generated/app-icon-192.dim_192x192.png"
            alt="CryptoFlow"
            className="w-12 h-12 rounded-xl"
          />
          <div>
            <h3 className="font-bold text-foreground">Instalar CryptoFlow</h3>
            <p className="text-xs text-muted-foreground">
              Adicionar à tela inicial
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-neon-green">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Toque em Compartilhar
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Toque no ícone <Share className="w-3 h-3 inline" /> na barra do
                Safari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-neon-green">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Adicionar à Tela de Início
              </p>
              <p className="text-xs text-muted-foreground">
                Role para baixo e toque em "Adicionar à Tela de Início"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-neon-green">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Confirmar</p>
              <p className="text-xs text-muted-foreground">
                Toque em "Adicionar" no canto superior direito
              </p>
            </div>
          </div>
        </div>

        {/* Benefit banner */}
        <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-3">
          <p className="text-xs text-neon-green font-medium">
            ✓ Abre sem barra do navegador (modo standalone)
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acesso rápido direto da tela inicial
          </p>
        </div>
      </div>
    </div>
  );
}
