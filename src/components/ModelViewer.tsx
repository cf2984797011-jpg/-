import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Center } from '@react-three/drei';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function ModelViewer({ url }: ModelProps) {
  return (
    <div className="w-full h-full bg-surface-container-low rounded-xl overflow-hidden">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Center>
              <Model url={url} />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate />
      </Canvas>
    </div>
  );
}
