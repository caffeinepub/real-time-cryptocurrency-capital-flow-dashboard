import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { EnrichedBubbleAsset } from '../hooks/useBubbleAssets';
import { mapConvergenceToSize, mapTrendToColor } from '../lib/bubbleVisualMapping';

interface FloatingBubbleProps {
  asset: EnrichedBubbleAsset;
  position: [number, number, number];
  onClick: (asset: EnrichedBubbleAsset) => void;
}

export default function FloatingBubble({ asset, position, onClick }: FloatingBubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate size and color based on convergence data
  const size = mapConvergenceToSize(
    asset.flowIntensity,
    asset.confluenceIntensity,
    asset.confidenceLevel
  );
  const color = mapTrendToColor(asset.trend);
  
  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const floatOffset = Math.sin(time * 0.5 + position[0]) * 0.2;
      meshRef.current.position.y = position[1] + floatOffset;
      
      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      
      // Scale on hover
      const targetScale = hovered ? size * 1.2 : size;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
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
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Symbol label */}
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {asset.symbol.replace('USDT', '')}
      </Text>
    </group>
  );
}
