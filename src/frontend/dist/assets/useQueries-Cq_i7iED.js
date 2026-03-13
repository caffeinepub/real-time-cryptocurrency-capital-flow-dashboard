import { c as createLucideIcon, u as useBinanceData } from "./index-Cp4Kx-hg.js";
import { u as useQuery } from "./useQuery-rPhoS-Gq.js";
import { u as useActor, s as symbolsMatch, r as roundToTwoDecimals, W as WHITELISTED_SYMBOLS } from "./useActor-X-fOggZ1.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode);
function useCapitalFlows() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();
  return useQuery({
    queryKey: ["capitalFlows"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const flows = await actor.getAllFlows();
        if (marketData.length > 0 && flows.length > 0) {
          return flows.map((flow) => {
            const liveData = marketData.find(
              (m) => symbolsMatch(m.symbol, flow.toAsset.symbol)
            );
            if (liveData) {
              return {
                ...flow,
                toAsset: {
                  ...flow.toAsset,
                  usdValue: roundToTwoDecimals(liveData.price)
                },
                flowIntensity: roundToTwoDecimals(
                  Math.min(1, Math.abs(liveData.priceChangePercent) / 10)
                )
              };
            }
            return flow;
          });
        }
        return flows;
      } catch (error) {
        console.error("Error fetching capital flows:", error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 3e3 : 1e4,
    staleTime: 2e3,
    placeholderData: (previousData) => previousData
  });
}
function useConfluenceZones() {
  const { actor, isFetching } = useActor();
  const { marketData, isLive } = useBinanceData();
  return useQuery({
    queryKey: ["confluenceZones"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const zones = [];
        for (const symbol of WHITELISTED_SYMBOLS) {
          try {
            const zone = await actor.getConfluenceZone(symbol);
            zones.push(zone);
          } catch (_err) {
          }
        }
        if (marketData.length > 0 && zones.length > 0) {
          return zones.map((zone) => {
            const avgVolatility = marketData.reduce(
              (sum, m) => sum + Math.abs(m.priceChangePercent),
              0
            ) / marketData.length;
            return {
              ...zone,
              intensity: roundToTwoDecimals(
                Math.min(1, zone.intensity * (1 + avgVolatility / 100))
              )
            };
          });
        }
        return zones;
      } catch (error) {
        console.error("Error fetching confluence zones:", error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: isLive ? 4e3 : 12e3,
    staleTime: 2500,
    placeholderData: (previousData) => previousData
  });
}
export {
  CircleAlert as C,
  useConfluenceZones as a,
  useCapitalFlows as u
};
