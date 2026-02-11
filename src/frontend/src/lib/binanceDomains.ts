/**
 * Binance Domain Configuration
 * Centralized base URLs for public market data endpoints
 * 
 * IMPORTANT: These endpoints are for PUBLIC market data only (no API keys required)
 * Private account operations (positions, orders) are handled by the backend canister
 */

/**
 * Binance Spot REST API base URL
 * Used for: 24h ticker, recent trades, book ticker (public data)
 */
export const BINANCE_SPOT_REST_BASE = 'https://api.binance.com';

/**
 * Binance Futures REST API base URL
 * Used for: 24h ticker, recent trades, book ticker (public data)
 */
export const BINANCE_FUTURES_REST_BASE = 'https://fapi.binance.com';

/**
 * Binance Futures WebSocket base URL
 * Used for: Real-time market data streams (public data)
 */
export const BINANCE_FUTURES_WS_BASE = 'wss://fstream.binance.com';

/**
 * Note: All frontend API calls to these endpoints are public and do NOT require
 * API keys or signatures. User credentials are only used by the backend canister
 * for private account operations (fetching positions, placing orders, etc.)
 */
