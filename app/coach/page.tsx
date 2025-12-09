'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ChatInterface from '@/components/ChatInterface';

export const dynamic = 'force-dynamic';

export default function CoachPage() {
  const session = useSession();
  const sessionStatus = session?.status || 'loading';

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [sessionStatus]);

  if (sessionStatus === 'loading') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-white text-lg'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700'>
      <Navigation />
      <div className='pt-20 pb-8'>
        <div className='max-w-5xl mx-auto px-4'>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
