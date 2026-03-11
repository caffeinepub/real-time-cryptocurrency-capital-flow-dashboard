import { roundToTwoDecimals } from "./formatters";

/**
 * Map convergence strength to bubble size
 * Higher convergence = larger bubble
 * Handles both backend convergence data and synthetic market data
 */
export function mapConvergenceToSize(
  flowIntensity: number,
  confluenceIntensity: number,
  confidenceLevel: number,
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
 * Map trend to color with enhanced vibrancy
 * Bullish = vibrant green, Bearish = vibrant red, Neutral = vibrant yellow
 */
export function mapTrendToColor(trend: string): string {
  switch (trend.toLowerCase()) {
    case "bullish":
    case "alta":
      return "hsl(142, 85%, 55%)"; // Vibrant neon green
    case "bearish":
    case "baixa":
      return "hsl(0, 85%, 60%)"; // Vibrant neon red
    default:
      return "hsl(48, 90%, 58%)"; // Vibrant neon yellow
  }
}

/**
 * Get emissive color variant for glow effects
 */
export function getEmissiveColor(trend: string): string {
  switch (trend.toLowerCase()) {
    case "bullish":
    case "alta":
      return "hsl(142, 100%, 65%)"; // Brighter green for glow
    case "bearish":
    case "baixa":
      return "hsl(0, 100%, 70%)"; // Brighter red for glow
    default:
      return "hsl(48, 100%, 68%)"; // Brighter yellow for glow
  }
}

/**
 * Calculate glow intensity based on convergence metrics
 * Returns a value between 0 and 2 for emissive intensity
 */
export function calculateGlowIntensity(convergenceIntensity: number): number {
  // convergenceIntensity is 0-300 range
  // Map to 0.3-2.0 range for emissive intensity
  const normalized = Math.min(1, convergenceIntensity / 300);
  return 0.3 + normalized * 1.7;
}

/**
 * Adjust color for hover state
 */
export function getHoverColor(baseColor: string, factor = 1.2): string {
  // Parse HSL color
  const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return baseColor;

  const [, h, s, l] = match;
  const newL = Math.min(100, Number.parseInt(l) * factor);

  return `hsl(${h}, ${s}%, ${newL}%)`;
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(
  color1: string,
  color2: string,
  factor: number,
): string {
  const c1 = Number.parseInt(color1.slice(1), 16);
  const c2 = Number.parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Enhanced color definitions for consistency
export const TREND_COLORS = {
  bullish: "hsl(142, 85%, 55%)",
  bearish: "hsl(0, 85%, 60%)",
  neutral: "hsl(48, 90%, 58%)",
} as const;

export const EMISSIVE_COLORS = {
  bullish: "hsl(142, 100%, 65%)",
  bearish: "hsl(0, 100%, 70%)",
  neutral: "hsl(48, 100%, 68%)",
} as const;
