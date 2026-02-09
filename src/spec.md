# Specification

## Summary
**Goal:** Enable reading and displaying unified Binance Futures open positions across USD-M and COIN-M, with basic automated per-position insights.

**Planned changes:**
- Add backend canister support to call Binance Futures position endpoints `/fapi/v3/positionRisk` (USD-M) and `/dapi/v1/positionRisk` (COIN-M) using stored read-only API credentials, via HTTPS outcalls.
- Expose a single backend API that merges USD-M and COIN-M position data into one normalized open-positions list (including a market-type field and filtering out zero-size positions).
- Add frontend React Query hooks to fetch unified positions with a manual “Refresh” action and safe polling while the Futures Dashboard is visible (disabled when unauthenticated or credentials are missing).
- Replace the placeholder “Open Positions” panel in `frontend/src/components/FuturesDashboard.tsx` with a unified positions table/list showing key fields (symbol, side/amount, entry price, mark price, unrealized PnL, leverage, liquidation price when available, and market type).
- Add deterministic, data-driven per-position tips/insights in English (e.g., high PnL partial profit suggestion, liquidation proximity warning, entry vs mark distance, and mark price movement/volatility hints).

**User-visible outcome:** Users can view a single combined list of their USD-M and COIN-M open futures positions, refresh and monitor them, and see simple per-position management insights in English without any trade execution.
