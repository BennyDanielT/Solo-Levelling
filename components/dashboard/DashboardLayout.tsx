'use client';

import React, { useState } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';
import { ThemeButton } from '@/lib/theme/ThemeButton';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { FloatingQuickPanel } from './FloatingQuickPanel';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className='min-h-screen bg-[#f5f6f8] text-gray-900 dark:bg-[#292929] dark:text-white flex'>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className='flex-1 flex flex-col'>
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className='flex-1'>
          <div className='sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-[#1f1f1f]/90 border-b border-gray-200 dark:border-white/5 shadow-sm'>
            <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Dashboard
              </h2>
              <div className='flex items-center space-x-4'>
                <ThemeButton
                  onClick={toggleTheme}
                  variant='secondary'
                  size='sm'
                  className='p-2'
                >
                  {theme === 'light' ? (
                    <MoonIcon className='h-4 w-4' />
                  ) : (
                    <SunIcon className='h-4 w-4' />
                  )}
                </ThemeButton>
                <button className='p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition'>
                  <span className='sr-only'>View notifications</span>
                  <div className='relative'>
                    <svg
                      className='h-6 w-6'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 17h5l-5 5v-5zM15 7v5H9v-5H7v5H3v-5H1v12h14V7h-2z'
                      />
                    </svg>
                    <span className='absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center'>
                      <span className='text-xs text-white font-medium'>3</span>
                    </span>
                  </div>
                </button>
                <div className='w-8 h-8 bg-deep_sky_blue-500 rounded-full flex items-center justify-center shadow-lg'>
                  <span className='text-sm font-medium text-white'>JD</span>
                </div>
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
