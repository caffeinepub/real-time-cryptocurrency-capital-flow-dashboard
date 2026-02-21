# Specification

## Summary
**Goal:** Fix the confluence filtering logic so that assets with convergence data are properly displayed in the 3D bubble visualization instead of showing an empty state message.

**Planned changes:**
- Investigate and fix the confluence filtering logic in useBubbleAssets hook to ensure assets pass through the filter correctly
- Review and adjust convergence calculation logic to properly evaluate assets based on Binance market data (price changes, volume, market metrics)
- Ensure BubbleVisualization component properly distinguishes between genuine empty data states and filtering logic issues
- Adjust confluence filtering threshold if needed to show available assets

**User-visible outcome:** Users will see crypto assets displayed as bubbles in the 3D visualization based on their convergence scores, instead of seeing a "no assets found" message when valid market data exists.
