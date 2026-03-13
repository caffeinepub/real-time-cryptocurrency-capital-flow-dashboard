import { u as useQuery } from "./useQuery-rPhoS-Gq.js";
import { D as useInternetIdentity, v as useQueryClient, r as reactExports, M as createActorWithConfig } from "./index-Cp4Kx-hg.js";
function formatNumber(value, decimals = 2) {
  const maxDecimals = Math.min(decimals, 2);
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: maxDecimals,
    maximumFractionDigits: maxDecimals
  });
}
function formatCurrency(value) {
  return `$${formatNumber(value, 2)}`;
}
function formatPercentage(value, includeSymbol = true) {
  const percentage = value * 100;
  const formatted = formatNumber(percentage, 2);
  return includeSymbol ? `${formatted}%` : formatted;
}
function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}
const WHITELISTED_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "ICPUSDT",
  "ADAUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "MATICUSDT",
  "DOTUSDT"
];
function symbolsMatch(symbol1, symbol2) {
  const normalize = (s) => {
    const upper = s.toUpperCase();
    if (upper.endsWith("USDT")) return upper;
    return `${upper}USDT`;
  };
  return normalize(symbol1) === normalize(symbol2);
}
function storeSessionParameter(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store session parameter ${key}:`, error);
  }
}
function getSessionParameter(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to retrieve session parameter ${key}:`, error);
    return null;
  }
}
function clearParamFromHash(paramName) {
  if (!window.history.replaceState) {
    return;
  }
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return;
  }
  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf("?");
  if (queryStartIndex === -1) {
    return;
  }
  const routePath = hashContent.substring(0, queryStartIndex);
  const queryString = hashContent.substring(queryStartIndex + 1);
  const params = new URLSearchParams(queryString);
  params.delete(paramName);
  const newQueryString = params.toString();
  let newHash = routePath;
  if (newQueryString) {
    newHash += `?${newQueryString}`;
  }
  const newUrl = window.location.pathname + window.location.search + (newHash ? `#${newHash}` : "");
  window.history.replaceState(null, "", newUrl);
}
function getSecretFromHash(paramName) {
  const existingSecret = getSessionParameter(paramName);
  if (existingSecret !== null) {
    return existingSecret;
  }
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) {
    return null;
  }
  const hashContent = hash.substring(1);
  const params = new URLSearchParams(hashContent);
  const secret = params.get(paramName);
  if (secret) {
    storeSessionParameter(paramName, secret);
    clearParamFromHash(paramName);
    return secret;
  }
  return null;
}
function getSecretParameter(paramName) {
  return getSecretFromHash(paramName);
}
const ACTOR_QUERY_KEY = "actor";
function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig();
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
export {
  WHITELISTED_SYMBOLS as W,
  formatNumber as a,
  formatPercentage as b,
  formatCurrency as f,
  roundToTwoDecimals as r,
  symbolsMatch as s,
  useActor as u
};
