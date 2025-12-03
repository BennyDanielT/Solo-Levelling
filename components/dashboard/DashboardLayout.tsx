'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';
import { ThemeButton } from '@/components/ThemeButton';
import { FloatingQuickPanel } from './FloatingQuickPanel';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onAddGoal?: () => void;
}

export function DashboardLayout({ children, onAddGoal }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  Life Hacker
                </h2>
              </div>
              <div className='flex items-center gap-3'>
                <ThemeButton />
                {session ? (
                  <div className='relative' ref={dropdownRef}>
                    <div className='hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700'>
                      <div className='text-right'>
                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>{session.user?.name || 'User'}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>{session.user?.email}</p>
                      </div>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className='w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300 font-bold text-sm'
                      >
                        {session.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50'>
                        <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                          <p className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                            {session.user?.name || 'User'}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href='/profile'
                          className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                          </svg>
                          Profile
                        </Link>
                        <Link
                          href='/settings'
                          className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          </svg>
                          Settings
                        </Link>
                        <div className='border-t border-gray-200 dark:border-gray-700 my-2'></div>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut({ callbackUrl: '/landing' });
                          }}
                          className='w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: '/landing' })}
                      className='sm:hidden px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-all text-xs'
                    >
                      Sign Out
                    </button>
                  </div>
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
            <FloatingQuickPanel onAddGoal={onAddGoal} />
          </main>
        </div>
      </div>
    </div>
  );
}
