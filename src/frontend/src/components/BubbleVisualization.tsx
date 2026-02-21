import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import FloatingBubble from './FloatingBubble';
import BubbleDetailPanel from './BubbleDetailPanel';
import { useBubbleAssets, type EnrichedBubbleAsset } from '../hooks/useBubbleAssets';
import { calculateBubblePositions } from '../lib/bubbleLayout';
import { Loader2 } from 'lucide-react';

export default function BubbleVisualization() {
  const { data, isLoading } = useBubbleAssets();
  const bubbleAssets = data?.assets || [];
  const [selectedAsset, setSelectedAsset] = useState<EnrichedBubbleAsset | null>(null);

  // Calculate positions for all bubbles
  const positions = calculateBubblePositions(bubbleAssets.length);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card/30 rounded-lg border border-border/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
          <p className="text-muted-foreground">Carregando ativos de alta convergência...</p>
        </div>
      </div>
    );
  }

  if (bubbleAssets.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-card/30 rounded-lg border border-border/50">
        <div className="text-center max-w-md px-4">
          <p className="text-lg text-muted-foreground mb-2">Nenhum ativo disponível no momento</p>
          <p className="text-sm text-muted-foreground">
            Aguardando dados de mercado com movimentação significativa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <Canvas className="bg-background/50 rounded-lg border border-border/50">
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={30}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        <pointLight position={[0, 10, 0]} intensity={0.7} color="#ffff00" />
        
        {/* Bubbles */}
        <Suspense fallback={null}>
          {bubbleAssets.map((asset, index) => (
            <FloatingBubble
              key={asset.symbol}
              asset={asset}
              position={[positions[index].x, positions[index].y, positions[index].z]}
              onClick={setSelectedAsset}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Detail Panel */}
      {selectedAsset && (
        <BubbleDetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
