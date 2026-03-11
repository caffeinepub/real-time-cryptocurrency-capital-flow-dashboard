import { u as useBinanceData, r as reactExports, j as jsxRuntimeExports, L as Layers } from "./index-C5QA2IZY.js";
import { A as Alert, a as AlertDescription } from "./alert-DMbaE6f_.js";
import { a as useConfluenceZones, C as CircleAlert } from "./useQueries-CPONU3dN.js";
import { r as roundToTwoDecimals, b as formatPercentage } from "./useActor-OERJBcGn.js";
import { Z as Zap } from "./zap-BQJKmpBr.js";
import "./useQuery-CcrFhlcP.js";
function ConfluenceZones() {
  const { data: zones, isLoading, error } = useConfluenceZones();
  const { isLive, hasData, marketData } = useBinanceData();
  const [displayZones, setDisplayZones] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if ((!zones || zones.length === 0) && marketData.length > 0) {
      const syntheticZones = marketData.filter((data) => Math.abs(data.priceChangePercent) > 1).map((data) => {
        const indicators = ["Ação de Preço", "Pico de Volume"];
        if (Math.abs(data.priceChangePercent) > 3)
          indicators.push("Momentum");
        if (data.volume > 1e6) indicators.push("Volume Alto");
        return {
          indicators,
          intensity: roundToTwoDecimals(
            Math.min(1, Math.abs(data.priceChangePercent) / 10)
          ),
          timestamp: BigInt(data.lastUpdate)
        };
      });
      setDisplayZones(syntheticZones);
    } else if (zones && Array.isArray(zones)) {
      setDisplayZones(zones);
    }
  }, [zones, marketData]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Carregando zonas de confluência..." })
    ] }) });
  }
  const sortedZones = displayZones ? [...displayZones].sort((a, b) => b.intensity - a.intensity) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent", children: "Zonas de Confluência" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Detecção de sinais sobrepostos e indicadores convergentes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Zap,
          {
            className: `w-4 h-4 text-neon-green ${isLive ? "animate-pulse" : ""}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-neon-green", children: isLive ? "Detectando" : "Cache" })
      ] })
    ] }),
    !isLive && !hasData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-neon-pink/50 bg-neon-pink/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-neon-pink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-neon-pink", children: "Não foi possível conectar à API Binance. Exibindo zonas em cache. Tentando reconectar..." })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-neon-pink/50 bg-neon-pink/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-neon-pink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-neon-pink", children: [
        "Erro ao carregar zonas:",
        " ",
        error instanceof Error ? error.message : "Erro desconhecido"
      ] })
    ] }),
    sortedZones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-card/50 rounded-xl border border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-16 h-16 mx-auto text-muted-foreground/50 mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Nenhuma zona de confluência detectada ainda" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground/70 mt-2", children: isLive ? "As zonas aparecerão quando múltiplos sinais se alinharem" : "Aguardando dados de mercado..." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6", children: sortedZones.map((zone, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfluenceZoneCard,
        {
          zone,
          index
        },
        String(zone.timestamp) || index
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-neon-cyan" }),
          "Legenda de Intensidade"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-neon-green shadow-neon-green-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Intensidade Alta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Intensidade > 70%" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-neon-blue shadow-neon-blue-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Intensidade Média" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Intensidade 40-70%" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-neon-cyan shadow-neon-cyan-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Intensidade Baixa" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Intensidade < 40%" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function ConfluenceZoneCard({ zone, index }) {
  const getIntensityStyles = () => {
    if (zone.intensity > 0.7) {
      return {
        color: "text-neon-green",
        bg: "bg-neon-green/20",
        border: "border-neon-green/50",
        shadow: "shadow-neon-green-sm",
        gradient: "from-neon-green/50 via-neon-green to-neon-green/50",
        glow1: "bg-neon-green/5",
        glow2: "bg-neon-green/3",
        label: "Alta"
      };
    }
    if (zone.intensity > 0.4) {
      return {
        color: "text-neon-blue",
        bg: "bg-neon-blue/20",
        border: "border-neon-blue/50",
        shadow: "shadow-neon-blue-sm",
        gradient: "from-neon-blue/50 via-neon-blue to-neon-blue/50",
        glow1: "bg-neon-blue/5",
        glow2: "bg-neon-blue/3",
        label: "Média"
      };
    }
    return {
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/20",
      border: "border-neon-cyan/50",
      shadow: "shadow-neon-cyan-sm",
      gradient: "from-neon-cyan/50 via-neon-cyan to-neon-cyan/50",
      glow1: "bg-neon-cyan/5",
      glow2: "bg-neon-cyan/3",
      label: "Baixa"
    };
  };
  const styles = getIntensityStyles();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 hover:border-neon-green/50 transition-all duration-300 hover:shadow-neon-green-sm overflow-hidden",
      style: { animationDelay: `${index * 100}ms` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `w-12 h-12 rounded-lg ${styles.bg} border ${styles.border} flex items-center justify-center ${styles.shadow}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: `w-6 h-6 ${styles.color}` })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-foreground", children: [
                "Zona de Confluência #",
                index + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                zone.indicators.length,
                " indicadores sobrepostos"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `px-4 py-2 rounded-full ${styles.bg} border ${styles.border}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-bold ${styles.color}`, children: styles.label })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Intensidade da Zona" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${styles.color} text-lg`, children: formatPercentage(zone.intensity) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-accent/30 rounded-full overflow-hidden relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-full bg-gradient-to-r ${styles.gradient} transition-all duration-1000 ${styles.shadow} animate-pulse-slow`,
              style: { width: `${zone.intensity * 100}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-3", children: "Indicadores Ativos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: zone.indicators.map((indicator, _idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `px-3 py-2 rounded-lg ${styles.bg} border ${styles.border} text-center`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium ${styles.color}`, children: indicator })
            },
            indicator
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 right-0 w-full h-full pointer-events-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `absolute top-0 right-0 w-64 h-64 ${styles.glow1} rounded-full blur-3xl`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `absolute bottom-0 left-0 w-48 h-48 ${styles.glow2} rounded-full blur-2xl`
            }
          )
        ] })
      ]
    }
  );
}
function ConfluenceZonesTabSurface() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConfluenceZones, {}) });
}
export {
  ConfluenceZonesTabSurface as default
};
