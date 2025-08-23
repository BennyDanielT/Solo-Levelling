'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

// Enhanced animated cube with better materials
function AnimatedCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z =
        Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color='#ffd700'
          metalness={0.9}
          roughness={0.1}
          emissive='#ffd700'
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Floating crystal component
function FloatingCrystal() {
  const crystalRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.02;
      crystalRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={crystalRef} position={[3, 0, 0]}>
        <mesh>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color='#00ffff'
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.8}
            emissive='#00ffff'
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Orbiting rings
function OrbitingRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.005;
      ringsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={ringsRef} position={[-3, 0, 0]}>
      <mesh>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color='#ff6b6b'
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color='#4ecdc4'
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Floating text component
function FloatingText() {
  const textRef = useRef<any>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        ref={textRef}
        position={[0, 3, 0]}
        fontSize={1}
        color='#ffffff'
        anchorX='center'
        anchorY='middle'
      >
        SOLO LEVELING
      </Text>
    </Float>
  );
}

// Particle system for background effect
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    colors[i * 3] = Math.random() * 0.5 + 0.5; // Gold to white
    colors[i * 3 + 1] = Math.random() * 0.3 + 0.7;
    colors[i * 3 + 2] = Math.random() * 0.1;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-color'
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} />
    </points>
  );
}

export default function ThreeScene() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #0f0f23, #1a1a2e)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight
            position={[-10, -10, -5]}
            intensity={0.5}
            color='#ffd700'
          />

          {/* Environment */}
          <Environment preset='night' />

          {/* 3D Elements */}
          <AnimatedCube />
          <FloatingCrystal />
          <OrbitingRings />
          <FloatingText />
          <Particles />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Overlay text */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <div className='text-center'>
          <h1 className='text-6xl font-bold text-white mb-4 drop-shadow-2xl'>
            Solo Leveling
          </h1>
          <p className='text-xl text-gray-300 drop-shadow-lg'>
            Level up your life, one goal at a time
          </p>
        </div>
      </div>
    </>
  );
}
