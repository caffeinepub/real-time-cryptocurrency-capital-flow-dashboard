/**
 * Centralized English UI strings for Order Flow Monitor
 */

export const COPY = {
  // Page title and description
  title: 'Order Flow Monitor',
  subtitle: 'Real-time BTC order analysis',
  
  // Market types
  marketFutures: 'Futures',
  marketSpot: 'Spot',
  
  // States
  loading: 'Loading...',
  authRequired: 'Authentication Required',
  authMessage: 'Log in with Internet Identity to access the Order Flow Monitor.',
  waitingForData: 'Waiting for Data',
  waitingMessage: 'Enable polling to start receiving order flow data.',
  
  // Controls
  market: 'Market',
  pollingActive: 'Polling Active',
  pollingPaused: 'Polling Paused',
  lastUpdated: 'Last updated',
  settings: 'Settings',
  refresh: 'Refresh',
  enablePolling: 'Enable Polling',
  clearAlerts: 'Clear Alerts',
  
  // Sections
  overview: 'Overview',
  flowImbalance: 'Flow & Imbalance',
  confluenceEvents: 'Confluence Events',
  alerts: 'Alerts',
  analysisSettings: 'Analysis Settings',
  
  // Overview metrics
  currentPrice: 'Current Price',
  spread: 'Spread',
  volume24h: '24h Volume',
  
  // Flow metrics
  buyFlow: 'Buy Flow',
  sellFlow: 'Sell Flow',
  netDelta: 'Net Delta',
  imbalance: 'Imbalance',
  largeOrders: 'Large Orders',
  clusterDetected: 'Cluster Detected',
  noCluster: 'No Cluster',
  
  // Confluence
  bookDirection: 'Book Direction',
  spreadTrend: 'Spread Trend',
  noConfluence: 'No confluence events detected',
  
  // Alerts
  noAlerts: 'No alerts',
  alertsCount: (count: number) => `${count} alert${count !== 1 ? 's' : ''}`,
  
  // Settings labels
  largeTradeThreshold: 'Large Trade Threshold (USD)',
  tradeWindow: 'Trade Window',
  timeWindow: 'Time Window (min)',
  minImbalance: 'Min Imbalance (%)',
  minSpreadChange: 'Min Spread Change (%)',
  pollingInterval: 'Polling Interval (ms)',
  
  // Error messages
  errorProcessing: 'An error occurred while processing order flow data.',
  errorCause: 'This may be due to malformed data or API connection issues.',
  tryAgain: 'Try Again',
  reloadPage: 'Reload Page',
  troubleshooting: 'Troubleshooting tips:',
  troubleshootingTips: [
    'Check your internet connection',
    'Try switching between Spot and Futures markets',
    'Clear browser cache and reload the page',
    'If the problem persists, wait a few minutes and try again',
  ],
} as const;
