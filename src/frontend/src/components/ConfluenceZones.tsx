import { Layers, Zap, AlertCircle } from 'lucide-react';
import { useConfluenceZones } from '../hooks/useQueries';
import { useBinanceData } from '../hooks/useBinanceData';
import type { ConfluenceZone } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { formatPercentage, roundToTwoDecimals } from '../lib/formatters';

export default function ConfluenceZones() {
  const { data: zones, isLoading, error } = useConfluenceZones();
  const { isLive, hasData, marketData } = useBinanceData();
  const [displayZones, setDisplayZones] = useState<ConfluenceZone[]>([]);

  // Generate synthetic zones from live Binance data when backend has no data
  useEffect(() => {
    if ((!zones || zones.length === 0) && marketData.length > 0) {
      const syntheticZones: ConfluenceZone[] = marketData
        .filter(data => Math.abs(data.priceChangePercent) > 1)
        .map(data => {
          const indicators = ['Ação de Preço', 'Pico de Volume'];
          if (Math.abs(data.priceChangePercent) > 3) indicators.push('Momentum');
          if (data.volume > 1000000) indicators.push('Volume Alto');
          
          return {
            indicators,
            intensity: roundToTwoDecimals(Math.min(1, Math.abs(data.priceChangePercent) / 10)),
            timestamp: BigInt(data.lastUpdate),
          };
        });
      setDisplayZones(syntheticZones);
    } else if (zones && Array.isArray(zones)) {
      setDisplayZones(zones);
    }
  }, [zones, marketData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Carregando zonas de confluência...</p>
        </div>
      </div>
    );
  }

  const sortedZones = displayZones ? [...displayZones].sort((a, b) => b.intensity - a.intensity) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            Sistema Dinâmico de Zonas de Confluência
          </h2>
          <p className="text-muted-foreground mt-1">Visualização em camadas de sinais e indicadores sobrepostos</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
          <Zap className={`w-4 h-4 text-neon-green ${isLive ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium text-neon-green">{isLive ? 'Detectando' : 'Cache'}</span>
        </div>
      </div>

      {!isLive && !hasData && (
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="text-neon-pink">
            Não foi possível conectar à API Binance. Exibindo zonas em cache. Tentando reconectar...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-neon-pink/50 bg-neon-pink/10">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertDescription className="text-neon-pink">
            Erro ao carregar zonas: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      )}

      {sortedZones.length === 0 ? (
        <div className="text-center py-16 bg-card/50 rounded-xl border border-border/50">
          <Layers className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma zona de confluência detectada ainda</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            {isLive ? 'As zonas aparecerão quando múltiplos sinais se alinharem' : 'Aguardando dados de mercado...'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {sortedZones.map((zone, index) => (
              <ConfluenceZoneCard key={index} zone={zone} index={index} />
            ))}
          </div>

          <div className="mt-8 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-neon-cyan" />
              Legenda das Zonas de Confluência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-neon-green shadow-neon-green-sm"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Intensidade Alta</p>
                  <p className="text-xs text-muted-foreground">Intensidade &gt; 70%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-neon-blue shadow-neon-blue-sm"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Intensidade Média</p>
                  <p className="text-xs text-muted-foreground">Intensidade 40-70%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-neon-cyan shadow-neon-cyan-sm"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Intensidade Baixa</p>
                  <p className="text-xs text-muted-foreground">Intensidade &lt; 40%</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ConfluenceZoneCardProps {
  zone: ConfluenceZone;
  index: number;
}

function ConfluenceZoneCard({ zone, index }: ConfluenceZoneCardProps) {
  const getIntensityStyles = () => {
    if (zone.intensity > 0.7) {
      return {
        color: 'text-neon-green',
        bg: 'bg-neon-green/20',
        border: 'border-neon-green/50',
        shadow: 'shadow-neon-green-sm',
        gradient: 'from-neon-green/50 via-neon-green to-neon-green/50',
        glow1: 'bg-neon-green/5',
        glow2: 'bg-neon-green/3',
        label: 'Alta'
      };
    } else if (zone.intensity > 0.4) {
      return {
        color: 'text-neon-blue',
        bg: 'bg-neon-blue/20',
        border: 'border-neon-blue/50',
        shadow: 'shadow-neon-blue-sm',
        gradient: 'from-neon-blue/50 via-neon-blue to-neon-blue/50',
        glow1: 'bg-neon-blue/5',
        glow2: 'bg-neon-blue/3',
        label: 'Média'
      };
    }
    return {
      color: 'text-neon-cyan',
      bg: 'bg-neon-cyan/20',
      border: 'border-neon-cyan/50',
      shadow: 'shadow-neon-cyan-sm',
      gradient: 'from-neon-cyan/50 via-neon-cyan to-neon-cyan/50',
      glow1: 'bg-neon-cyan/5',
      glow2: 'bg-neon-cyan/3',
      label: 'Baixa'
    };
  };

  const styles = getIntensityStyles();

  return (
    <div
      className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 hover:border-neon-green/50 transition-all duration-300 hover:shadow-neon-green-sm overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${styles.bg} border ${styles.border} flex items-center justify-center ${styles.shadow}`}>
            <Layers className={`w-6 h-6 ${styles.color}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Zona de Confluência #{index + 1}</h3>
            <p className="text-sm text-muted-foreground">{zone.indicators.length} indicadores sobrepostos</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full ${styles.bg} border ${styles.border}`}>
          <span className={`text-sm font-bold ${styles.color}`}>{styles.label}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">Intensidade da Zona</span>
          <span className={`font-bold ${styles.color} text-lg`}>{formatPercentage(zone.intensity)}</span>
        </div>
        <div className="h-4 bg-accent/30 rounded-full overflow-hidden relative">
          <div
            className={`h-full bg-gradient-to-r ${styles.gradient} transition-all duration-1000 ${styles.shadow} animate-pulse-slow`}
            style={{ width: `${zone.intensity * 100}%` }}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Indicadores Ativos</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {zone.indicators.map((indicator, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 rounded-lg ${styles.bg} border ${styles.border} text-center`}
            >
              <span className={`text-xs font-medium ${styles.color}`}>{indicator}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layered visual effect */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className={`absolute top-0 right-0 w-64 h-64 ${styles.glow1} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-0 left-0 w-48 h-48 ${styles.glow2} rounded-full blur-2xl`}></div>
      </div>
    </div>
  );
}
