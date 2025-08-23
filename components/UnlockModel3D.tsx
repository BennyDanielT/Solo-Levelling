'use client';

import { useState, useEffect } from 'react';

interface UnlockImageProps {
  modelPath?: string; // Now used as imagePath
  type: 'companion' | 'item';
  scale?: number;
  autoRotate?: boolean;
}

export default function UnlockImage({
  modelPath, // We'll use this as imagePath for consistency
  type,
  scale = 1.0,
  autoRotate = true,
}: UnlockImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Convert model path to image path
  const imagePath =
    modelPath?.replace('.glb', '.png').replace('/models/', '/images/') ||
    (type === 'companion'
      ? '/images/companions/default.png'
      : '/images/items/default.png');

  useEffect(() => {
    // Simulate loading time for dramatic effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='w-[200px] h-[200px] flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 relative overflow-hidden'>
        {/* Magical loading effect */}
        <div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse'
          style={{
            animation: 'shimmer 2s ease-in-out infinite',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)',
          }}
        />

        <div className='text-center z-10'>
          <div className='w-8 h-8 mx-auto mb-2 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-white text-xs'>Materializing...</p>
        </div>
      </div>
    );
  }

  // Error fallback with Solo Leveling style placeholder
  if (hasError) {
    return (
      <div className='w-[200px] h-[200px] relative overflow-hidden rounded-xl border border-gold-500/30'>
        {/* Magical glow effect */}
        <div
          className={`absolute inset-0 rounded-xl blur-lg opacity-50 ${
            type === 'companion'
              ? 'bg-gradient-to-br from-blue-400/30 to-cyan-400/30'
              : 'bg-gradient-to-br from-purple-400/30 to-pink-400/30'
          }`}
        />

        {/* Solo Leveling style placeholder */}
        <div
          className='w-full h-full bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative'
          style={{ perspective: '400px' }}
        >
          {type === 'companion' ? (
            // Companion placeholder
            <div
              className='relative'
              style={{
                transform: 'rotateX(10deg) rotateY(15deg)',
                transformStyle: 'preserve-3d',
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              <div
                className='w-12 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg relative shadow-xl'
                style={{ transform: 'translateZ(10px)' }}
              >
                <div className='w-8 h-8 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full mx-auto mb-1' />
                <div
                  className='w-3 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded absolute -right-2 top-4'
                  style={{ transform: 'rotateZ(25deg)' }}
                />
              </div>
            </div>
          ) : (
            // Item placeholder
            <div
              className='relative'
              style={{
                transform: 'rotateX(10deg) rotateY(15deg)',
                transformStyle: 'preserve-3d',
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              <div
                className='w-8 h-12 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full relative shadow-xl'
                style={{ transform: 'translateZ(10px)' }}
              >
                <div className='w-6 h-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-full mx-auto' />
                <div className='absolute inset-2 bg-gradient-to-b from-purple-200/50 to-purple-400/50 rounded-full animate-pulse' />
              </div>
            </div>
          )}

          {/* Error indicator */}
          <div className='absolute bottom-2 left-2 text-xs text-red-400'>
            📷 Image Error
          </div>
        </div>
      </div>
    );
  }

  // Main image display with Solo Leveling magical effects
  return (
    <div className='w-[200px] h-[200px] relative overflow-hidden rounded-xl group'>
      {/* Dynamic magical background based on type */}
      <div
        className={`absolute inset-0 rounded-xl blur-lg opacity-60 transition-opacity duration-1000 ${
          type === 'companion'
            ? 'bg-gradient-radial from-blue-400/40 via-cyan-400/20 to-transparent'
            : 'bg-gradient-radial from-purple-400/40 via-pink-400/20 to-transparent'
        }`}
        style={{
          animation: 'pulse-glow 2.5s ease-in-out infinite',
        }}
      />

      {/* Rotating magical circle behind image */}
      <div
        className='absolute inset-4 border border-yellow-400/30 rounded-full'
        style={{
          animation: autoRotate ? 'rotate 8s linear infinite' : 'none',
          background:
            'radial-gradient(circle, transparent 70%, rgba(255, 215, 0, 0.1) 100%)',
        }}
      />

      {/* Inner magical circle */}
      <div
        className='absolute inset-8 border border-yellow-400/20 rounded-full'
        style={{
          animation: autoRotate ? 'rotate 12s linear infinite reverse' : 'none',
        }}
      />

      {/* Main image container */}
      <div className='absolute inset-2 flex items-center justify-center'>
        <img
          src={imagePath}
          alt={type === 'companion' ? 'Shadow Companion' : 'Magical Item'}
          className={`max-w-full max-h-full object-contain transition-all duration-1000 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          } ${autoRotate ? 'hover:scale-110' : ''}`}
          style={{
            filter: `
              drop-shadow(0 0 20px ${
                type === 'companion' ? '#60a5fa' : '#a855f7'
              }) 
              brightness(1.1) 
              contrast(1.1)
            `,
            animation: imageLoaded
              ? 'image-entrance 1s ease-out, magical-hover 3s ease-in-out infinite'
              : 'none',
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      {/* Floating magical particles */}
      {imageLoaded &&
        Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              type === 'companion' ? 'bg-blue-400' : 'bg-purple-400'
            }`}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animation: `
              float-particle ${2 + Math.random() * 3}s ease-in-out infinite,
              fade-in-out ${3 + Math.random() * 2}s ease-in-out infinite
            `,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.7,
            }}
          />
        ))}

      {/* Power level indicator */}
      <div
        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
          type === 'companion'
            ? 'bg-blue-500/80 text-white shadow-lg shadow-blue-500/50'
            : 'bg-purple-500/80 text-white shadow-lg shadow-purple-500/50'
        } transition-all duration-300 group-hover:scale-110`}
      >
        <span className='text-xs font-bold'>
          {type === 'companion' ? '👥' : '⚔️'}
        </span>
      </div>

      {/* Rank indicator */}
      <div className='absolute bottom-2 left-2 px-2 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded backdrop-blur-sm'>
        S-RANK
      </div>

      {/* Hover effect overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
    </div>
  );
}
