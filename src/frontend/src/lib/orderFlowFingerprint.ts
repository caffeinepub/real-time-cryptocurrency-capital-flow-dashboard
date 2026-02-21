/**
 * Order Flow Data Fingerprinting
 * Generates lightweight fingerprints to detect meaningful changes in polling data
 */

import { OrderFlowData } from '../hooks/useBinanceOrderFlow';

export interface OrderFlowFingerprint {
  tickerLastPrice: string;
  tickerPriceChangePercent: string;
  bookBid: string;
  bookAsk: string;
  latestTradeIds: string; // Concatenated IDs of last 5 trades
}

/**
 * Generate a deterministic fingerprint from order flow data
 * Only includes fields that matter for UI updates
 */
export function generateOrderFlowFingerprint(data: OrderFlowData | null): OrderFlowFingerprint | null {
  if (!data) return null;

  // Ticker fingerprint
  const tickerLastPrice = data.ticker?.lastPrice || '0';
  const tickerPriceChangePercent = data.ticker?.priceChangePercent || '0';

  // Book fingerprint
  const bookBid = data.bookTicker?.bidPrice || '0';
  const bookAsk = data.bookTicker?.askPrice || '0';

  // Trade fingerprint: use IDs of last 5 trades
  const latestTradeIds = data.recentTrades
    .slice(0, 5)
    .map(t => t.id.toString())
    .join(',');

  return {
    tickerLastPrice,
    tickerPriceChangePercent,
    bookBid,
    bookAsk,
    latestTradeIds,
  };
}

/**
 * Compare two fingerprints for equality
 * Returns true if fingerprints are identical (no meaningful change)
 */
export function fingerprintsEqual(
  a: OrderFlowFingerprint | null,
  b: OrderFlowFingerprint | null
): boolean {
  if (!a || !b) return false;

  return (
    a.tickerLastPrice === b.tickerLastPrice &&
    a.tickerPriceChangePercent === b.tickerPriceChangePercent &&
    a.bookBid === b.bookBid &&
    a.bookAsk === b.bookAsk &&
    a.latestTradeIds === b.latestTradeIds
  );
}
