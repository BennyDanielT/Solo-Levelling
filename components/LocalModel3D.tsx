'use client';

import { useState, useEffect, useRef } from 'react';
import CSS3DCharacter from './CSS3DCharacter';

interface LocalModel3DProps {
  modelPath?: string;
  title?: string;
  scale?: number;
  showFallback?: boolean;
  enableAnimation?: boolean;
}

export default function LocalModel3D({
  modelPath = "/models/characters/warrior.glb",
  title = "3D Character",
  scale = 1,
  showFallback = true,
  enableAnimation = true
}: LocalModel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [threeLoaded, setThreeLoaded] = useState(false);

  useEffect(() => {
    let scene: any;
    let camera: any;
    let renderer: any;
    let model: any;
    let animationFrame: number;

    const loadThreeJS = async () => {
      try {
        console.log('🎯 Loading Three.js modules...');
        
        // Dynamic imports to avoid SSR issues
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        console.log('✅ Three.js modules loaded successfully');
        
        if (!containerRef.current) return;

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 1, 3);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        containerRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 10;
        controls.minDistance = 1;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Blue magic light (Solo Leveling style)
        const blueLight = new THREE.PointLight(0x4080ff, 0.8, 10);
        blueLight.position.set(-2, 2, 2);
        scene.add(blueLight);

        // Golden light
        const goldLight = new THREE.PointLight(0xffd700, 0.6, 8);
        goldLight.position.set(2, 1, -2);
        scene.add(goldLight);

        // Load model
        const loader = new GLTFLoader();
        console.log(`🎭 Loading model: ${modelPath}`);
        
        loader.load(
          modelPath,
          (gltf) => {
            console.log('✅ Model loaded successfully');
            model = gltf.scene;
            model.scale.setScalar(scale);
            
            // Enable shadows
            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(model);
            setIsLoading(false);
            setThreeLoaded(true);

            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.position.y = box.min.y * -1;
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`📥 Loading progress: ${percent.toFixed(1)}%`);
          },
          (error) => {
            console.error('❌ Model loading failed:', error);
            setHasError(true);
            setIsLoading(false);
          }
        );

        // Animation loop
        const animate = () => {
          animationFrame = requestAnimationFrame(animate);
          
          controls.update();
          
          // Rotate model slowly
          if (model && enableAnimation) {
            model.rotation.y += 0.005;
          }

          // Animate lights for magical effect
          const time = Date.now() * 0.001;
          blueLight.intensity = 0.8 + Math.sin(time * 2) * 0.3;
          goldLight.intensity = 0.6 + Math.cos(time * 1.5) * 0.2;

          renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('❌ Three.js loading failed:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Delay loading to ensure component is mounted
    const timer = setTimeout(loadThreeJS, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (renderer && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [modelPath, scale, enableAnimation]);

  // Show fallback if error and fallback enabled
  if (hasError && showFallback) {
    return (
      <div className="w-full h-[60vh] relative">
        <CSS3DCharacter />
        <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500 rounded-lg p-2">
          <p className="text-red-300 text-xs">3D model failed to load</p>
          <p className="text-red-400 text-xs">Using CSS 3D fallback</p>
        </div>
      </div>
    );
  }

  // Show error message if no fallback
  if (hasError && !showFallback) {
    return (
      <div className="w-full h-[60vh] bg-gradient-to-b from-gray-900 via-red-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Model Failed to Load</h2>
          <p className="text-red-300">Check if {modelPath} exists</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[60vh] relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading 3D Character...</h2>
            <p className="text-gray-300">Initializing Three.js scene</p>
          </div>
        </div>
      )}

      {/* Three.js Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
        onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
      />

      {/* Character Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="glass-effect rounded-lg p-4 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            🗡️ {title}
          </h3>
          <p className="text-sm text-gray-300">
            Interactive 3D Character • Drag to rotate
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-400">
            <span>Powered by Three.js</span>
            <span>•</span>
            <span>
              {isLoading ? 'Loading...' : threeLoaded ? 'Model loaded' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 