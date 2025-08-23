'use client';

import { useState, useEffect } from 'react';
import CSS3DCharacter from './CSS3DCharacter';

interface SketchfabHero3DProps {
  modelId?: string;
  title?: string;
  author?: string;
  width?: string;
  height?: string;
  autostart?: boolean;
  showFallback?: boolean;
}

export default function SketchfabHero3D({
  modelId = 'YOUR_MODEL_ID_HERE', // Replace with actual Sketchfab model ID
  title = '3D Character',
  author = 'Sketchfab',
  width = '100%',
  height = '480',
  autostart = true,
  showFallback = true,
}: SketchfabHero3DProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    // Only show iframe on client side to avoid SSR issues
    const timer = setTimeout(() => {
      setShowIframe(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Sketchfab embed URL
  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=${
    autostart ? 1 : 0
  }&ui_theme=dark&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=1&ui_watermark_link=1`;

  // If there's an error and fallback is enabled, show CSS character
  if (hasError && showFallback) {
    return (
      <div className='w-full h-[60vh] relative'>
        <CSS3DCharacter />
        <div className='absolute top-4 right-4 bg-red-500/20 border border-red-500 rounded-lg p-2'>
          <p className='text-red-300 text-xs'>Sketchfab model failed to load</p>
          <p className='text-red-400 text-xs'>Using CSS 3D fallback</p>
        </div>
      </div>
    );
  }

  // If no model ID is set, show instructions
  if (modelId === 'YOUR_MODEL_ID_HERE') {
    return (
      <div className='w-full h-[60vh] relative bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-6'>
          <div className='w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center'>
            <span className='text-3xl'>🎯</span>
          </div>
          <h2 className='text-2xl font-bold text-white mb-4'>
            Ready for Your 3D Character!
          </h2>
          <div className='bg-black/30 rounded-lg p-4 text-left'>
            <p className='text-gray-300 text-sm mb-2'>
              <strong className='text-yellow-400'>Next Steps:</strong>
            </p>
            <ol className='text-gray-400 text-xs space-y-1 list-decimal list-inside'>
              <li>Visit https://sketchfab.com</li>
              <li>Search for "anime warrior"</li>
              <li>Copy the model ID from URL</li>
              <li>Update the modelId prop</li>
            </ol>
          </div>
          <div className='mt-4'>
            <CSS3DCharacter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-[60vh] relative'>
      {/* Loading State */}
      {isLoading && (
        <div className='absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-10'>
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-4 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin'></div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Loading 3D Character...
            </h2>
            <p className='text-gray-300'>Connecting to Sketchfab</p>
          </div>
        </div>
      )}

      {/* Sketchfab Iframe */}
      {showIframe && !hasError && (
        <iframe
          title={title}
          frameBorder='0'
          allowFullScreen
          mozallowfullscreen='true'
          webkitallowfullscreen='true'
          allow='autoplay; fullscreen; xr-spatial-tracking'
          xr-spatial-tracking='true'
          execution-while-out-of-viewport='true'
          execution-while-not-rendered='true'
          web-share='true'
          width={width}
          height={height}
          src={embedUrl}
          onLoad={handleLoad}
          onError={handleError}
          className='w-full h-full'
        />
      )}

      {/* Character Info Overlay */}
      <div className='absolute bottom-4 left-4 right-4 z-20'>
        <div className='glass-effect rounded-lg p-4 text-center'>
          <h3 className='text-xl font-bold text-white mb-2'>🗡️ {title}</h3>
          <p className='text-sm text-gray-300'>
            Interactive 3D Character • {author}
          </p>
          <div className='mt-2 flex justify-center space-x-4 text-xs text-gray-400'>
            <span>Powered by Sketchfab</span>
            <span>•</span>
            <span>Use mouse to interact</span>
          </div>
          {isLoading && (
            <p className='text-xs text-yellow-400 mt-2'>Loading 3D model...</p>
          )}
        </div>
      </div>
    </div>
  );
}
