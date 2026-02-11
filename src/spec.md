# Specification

## Summary
**Goal:** Stop the “Order Flow Monitor” tab from going black by hardening the frontend against malformed API/localStorage data, and align frontend/backend Binance API usage so public data never requires keys and private futures positions are fetched consistently.

**Planned changes:**
- Add defensive parsing/guards in OrderFlowMonitor for missing/empty/unexpected Binance REST response shapes and for malformed localStorage JSON (orderFlowThresholds/confluenceThresholds/alertThresholds), with safe defaults.
- Add a user-visible in-panel empty/error state for OrderFlowMonitor (instead of a crash/black screen), including a retry/refetch action.
- Audit and align Binance API usage between frontend and backend: ensure frontend uses only public endpoints for order-flow data and does not read/send stored Binance credentials for those calls.
- Standardize backend private Binance domain/endpoint strategy and centralize/document where API keys are applied (required headers/signing and which endpoints need them).
- Replace backend placeholder/hardcoded example futures positions with real open futures positions fetching/parsing using stored apiKey/apiSecret (including signing as required), returning a normalized positions shape compatible with the frontend hook.

**User-visible outcome:** The Order Flow Monitor remains usable even when Binance returns empty/unexpected data or local settings are corrupted, showing a clear error/empty state with retry, and futures positions reflect real Binance data (or explicit errors) instead of fake placeholders.
