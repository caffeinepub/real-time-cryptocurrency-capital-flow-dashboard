import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { EnrichedBubbleAsset } from '../hooks/useBubbleAssets';
import { mapConvergenceToSize, mapTrendToColor, calculateGlowIntensity, getEmissiveColor } from '../lib/bubbleVisualMapping';
import { calculateAnimationSpeed, calculateOscillationAmplitude, calculatePhaseOffset } from '../lib/bubbleLayout';

interface FloatingBubbleProps {
  asset: EnrichedBubbleAsset;
  position: [number, number, number];
  onClick: (asset: EnrichedBubbleAsset) => void;
}

export default function FloatingBubble({ asset, position, onClick }: FloatingBubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [opacity, setOpacity] = useState(0);
  
  // Calculate size and color based on convergence data
  const size = mapConvergenceToSize(
    asset.flowIntensity,
    asset.confluenceIntensity,
    asset.confidenceLevel
  );
  const color = mapTrendToColor(asset.trend);
  const emissiveColor = getEmissiveColor(asset.trend);
  
  // Calculate per-bubble animation parameters (deterministic based on symbol)
  const animationParams = useMemo(() => ({
    speed: calculateAnimationSpeed(asset.symbol),
    amplitude: calculateOscillationAmplitude(asset.symbol),
    phaseOffset: calculatePhaseOffset(asset.symbol),
  }), [asset.symbol]);
  
  // Calculate glow intensity for high-convergence assets
  const convergenceIntensity = asset.flowIntensity + asset.confluenceIntensity + asset.confidenceLevel;
  const glowIntensity = calculateGlowIntensity(convergenceIntensity);
  const isHighConvergence = convergenceIntensity > 210; // 70% of max (300)
  
  // Fade-in animation on mount
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Fade in
      if (opacity < 1) {
        setOpacity(Math.min(1, opacity + delta * 1.25)); // 0.8s fade-in
      }
      
      const time = state.clock.getElapsedTime();
      
      // Organic floating motion with varied speeds and oscillation
      const floatY = Math.sin(time * animationParams.speed + animationParams.phaseOffset) * animationParams.amplitude;
      const floatX = Math.cos(time * animationParams.speed * 0.7 + animationParams.phaseOffset * 1.3) * (animationParams.amplitude * 0.5);
      const floatZ = Math.sin(time * animationParams.speed * 0.5 + animationParams.phaseOffset * 0.8) * (animationParams.amplitude * 0.3);
      
      // Smooth easing for position transitions
      const targetY = position[1] + floatY;
      const targetX = position[0] + floatX;
      const targetZ = position[2] + floatZ;
      
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.05;
      
      // Gentle rotation with varied speeds
      meshRef.current.rotation.y += 0.003 * animationParams.speed;
      meshRef.current.rotation.x += 0.001 * animationParams.speed;
      
      // Subtle scale pulsing synchronized with floating
      const pulseScale = 1 + Math.sin(time * animationParams.speed * 2 + animationParams.phaseOffset) * 0.02;
      
      // Smooth scale transition on hover with spring-like animation
      const targetScale = hovered ? size * 1.2 * pulseScale : size * pulseScale;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        hovered ? 0.15 : 0.08
      );
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(asset)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={
            hovered 
              ? glowIntensity * 1.5 
              : isHighConvergence 
                ? glowIntensity 
                : 0.3
          }
          metalness={0.4}
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          transparent
          opacity={opacity * 0.92}
        />
      </mesh>
      
      {/* Symbol label with fade-in */}
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        fillOpacity={opacity}
      >
        {asset.symbol.replace('USDT', '')}
      </Text>
      
      {/* Glow effect for high-convergence bubbles */}
      {isHighConvergence && (
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={emissiveColor}
            transparent
            opacity={opacity * (hovered ? 0.25 : 0.15)}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}
