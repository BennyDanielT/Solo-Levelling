'use client';

import { useState, useEffect } from 'react';

export default function SimpleHero3D() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className='w-full h-[60vh] relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'>
      {/* Animated background shapes */}
      <div className='absolute inset-0'>
        {/* Floating cubes with CSS 3D transforms */}
        <div
          className={`absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-2xl transition-all duration-1000 ${
            isLoaded ? 'animate-spin' : ''
          }`}
          style={{
            transform: isLoaded
              ? 'perspective(1000px) rotateX(45deg) rotateY(45deg)'
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            animation: isLoaded
              ? 'float 6s ease-in-out infinite, rotate 8s linear infinite'
              : 'none',
          }}
        />

        {/* Crystal-like shape */}
        <div
          className={`absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-2xl transition-all duration-1000 ${
            isLoaded ? 'animate-pulse' : ''
          }`}
          style={{
            transform: isLoaded
              ? 'perspective(1000px) rotateX(30deg) rotateZ(45deg) scale(1.2)'
              : 'perspective(1000px) rotateX(0deg) rotateZ(0deg) scale(1)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            animation: isLoaded
              ? 'float 4s ease-in-out infinite reverse, pulse 3s ease-in-out infinite'
              : 'none',
          }}
        />

        {/* Ring shapes */}
        <div
          className={`absolute bottom-1/3 left-1/3 w-20 h-20 border-4 border-red-400 rounded-full shadow-lg transition-all duration-1000 ${
            isLoaded ? 'animate-spin' : ''
          }`}
          style={{
            transform: isLoaded
              ? 'perspective(1000px) rotateX(75deg) rotateY(45deg)'
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
            animation: isLoaded ? 'orbit 10s linear infinite' : 'none',
          }}
        />

        <div
          className={`absolute bottom-1/3 left-1/3 w-16 h-16 border-4 border-teal-400 rounded-full shadow-lg transition-all duration-1500 ${
            isLoaded ? 'animate-spin' : ''
          }`}
          style={{
            transform: isLoaded
              ? 'perspective(1000px) rotateX(45deg) rotateZ(90deg)'
              : 'perspective(1000px) rotateX(0deg) rotateZ(0deg)',
            animation: isLoaded ? 'orbit 8s linear infinite reverse' : 'none',
          }}
        />

        {/* Particle-like dots */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white rounded-full opacity-70 transition-all duration-1000 ${
              isLoaded ? 'animate-twinkle' : ''
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: isLoaded
                ? `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <div className='text-center'>
          <h1
            className={`text-6xl font-bold text-white mb-4 drop-shadow-2xl transition-all duration-1000 ${
              isLoaded
                ? 'transform-gpu translate-y-0 opacity-100'
                : 'transform-gpu translate-y-8 opacity-80'
            }`}
          >
            Solo Leveling
          </h1>
          <p
            className={`text-xl text-gray-300 drop-shadow-lg transition-all duration-1000 delay-300 ${
              isLoaded
                ? 'transform-gpu translate-y-0 opacity-100'
                : 'transform-gpu translate-y-4 opacity-60'
            }`}
          >
            Level up your life, one goal at a time
          </p>
          {!isLoaded && (
            <div className='mt-4'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
