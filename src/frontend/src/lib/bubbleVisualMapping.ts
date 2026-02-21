import { roundToTwoDecimals } from './formatters';

/**
 * Map convergence strength to bubble size
 * Higher convergence = larger bubble
 * Handles both backend convergence data and synthetic market data
 */
export function mapConvergenceToSize(
  flowIntensity: number,
  confluenceIntensity: number,
  confidenceLevel: number
): number {
  // Combine all intensity metrics (0-100 range each)
  const totalIntensity = flowIntensity + confluenceIntensity + confidenceLevel;
  
  // Normalize to 0-1 range (max possible is 300)
  const normalized = Math.min(1, totalIntensity / 300);
  
  // Map to size range 0.5 to 2.5
  // Ensure minimum visible size even for low convergence
  const size = Math.max(0.5, 0.5 + normalized * 2.0);
  
  return roundToTwoDecimals(size);
}

/**
 * Map trend to color
 * Bullish = green, Bearish = red, Neutral = yellow
 */
export function mapTrendToColor(trend: string): string {
  switch (trend.toLowerCase()) {
    case 'bullish':
    case 'alta':
      return '#00ff88'; // Neon green
    case 'bearish':
    case 'baixa':
      return '#ff0044'; // Neon red
    case 'neutral':
    default:
      return '#ffaa00'; // Neon yellow
  }
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
