export interface BubblePosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate 3D positions for bubbles using spherical distribution
 * to prevent overlap and create an organic layout
 */
export function calculateBubblePositions(
  count: number,
  radius = 8,
): BubblePosition[] {
  const positions: BubblePosition[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = Math.PI * 2 * goldenRatio;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = angleIncrement * i;

    // Add some randomness for organic feel
    const randomOffset = 0.3;
    const offsetX = (Math.random() - 0.5) * randomOffset;
    const offsetY = (Math.random() - 0.5) * randomOffset;
    const offsetZ = (Math.random() - 0.5) * randomOffset;

    const x = radius * Math.sin(inclination) * Math.cos(azimuth) + offsetX;
    const y = radius * Math.sin(inclination) * Math.sin(azimuth) + offsetY;
    const z = radius * Math.cos(inclination) + offsetZ;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate animation speed multiplier for a bubble based on its symbol
 * Returns a value between 0.3 and 0.8 for varied, organic movement
 */
export function calculateAnimationSpeed(symbol: string): number {
  const hash = hashString(symbol);
  return 0.3 + (hash % 50) / 100; // 0.3 to 0.8 range
}

/**
 * Calculate oscillation amplitude for a bubble based on its symbol
 * Returns a value between 0.1 and 0.3 for varied floating heights
 */
export function calculateOscillationAmplitude(symbol: string): number {
  const hash = hashString(symbol);
  return 0.1 + ((hash * 7) % 20) / 100; // 0.1 to 0.3 range
}

/**
 * Calculate phase offset for a bubble to prevent synchronized movement
 * Returns a value between 0 and 2π
 */
export function calculatePhaseOffset(symbol: string): number {
  const hash = hashString(symbol);
  return (hash % 628) / 100; // 0 to 6.28 (2π) range
}

/**
 * Simple string hash function for deterministic randomness
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Animation constants for consistent timing
export const ANIMATION_CONSTANTS = {
  FADE_IN_DURATION: 0.8, // seconds
  HOVER_SCALE: 1.2,
  HOVER_TRANSITION_SPEED: 0.15,
  NORMAL_TRANSITION_SPEED: 0.08,
  ROTATION_BASE_SPEED: 0.003,
  PULSE_AMPLITUDE: 0.02,
} as const;
