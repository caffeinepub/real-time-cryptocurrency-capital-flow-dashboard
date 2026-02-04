# Specification

## Summary
**Goal:** Roll back the app to the last stable Binance-only baseline and remove CoinGecko entirely.

**Planned changes:**
- Remove all CoinGecko-related code paths from frontend and backend (services, hooks, utilities, fallbacks), eliminating any runtime calls to CoinGecko endpoints.
- Remove CoinGecko-related configuration (env vars, constants) so builds/runs do not require CoinGecko settings.
- Ensure all dashboards/modules load and display live market data using Binance-only sources (WebSocket with REST fallback) plus existing synthetic fallback behavior where applicable.
- Remove any user-facing UI text that mentions CoinGecko (any updated/introduced text is in English).
- Make the Binance-only rollback the default stable baseline with no optional/hidden switch to re-enable CoinGecko.

**User-visible outcome:** The application runs and builds as Binance-only, with dashboards continuing to show live market data without any CoinGecko dependency or mentions.
