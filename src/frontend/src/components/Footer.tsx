import { Heart } from "lucide-react";
import React from "react";
import { useBinanceData } from "../hooks/useBinanceData";

export default function Footer() {
  const { connectionStatus } = useBinanceData();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== "undefined"
      ? window.location.hostname
      : "cryptoflow-intelligence",
  );

  const statusLabel =
    connectionStatus === "connected"
      ? "Dados em Tempo Real Ativos"
      : connectionStatus === "polling"
        ? "Modo Polling Ativo"
        : connectionStatus === "loading"
          ? "Conectando..."
          : "Dados Offline";

  const statusColor =
    connectionStatus === "connected"
      ? "text-neon-green"
      : connectionStatus === "polling"
        ? "text-yellow-400"
        : connectionStatus === "loading"
          ? "text-muted-foreground"
          : "text-red-400";

  return (
    <footer className="bg-surface border-t border-border/50 py-4 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connectionStatus === "connected" ? "bg-neon-green animate-pulse" : connectionStatus === "polling" ? "bg-yellow-400 animate-pulse" : "bg-red-400"}`}
          />
          <span className={statusColor}>{statusLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>© {year} CryptoFlow Intelligence · Feito com</span>
          <Heart className="w-3 h-3 text-neon-green fill-neon-green mx-0.5" />
          <span>usando</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-green hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
