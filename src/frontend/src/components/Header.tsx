import { Activity, Layers, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import { useBinanceData } from '../hooks/useBinanceData';
import LoginButton from './LoginButton';

type ModuleType = 'flows' | 'confluence' | 'futures';

interface HeaderProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

export default function Header({ activeModule, setActiveModule }: HeaderProps) {
  const { connectionStatus, isLive } = useBinanceData();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'neon-green';
      case 'connecting':
        return 'neon-blue';
      case 'disconnected':
      case 'error':
        return 'neon-pink';
      default:
        return 'muted';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'AO VIVO';
      case 'connecting':
        return 'CONECTANDO';
      case 'disconnected':
        return 'OFFLINE';
      case 'error':
        return 'ERRO';
      default:
        return 'INATIVO';
    }
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  const navButtons = [
    { id: 'flows' as ModuleType, label: 'Fluxo de Capital', icon: Activity, color: 'neon-cyan' },
    { id: 'confluence' as ModuleType, label: 'Zonas de Confluência', icon: Layers, color: 'neon-green' },
    { id: 'futures' as ModuleType, label: 'Futures Monitor', icon: TrendingUp, color: 'neon-yellow' },
  ];

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan via-neon-blue to-neon-purple flex items-center justify-center shadow-neon-cyan">
              <Activity className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent">
                CryptoFlow Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">Painel de Fluxo de Capital em Tempo Real</p>
            </div>
          </div>

          {/* Navigation and Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            {/* Live Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${statusColor}/10 border border-${statusColor}/30`}>
              {isLive ? (
                <Wifi className={`w-4 h-4 text-${statusColor} animate-pulse`} />
              ) : (
                <WifiOff className={`w-4 h-4 text-${statusColor}`} />
              )}
              <span className={`text-xs font-bold text-${statusColor} tracking-wider`}>
                {statusText}
              </span>
              {isLive && (
                <span className={`w-2 h-2 rounded-full bg-${statusColor} animate-pulse shadow-${statusColor}-sm`}></span>
              )}
            </div>

            {/* Navigation Buttons */}
            <nav className="flex gap-2 flex-wrap">
              {navButtons.map((button) => {
                const Icon = button.icon;
                const isActive = activeModule === button.id;
                
                return (
                  <button
                    key={button.id}
                    onClick={() => setActiveModule(button.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? `bg-${button.color}/20 text-${button.color} border border-${button.color}/50 shadow-${button.color}-sm`
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                    }`}
                    aria-label={button.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{button.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Login Button */}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
