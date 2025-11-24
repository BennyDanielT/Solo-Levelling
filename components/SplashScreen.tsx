'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Crown, Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<
    'loading' | 'model' | 'complete'
  >('loading');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    let scene: any;
    let camera: any;
    let renderer: any;
    let model: any;
    let animationFrame: number;
    let controls: any;

    const loadThreeJS = async () => {
      try {
        console.log('🎯 Loading Three.js for splash screen...');

        // Simulate initial loading progress
        for (let i = 0; i <= 30; i += 5) {
          setLoadingProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Import Three.js modules
        const THREE = await import('three');
        const { GLTFLoader } = await import(
          'three/examples/jsm/loaders/GLTFLoader.js'
        );
        const { OrbitControls } = await import(
          'three/examples/jsm/controls/OrbitControls.js'
        );

        setLoadingProgress(50);
        console.log('✅ Three.js modules loaded');

        if (!containerRef.current) return;

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f); // Dark Solo Leveling background

        // Camera setup
        camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          1000,
        );
        camera.position.set(0, 2, 8);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        containerRef.current.appendChild(renderer.domElement);

        setLoadingProgress(60);

        // Epic Lighting Setup for Solo Leveling atmosphere

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        scene.add(ambientLight);

        // Main blue spotlight (signature Solo Leveling blue)
        const blueSpotlight = new THREE.SpotLight(
          0x4080ff,
          3,
          30,
          Math.PI / 6,
          0.3,
        );
        blueSpotlight.position.set(-5, 10, 5);
        blueSpotlight.target.position.set(0, 0, 0);
        blueSpotlight.castShadow = true;
        blueSpotlight.shadow.mapSize.width = 2048;
        blueSpotlight.shadow.mapSize.height = 2048;
        scene.add(blueSpotlight);
        scene.add(blueSpotlight.target);

        // Purple accent light
        const purpleLight = new THREE.PointLight(0x8040ff, 2, 20);
        purpleLight.position.set(5, 3, -3);
        scene.add(purpleLight);

        // Rim lighting
        const rimLight = new THREE.DirectionalLight(0x80c0ff, 1.5);
        rimLight.position.set(-10, 5, 10);
        scene.add(rimLight);

        // Key light from front
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(0, 5, 10);
        keyLight.castShadow = true;
        scene.add(keyLight);

        setLoadingProgress(70);

        // Load Igris model
        const loader = new GLTFLoader();
        console.log('🗡️ Loading Igris model...');

        loader.load(
          '/models/companions/igris.glb',
          (gltf) => {
            console.log('✅ Igris model loaded successfully');
            model = gltf.scene;
            model.scale.setScalar(1.5); // Make Igris larger and more imposing

            // Enable shadows and enhance materials
            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Enhance materials for epic look
                if (child.material) {
                  child.material.metalness = 0.3;
                  child.material.roughness = 0.7;
                  child.material.envMapIntensity = 1.5;
                }
              }
            });

            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.position.y = box.min.y * -1 - 1;

            scene.add(model);
            setLoadingProgress(90);
            setModelLoaded(true);
            setCurrentPhase('model');

            // Show continue button after a dramatic pause
            setTimeout(() => {
              setLoadingProgress(100);
              setTimeout(() => setShowContinue(true), 1000);
            }, 1500);
          },
          (progress) => {
            const percent = Math.min(
              90,
              70 + (progress.loaded / progress.total) * 20,
            );
            setLoadingProgress(percent);
            console.log(`📥 Loading progress: ${percent.toFixed(1)}%`);
          },
          (error) => {
            console.error('❌ Failed to load Igris model:', error);
            setLoadingProgress(100);
            setShowContinue(true); // Show continue anyway
          },
        );

        // Animation loop
        const animate = () => {
          animationFrame = requestAnimationFrame(animate);

          // Rotate Igris slowly for dramatic effect
          if (model) {
            model.rotation.y += 0.005;

            // Subtle floating animation
            const time = Date.now() * 0.001;
            model.position.y += Math.sin(time * 0.5) * 0.002;
          }

          // Animate lights for magical effect
          const time = Date.now() * 0.002;
          if (blueSpotlight) {
            blueSpotlight.intensity = 2.5 + Math.sin(time) * 0.5;
          }
          if (purpleLight) {
            purpleLight.intensity = 1.5 + Math.cos(time * 1.3) * 0.3;
          }

          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (!renderer || !camera) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('❌ Three.js initialization failed:', error);
        setLoadingProgress(100);
        setShowContinue(true); // Show continue anyway
      }
    };

    loadThreeJS();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (renderer && containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Element might already be removed
        }
        renderer.dispose();
      }
    };
  }, []);

  const handleContinue = () => {
    setCurrentPhase('complete');
    setTimeout(onComplete, 800);
  };

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Three.js container */}
      <div ref={containerRef} className='absolute inset-0' />

      {/* Overlay UI */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* Top gradient overlay */}
        <div className='absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none' />

        {/* Bottom gradient overlay */}
        <div className='absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none' />

        {/* Main content */}
        <div className='relative h-full flex flex-col'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className='flex-none pt-12 text-center'
          >
            <div className='flex items-center justify-center space-x-3 mb-4'>
              <Crown className='w-8 h-8 text-yellow-400' />
              <h1 className='text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent'>
                SOLO LEVELING
              </h1>
              <Sword className='w-8 h-8 text-blue-400' />
            </div>
            <p className='text-xl text-gray-300'>Shadow Monarch's Dashboard</p>
          </motion.div>

          {/* Center space for 3D model */}
          <div className='flex-1' />

          {/* Bottom UI */}
          <div className='flex-none pb-16'>
            <AnimatePresence mode='wait'>
              {currentPhase === 'loading' && (
                <motion.div
                  key='loading'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='text-center space-y-6'
                >
                  {/* Loading bar */}
                  <div className='max-w-md mx-auto'>
                    <div className='bg-gray-800/50 rounded-full h-3 mb-4 overflow-hidden'>
                      <motion.div
                        className='h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'
                        style={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className='text-blue-300 text-lg'>
                      {loadingProgress < 50
                        ? 'Initializing...'
                        : loadingProgress < 70
                        ? 'Loading Three.js...'
                        : loadingProgress < 90
                        ? 'Summoning Igris...'
                        : 'Preparing for battle...'}
                    </p>
                    <p className='text-gray-400 text-sm mt-2'>
                      {loadingProgress.toFixed(0)}%
                    </p>
                  </div>
                </motion.div>
              )}

              {currentPhase === 'model' && (
                <motion.div
                  key='model'
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className='text-center space-y-6'
                >
                  <div className='flex items-center justify-center space-x-2 mb-4'>
                    <Zap className='w-6 h-6 text-yellow-400 animate-pulse' />
                    <p className='text-2xl text-white font-semibold'>
                      Shadow Knight Igris
                    </p>
                    <Zap className='w-6 h-6 text-yellow-400 animate-pulse' />
                  </div>

                  {showContinue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      className='pointer-events-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25'
                    >
                      Enter the Shadow Realm
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Particle effects overlay */}
      <div className='absolute inset-0 pointer-events-none'>
        {modelLoaded &&
          Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-1 h-1 bg-blue-400 rounded-full'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
      </div>
    </div>
  );
}
