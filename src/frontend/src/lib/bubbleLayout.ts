export interface BubblePosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate 3D positions for bubbles using spherical distribution
 * to prevent overlap and create an organic layout
 */
export function calculateBubblePositions(count: number, radius: number = 8): BubblePosition[] {
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
