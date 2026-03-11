import {
  Activity,
  BarChart2,
  Globe,
  Layers,
  Loader2,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import type React from "react";
import LoginButton from "./LoginButton";
import PWAInstallButton from "./PWAInstallButton";

type TabId = "bubbles" | "flow" | "confluence" | "futures";

interface HeaderProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  connectionStatus?: "connected" | "disconnected" | "polling" | "loading";
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "bubbles", label: "Mercado", icon: <Globe className="w-4 h-4" /> },
  { id: "flow", label: "Fluxo", icon: <TrendingUp className="w-4 h-4" /> },
  {
    id: "confluence",
    label: "Confluências",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "futures",
    label: "Order Flow",
    icon: <Activity className="w-4 h-4" />,
  },
];

function ConnectionIndicator({ status }: { status?: string }) {
  if (!status || status === "loading") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Conectando</span>
      </div>
    );
  }
  if (status === "connected") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-neon-green">
        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        <span className="hidden sm:inline">Ao Vivo</span>
      </div>
    );
  }
  if (status === "polling") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-yellow-400">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span className="hidden sm:inline">Polling</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-red-400">
      <WifiOff className="w-3 h-3" />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
}

export default function Header({
  activeTab,
  onTabChange,
  connectionStatus,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border/50 pt-safe">
      <div className="flex items-center justify-between px-3 sm:px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-4 h-4 text-neon-green" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm text-foreground tracking-tight leading-none block">
              CryptoFlow
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <ConnectionIndicator status={connectionStatus} />
          <PWAInstallButton />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
