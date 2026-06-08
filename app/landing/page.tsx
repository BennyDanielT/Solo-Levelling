'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if authenticated (not loading and has session)
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  // If unauthenticated, show the landing page
  if (status === 'unauthenticated') {
    // Clear any lingering redirects
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Animated background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse' style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen px-4'>
        <div className='text-center max-w-4xl mx-auto'>
          {/* Logo */}
          <div className='mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl hover:scale-110 transition-transform duration-300'>
            <span className='text-5xl'>⚡</span>
          </div>

          {/* Hero Text */}
          <h1 className='text-6xl md:text-7xl font-bold mb-6'>
            <span className='bg-gradient-to-r from-emerald-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent'>
              Life Hacker
            </span>
          </h1>
          <p className='text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto'>
            Track your goals, build habits, and level up your life with our powerful productivity dashboard.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link
              href='/auth/signup'
              className='px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 text-lg'
            >
              Get Started Free
            </Link>
            <Link
              href='/auth/signin'
              className='px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl transition-all duration-200 shadow-lg border-2 border-gray-200 dark:border-gray-700 text-lg'
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-20'>
            {[
              { icon: '🎯', title: 'Goal Tracking', desc: 'Set and achieve your goals with smart tracking' },
              { icon: '📊', title: 'Analytics', desc: 'Visualize your progress with beautiful charts' },
              { icon: '🔥', title: 'Habit Building', desc: 'Build consistent habits that stick' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className='p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform duration-300'
              >
                <div className='text-4xl mb-4'>{feature.icon}</div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>{feature.title}</h3>
                <p className='text-gray-600 dark:text-gray-400'>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

