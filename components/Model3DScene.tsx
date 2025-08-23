'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  Environment,
  Float,
  PresentationControls,
} from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

// Model component that loads GLTF files
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      // Gentle rotation
      modelRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive
        ref={modelRef}
        object={scene}
        scale={1.5}
        position={[0, -1, 0]}
      />
    </Float>
  );
}

// Fallback cube when no model is loaded
function FallbackCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color='#ffd700' metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  );
}

interface Model3DSceneProps {
  modelUrl?: string;
  showControls?: boolean;
}

export default function Model3DScene({
  modelUrl,
  showControls = true,
}: Model3DSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 75 }}
      style={{ background: 'linear-gradient(to bottom, #0f0f23, #1a1a2e)' }}
    >
      <Suspense fallback={<FallbackCube />}>
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color='#ffd700' />
        <spotLight
          position={[0, 10, 0]}
          intensity={0.5}
          angle={0.3}
          penumbra={1}
          color='#ffffff'
        />

        {/* Environment */}
        <Environment preset='night' />

        {/* 3D Model */}
        {modelUrl ? <Model url={modelUrl} /> : <FallbackCube />}

        {/* Controls */}
        {showControls && (
          <PresentationControls
            global
            rotation={[0, -Math.PI / 4, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />
          </PresentationControls>
        )}
      </Suspense>
    </Canvas>
  );
}
