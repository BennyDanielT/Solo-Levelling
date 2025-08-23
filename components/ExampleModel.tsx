'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  Environment,
  Float,
  PresentationControls,
} from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Example model component - replace with your actual model
function ExampleModel() {
  // This is a placeholder - replace with actual model loading
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Sword-like shape using basic geometries */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial
            color='#silver'
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.8, 0.1, 0.3]} />
          <meshStandardMaterial color='#gold' metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.5, 8]} />
          <meshStandardMaterial
            color='#brown'
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      </group>
    </Float>
  );
}

// How to use with actual GLTF models:
/*
function ActualModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
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
*/

export default function ExampleModelComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className='w-full h-[50vh] relative bg-gradient-to-b from-dark-900 to-dark-700 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-2 drop-shadow-2xl'>
            Loading 3D Example...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-[50vh] relative'>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight
            position={[-10, -10, -5]}
            intensity={0.8}
            color='#ffd700'
          />

          {/* Environment */}
          <Environment preset='night' />

          {/* 3D Model */}
          <ExampleModel />

          {/* Controls */}
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
            />
          </PresentationControls>
        </Suspense>
      </Canvas>

      {/* Overlay text */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-2 drop-shadow-2xl'>
            Example 3D Model
          </h2>
          <p className='text-sm text-gray-300 drop-shadow-lg'>
            Replace with your downloaded models
          </p>
        </div>
      </div>
    </div>
  );
}
