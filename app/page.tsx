'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/landing');
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800'>
      <div className='text-center'>
        <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl animate-pulse'>
          <span className='text-3xl'>⚡</span>
        </div>
        <p className='text-gray-600 dark:text-gray-400'>Redirecting...</p>
      </div>
    </div>
  );
}
