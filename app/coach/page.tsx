'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import AIAssistantUI from '@/components/AIAssistantUI';

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
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-900 dark:text-white text-lg'>Loading...</p>
        </div>
      </div>
    );
  }

  return <AIAssistantUI />;
}


