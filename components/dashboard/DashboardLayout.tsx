'use client';

import React, { useState } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';
import { ThemeButton } from '@/components/ThemeButton';
import { FloatingQuickPanel } from './FloatingQuickPanel';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white flex transition-colors duration-300'>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className='flex-1 flex flex-col'>
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className='flex-1'>
          <div className='sticky top-0 z-30 bg-white/95 backdrop-blur-md dark:bg-gray-900/95 border-b border-gray-200/80 dark:border-gray-700/50 shadow-sm'>
            <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
              <div className='flex items-center gap-3'>
                <Link href='/dashboard' className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer'>
                  <span className='text-xl'>⚡</span>
                </Link>
                <h2 className='hidden sm:block text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent'>
                  Level Up HQ
                </h2>
              </div>
              <div className='flex items-center gap-3'>
                <ThemeButton />
                {session ? (
                  <>
                    <div className='hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700'>
                      <div className='text-right'>
                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>{session.user?.name || 'User'}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>{session.user?.email}</p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: '/landing' })}
                        className='w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300 font-bold text-sm'
                      >
                        {session.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </button>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/landing' })}
                      className='sm:hidden px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-all text-xs'
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href='/auth/signin' className='px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg text-sm'>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
          <main className='flex-1 relative'>
            <div className='py-8'>
              <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {children}
              </div>
            </div>
            <FloatingQuickPanel />
          </main>
        </div>
      </div>
    </div>
  );
}
