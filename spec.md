# Specification

## Summary
**Goal:** Add a visible "Install App" button to the app header/UI that triggers the PWA installation flow for users who haven't installed the app yet.

**Planned changes:**
- Add an "Install App" / "Add to Home Screen" button in the Header component, visible alongside existing navigation controls
- Button uses existing `pwaUtils.ts` and `PWAInstallPrompt.tsx` logic to handle Android/Desktop (native prompt) and iOS (show instructions) flows
- Button is only shown when the app is not already running in standalone/installed mode
- Style the button consistently with the existing neon dark theme

**User-visible outcome:** Users see a prominent "Install App" button in the header that guides them through installing the app as a PWA, without needing a browser. The button disappears once the app is already installed.
