'use client';

import { useEffect, useState } from 'react';

export default function Hero3DClient() {
  const [ThreeComponent, setThreeComponent] =
    useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadThreeComponent = async () => {
      try {
        // Only import when we're definitely on the client
        if (typeof window !== 'undefined') {
          const { Canvas, useFrame } = await import('@react-three/fiber');
          const { OrbitControls, Text, Float, Environment } = await import(
            '@react-three/drei'
          );
          const { Suspense, useRef } = await import('react');
          const THREE = await import('three');

          // Create the component after all imports are loaded
          const ThreeScene = () => {
            // Animated cube component
            const AnimatedCube = () => {
              const meshRef = useRef<any>(null);

              useFrame((state: any) => {
                if (meshRef.current) {
                  meshRef.current.rotation.x =
                    Math.sin(state.clock.elapsedTime) * 0.3;
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
            };

            // Floating crystal component
            const FloatingCrystal = () => {
              const crystalRef = useRef<any>(null);

              useFrame((state: any) => {
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
            };

            // Orbiting rings
            const OrbitingRings = () => {
              const ringsRef = useRef<any>(null);

              useFrame((state: any) => {
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
            };

            // Particle system
            const Particles = () => {
              const particlesRef = useRef<any>(null);
              const count = 1000;

              const positions = new Float32Array(count * 3);
              const colors = new Float32Array(count * 3);

              for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 20;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

                colors[i * 3] = Math.random() * 0.5 + 0.5;
                colors[i * 3 + 1] = Math.random() * 0.3 + 0.7;
                colors[i * 3 + 2] = Math.random() * 0.1;
              }

              useFrame((state: any) => {
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
                  <pointsMaterial
                    size={0.05}
                    vertexColors
                    transparent
                    opacity={0.8}
                  />
                </points>
              );
            };

            return (
              <>
                <Canvas
                  camera={{ position: [0, 0, 8], fov: 75 }}
                  style={{
                    background: 'linear-gradient(to bottom, #0f0f23, #1a1a2e)',
                  }}
                >
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <pointLight
                      position={[-10, -10, -5]}
                      intensity={0.5}
                      color='#ffd700'
                    />

                    <Environment preset='night' />

                    <AnimatedCube />
                    <FloatingCrystal />
                    <OrbitingRings />
                    <Particles />

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
          };

          if (isMounted) {
            setThreeComponent(() => ThreeScene);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading Three.js:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a small delay to ensure the page is fully mounted
    const timer = setTimeout(loadThreeComponent, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (isLoading || !ThreeComponent) {
    return (
      <div className='w-full h-[60vh] relative bg-gradient-to-b from-dark-900 to-dark-700 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-6xl font-bold text-white mb-4 drop-shadow-2xl'>
            Solo Leveling
          </h1>
          <p className='text-xl text-gray-300 drop-shadow-lg'>
            Level up your life, one goal at a time
          </p>
          <div className='mt-4'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-[60vh] relative'>
      <ThreeComponent />
    </div>
  );
}
