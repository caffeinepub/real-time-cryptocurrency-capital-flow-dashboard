# Specification

## Summary
**Goal:** Fix PWA standalone installation on mobile browsers and build a mobile-first responsive cryptocurrency market analysis dashboard with real-time Binance data and a dark neon theme.

**Planned changes:**
- Fix the web app manifest to declare `display: standalone`, correct `start_url`, `scope`, and all required icon sizes (192x192, 512x512, maskable variants)
- Ensure the service worker is registered correctly on first load with no console errors
- On Android Chrome, trigger the native `beforeinstallprompt` install banner via a PWA install button
- On iOS Safari, show a guided install modal with Share → Add to Home Screen steps
- Build a mobile-first responsive layout with bottom tab navigation on screens under 768px and sidebar/multi-column layout on screens over 1024px
- Add a live price ticker list showing top cryptocurrencies with 24h price change percentages
- Add individual asset detail cards with price, volume, and sparkline/trend charts
- Add a capital flow section showing assets gaining vs. losing momentum
- Add a confluence zones panel highlighting key technical levels
- Wire the existing `useBinanceData` hook and `binanceService` to the main dashboard for live real-time updates via Binance public WebSocket
- Add graceful fallback to REST polling if the WebSocket connection drops
- Show a live/offline connection status indicator in the header
- Apply a dark-mode-only theme with near-black backgrounds, neon green/red price indicators, and monospace font for price values across all tabs and surfaces

**User-visible outcome:** Users can install the app to their home screen on Android and iOS and launch it in standalone mode (no browser UI). Once open, they see a mobile-optimized crypto dashboard with live prices, trend charts, capital flow, and confluence zones, all in a dark neon theme.
