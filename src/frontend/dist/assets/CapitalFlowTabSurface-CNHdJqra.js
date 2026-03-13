import { c as createLucideIcon, u as useBinanceData, r as reactExports, j as jsxRuntimeExports, A as Activity, T as TrendingUp } from "./index-Cp4Kx-hg.js";
import { A as Alert, a as AlertDescription } from "./alert-C6GpQPPM.js";
import { u as useCapitalFlows, C as CircleAlert } from "./useQueries-Cq_i7iED.js";
import { r as roundToTwoDecimals, f as formatCurrency, a as formatNumber, b as formatPercentage } from "./useActor-X-fOggZ1.js";
import { T as TrendingDown } from "./trending-down-BqSIDY_Z.js";
import { R as RefreshCw } from "./refresh-cw-BSMAoat4.js";
import "./useQuery-rPhoS-Gq.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
];
const ArrowDown = createLucideIcon("arrow-down", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
];
const ArrowUp = createLucideIcon("arrow-up", __iconNode);
function FlowVisualization() {
  const { data: flows, isLoading, error } = useCapitalFlows();
  const { isLive, hasData, marketData } = useBinanceData();
  const [animatedFlows, setAnimatedFlows] = reactExports.useState([]);
  const [interpretationSummary, setInterpretationSummary] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (flows && Array.isArray(flows)) {
      setAnimatedFlows(flows);
    }
  }, [flows]);
  reactExports.useEffect(() => {
    if ((!flows || flows.length === 0) && marketData.length > 0) {
      const syntheticFlows = marketData.map((data) => ({
        fromAsset: {
          symbol: "USD",
          name: "Dólar Americano",
          usdValue: 1
        },
        toAsset: {
          symbol: data.symbol.replace("USDT", ""),
          name: data.symbol.replace("USDT", ""),
          usdValue: roundToTwoDecimals(data.price)
        },
        amount: roundToTwoDecimals(data.quoteVolume),
        timestamp: BigInt(data.lastUpdate),
        flowIntensity: roundToTwoDecimals(
          Math.min(1, Math.abs(data.priceChangePercent) / 10)
        ),
        pnlRatio: roundToTwoDecimals(data.priceChangePercent / 100),
        marketImpact: roundToTwoDecimals(Math.min(1, data.volume / 1e6))
      }));
      setAnimatedFlows(syntheticFlows);
    }
  }, [flows, marketData]);
  reactExports.useEffect(() => {
    if (animatedFlows.length > 0) {
      const btcFlow = animatedFlows.find((f) => f.toAsset.symbol === "BTC");
      const ethFlow = animatedFlows.find((f) => f.toAsset.symbol === "ETH");
      const altcoinFlows = animatedFlows.filter(
        (f) => f.toAsset.symbol !== "BTC" && f.toAsset.symbol !== "ETH"
      );
      const totalAltcoinIntensity = altcoinFlows.reduce(
        (sum, f) => sum + f.flowIntensity,
        0
      );
      const avgAltcoinIntensity = altcoinFlows.length > 0 ? totalAltcoinIntensity / altcoinFlows.length : 0;
      if (btcFlow && btcFlow.flowIntensity > 0.6) {
        setInterpretationSummary("Capital migrando para BTC");
      } else if (ethFlow && ethFlow.flowIntensity > 0.6) {
        setInterpretationSummary("Capital concentrando em ETH");
      } else if (avgAltcoinIntensity > 0.5) {
        setInterpretationSummary("Altcoins ganhando influxo");
      } else if (btcFlow && ethFlow && btcFlow.flowIntensity > 0.4 && ethFlow.flowIntensity > 0.4) {
        setInterpretationSummary("Fluxo distribuído entre principais ativos");
      } else {
        setInterpretationSummary("Mercado em consolidação");
      }
    }
  }, [animatedFlows]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Carregando dados de fluxo de capital..." })
    ] }) });
  }
  const calculatePercentages = () => {
    if (!animatedFlows || animatedFlows.length === 0) return [];
    const total = animatedFlows.reduce((sum, flow) => sum + flow.amount, 0);
    return animatedFlows.map((flow) => ({
      ...flow,
      percentage: roundToTwoDecimals(
        total > 0 ? flow.amount / total * 100 : 0
      )
    }));
  };
  const flowsWithPercentages = calculatePercentages();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent", children: "Fluxo de Capital" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Movimentação de capital USD para criptomoedas em tempo real" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Activity,
          {
            className: `w-4 h-4 text-neon-cyan ${isLive ? "animate-pulse" : ""}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-neon-cyan", children: isLive ? "Ao Vivo" : "Cache" })
      ] })
    ] }),
    interpretationSummary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-neon-cyan/10 via-neon-blue/10 to-neon-purple/10 border border-neon-cyan/30 rounded-xl p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center animate-pulse-slow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-5 h-5 text-neon-cyan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Interpretação em Tempo Real" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-foreground", children: interpretationSummary })
      ] })
    ] }) }),
    !isLive && !hasData && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-neon-pink/50 bg-neon-pink/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-neon-pink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-neon-pink", children: "Não foi possível conectar à API Binance. Exibindo dados em cache. Tentando reconectar..." })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-neon-pink/50 bg-neon-pink/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-neon-pink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { className: "text-neon-pink", children: [
        "Erro ao carregar dados:",
        " ",
        error instanceof Error ? error.message : "Erro desconhecido"
      ] })
    ] }),
    flowsWithPercentages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-card/50 rounded-xl border border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-16 h-16 mx-auto text-muted-foreground/50 mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Nenhum dado de fluxo de capital disponível ainda" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground/70 mt-2", children: isLive ? "Os dados de fluxo aparecerão aqui em tempo real" : "Aguardando dados de mercado..." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: flowsWithPercentages.map((flow, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      FlowCard,
      {
        flow,
        index
      },
      `${flow.toAsset.symbol}-${index}`
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Total de Fluxos",
          value: animatedFlows.length.toString(),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-5 h-5" }),
          color: "cyan"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Volume Total",
          value: formatCurrency(
            animatedFlows.reduce((sum, f) => sum + f.amount, 0)
          ),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5" }),
          color: "blue"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          title: "Intensidade Média",
          value: animatedFlows.length > 0 ? formatNumber(
            animatedFlows.reduce((sum, f) => sum + f.flowIntensity, 0) / animatedFlows.length
          ) : formatNumber(0),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-5 h-5" }),
          color: "green"
        }
      )
    ] })
  ] });
}
function FlowCard({ flow, index }) {
  const getIntensityStyles = () => {
    if (flow.flowIntensity > 0.7) {
      return {
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/30",
        shadow: "shadow-neon-green-sm",
        gradient: "from-neon-green/50 to-neon-green",
        glow: "bg-neon-green/5 group-hover:bg-neon-green/10"
      };
    }
    if (flow.flowIntensity > 0.4) {
      return {
        color: "text-neon-blue",
        bg: "bg-neon-blue/10",
        border: "border-neon-blue/30",
        shadow: "shadow-neon-blue-sm",
        gradient: "from-neon-blue/50 to-neon-blue",
        glow: "bg-neon-blue/5 group-hover:bg-neon-blue/10"
      };
    }
    return {
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      border: "border-neon-cyan/30",
      shadow: "shadow-neon-cyan-sm",
      gradient: "from-neon-cyan/50 to-neon-cyan",
      glow: "bg-neon-cyan/5 group-hover:bg-neon-cyan/10"
    };
  };
  const styles = getIntensityStyles();
  const getFlowIndicator = () => {
    if (flow.flowIntensity > 0.7) {
      return {
        icon: ArrowUp,
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/30",
        label: "Influxo Forte",
        emoji: "🟢"
      };
    }
    if (flow.flowIntensity > 0.4) {
      return {
        icon: RefreshCw,
        color: "text-neon-blue",
        bg: "bg-neon-blue/10",
        border: "border-neon-blue/30",
        label: "Transição",
        emoji: "🔁"
      };
    }
    return {
      icon: ArrowDown,
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
      border: "border-neon-pink/30",
      label: "Fluxo Fraco",
      emoji: "🔴"
    };
  };
  const indicator = getFlowIndicator();
  const IndicatorIcon = indicator.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "group relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-neon-cyan-sm animate-fade-in",
      style: { animationDelay: `${index * 100}ms` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-muted-foreground", children: flow.fromAsset.symbol }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground/70", children: flow.fromAsset.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ArrowRight,
              {
                className: `w-6 h-6 ${styles.color} animate-pulse-slow`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground", children: flow.toAsset.symbol }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground/70", children: flow.toAsset.name })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground animate-pulse-slow", children: formatCurrency(flow.amount) }),
            flow.percentage !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
              formatNumber(flow.percentage),
              "% do total"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${indicator.bg} border ${indicator.border}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: indicator.emoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IndicatorIcon, { className: `w-4 h-4 ${indicator.color} animate-pulse` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-medium ${indicator.color}`, children: indicator.label })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Intensidade do Fluxo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${styles.color} animate-pulse-slow`, children: formatPercentage(flow.flowIntensity) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-accent/30 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `h-full bg-gradient-to-r ${styles.gradient} transition-all duration-1000 ${styles.shadow} animate-pulse-slow`,
                style: { width: `${flow.flowIntensity * 100}%` }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "De: ",
              formatCurrency(flow.fromAsset.usdValue)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Para: ",
              formatCurrency(flow.toAsset.usdValue)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `absolute top-0 right-0 w-24 h-24 ${styles.glow} rounded-full blur-3xl -z-10 transition-all duration-500 animate-pulse-slow`
          }
        )
      ]
    }
  );
}
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    cyan: {
      text: "text-neon-cyan",
      border: "hover:border-neon-cyan/50"
    },
    blue: {
      text: "text-neon-blue",
      border: "hover:border-neon-blue/50"
    },
    green: {
      text: "text-neon-green",
      border: "hover:border-neon-green/50"
    }
  };
  const classes = colorClasses[color];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 ${classes.border} transition-all duration-300`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: classes.text, children: icon })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-3xl font-bold ${classes.text} animate-pulse-slow`, children: value })
      ]
    }
  );
}
function CapitalFlowTabSurface() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FlowVisualization, {}) });
}
export {
  CapitalFlowTabSurface as default
};
