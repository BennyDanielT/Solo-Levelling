'use client';

import { useState, useEffect } from 'react';

export default function CSS3DCharacter() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='w-full h-[60vh] relative overflow-hidden bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900'>
      {/* 3D Scene Container */}
      <div
        className='absolute inset-0 flex items-center justify-center'
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Character Container */}
        <div
          className={`relative transition-all duration-1000 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          style={{
            transform: isLoaded
              ? `rotateX(${isHovered ? '5deg' : '10deg'}) rotateY(${
                  isHovered ? '15deg' : '0deg'
                }) translateZ(0px)`
              : 'rotateX(0deg) rotateY(0deg) translateZ(-100px)',
            transformStyle: 'preserve-3d',
            animation: isLoaded ? 'float 4s ease-in-out infinite' : 'none',
          }}
        >
          {/* Character Base */}
          <div className='relative' style={{ transformStyle: 'preserve-3d' }}>
            {/* Shadow */}
            <div
              className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black/30 rounded-full blur-sm'
              style={{
                transform: 'translateX(-50%) rotateX(90deg) translateZ(-50px)',
              }}
            />

            {/* Head */}
            <div
              className='w-16 h-16 bg-gradient-to-b from-orange-200 to-orange-300 rounded-full mx-auto mb-2 relative shadow-lg'
              style={{
                transform: 'translateZ(20px)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
              }}
            >
              {/* Eyes */}
              <div className='absolute top-6 left-4 w-2 h-2 bg-red-500 rounded-full animate-pulse' />
              <div className='absolute top-6 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse' />
              {/* Hair */}
              <div className='absolute -top-2 left-2 right-2 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-full' />
            </div>

            {/* Body */}
            <div
              className='w-20 h-24 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg mx-auto relative shadow-xl'
              style={{
                transform: 'translateZ(10px)',
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              }}
            >
              {/* Armor details */}
              <div className='absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded' />
              <div className='absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full border-2 border-yellow-300' />

              {/* Glowing core */}
              <div
                className='absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse'
                style={{
                  boxShadow: '0 0 15px #ffd700, 0 0 30px #ffd700',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </div>

            {/* Arms */}
            <div
              className='absolute top-16 -left-6 w-6 h-16 bg-gradient-to-b from-orange-200 to-orange-300 rounded-lg shadow-lg'
              style={{
                transform: 'rotateZ(-20deg) translateZ(5px)',
                transformOrigin: 'top center',
              }}
            />
            <div
              className='absolute top-16 -right-6 w-6 h-16 bg-gradient-to-b from-orange-200 to-orange-300 rounded-lg shadow-lg'
              style={{
                transform: 'rotateZ(20deg) translateZ(5px)',
                transformOrigin: 'top center',
              }}
            />

            {/* Legs */}
            <div
              className='absolute top-36 left-2 w-6 h-20 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg shadow-lg'
              style={{ transform: 'translateZ(5px)' }}
            />
            <div
              className='absolute top-36 right-2 w-6 h-20 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg shadow-lg'
              style={{ transform: 'translateZ(5px)' }}
            />

            {/* Epic Sword */}
            <div
              className='absolute top-8 -right-8 origin-bottom'
              style={{
                transform: 'rotateZ(25deg) translateZ(15px)',
                animation: isHovered
                  ? 'swordGlow 1s ease-in-out infinite'
                  : 'none',
              }}
            >
              {/* Sword blade */}
              <div className='w-2 h-20 bg-gradient-to-t from-gray-300 via-gray-100 to-white rounded-t-full shadow-lg relative'>
                {/* Sword glow effect */}
                <div
                  className='absolute inset-0 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-t-full opacity-50 blur-sm'
                  style={{
                    animation: isHovered
                      ? 'pulse 0.5s ease-in-out infinite'
                      : 'none',
                  }}
                />
              </div>
              {/* Sword handle */}
              <div className='w-3 h-6 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg -mt-1 relative'>
                <div className='absolute inset-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded' />
              </div>
            </div>

            {/* Magic Aura */}
            <div
              className='absolute inset-0 pointer-events-none'
              style={{
                background:
                  'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                animation: isLoaded
                  ? 'auraGlow 3s ease-in-out infinite'
                  : 'none',
              }}
            />
          </div>
        </div>

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-yellow-400 rounded-full opacity-70 ${
              isLoaded ? 'animate-pulse' : ''
            }`}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              transform: `translateZ(${Math.random() * 50}px)`,
            }}
          />
        ))}
      </div>

      {/* Character Info */}
      <div className='absolute bottom-4 left-4 right-4'>
        <div className='glass-effect rounded-lg p-4 text-center'>
          <h3 className='text-xl font-bold text-white mb-2'>🗡️ Sung Jin-Woo</h3>
          <p className='text-sm text-gray-300'>
            Shadow Monarch • S-Rank Hunter
          </p>
          <div className='mt-2 flex justify-center space-x-4 text-xs text-gray-400'>
            <span>Level: ∞</span>
            <span>•</span>
            <span>Power: Unlimited</span>
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            Hover to see the warrior's power
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: rotateX(10deg) rotateY(0deg) translateY(0px)
              translateZ(0px);
          }
          50% {
            transform: rotateX(10deg) rotateY(5deg) translateY(-20px)
              translateZ(10px);
          }
        }

        @keyframes auraGlow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes swordGlow {
          0%,
          100% {
            filter: drop-shadow(0 0 5px #00ffff);
          }
          50% {
            filter: drop-shadow(0 0 15px #00ffff) drop-shadow(0 0 25px #00ffff);
          }
        }
      `}</style>
    </div>
  );
}
