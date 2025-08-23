'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the 3D model scene component with no SSR
const Model3DScene = dynamic(() => import('./Model3DScene'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-[60vh] relative bg-gradient-to-b from-dark-900 to-dark-700 flex items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2 drop-shadow-2xl'>
          Loading 3D Model...
        </h2>
      </div>
    </div>
  ),
});

interface Model3DProps {
  modelUrl?: string;
  height?: string;
  showControls?: boolean;
}

export default function Model3D({
  modelUrl,
  height = '60vh',
  showControls = true,
}: Model3DProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className='w-full relative bg-gradient-to-b from-dark-900 to-dark-700 flex items-center justify-center'
        style={{ height }}
      >
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-2 drop-shadow-2xl'>
            Loading 3D Model...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full relative' style={{ height }}>
      <Suspense
        fallback={
          <div className='w-full h-full relative bg-gradient-to-b from-dark-900 to-dark-700 flex items-center justify-center'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-white mb-2 drop-shadow-2xl'>
                Loading 3D Model...
              </h2>
            </div>
          </div>
        }
      >
        <Model3DScene modelUrl={modelUrl} showControls={showControls} />
      </Suspense>
    </div>
  );
}
