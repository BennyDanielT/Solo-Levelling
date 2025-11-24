'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function Navigation() {
  const path = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      path === href
        ? 'bg-white/10 text-white'
        : 'text-gray-300 hover:bg-white/5'
    }`;

  return (
    <nav className='w-full bg-dark-900/80 backdrop-blur sticky top-0 z-40 border-b border-white/5'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-14 items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/' className='text-lg font-semibold text-white'>
              Solo-Levelling
            </Link>
            <div className='ml-4 flex items-center space-x-1'>
              <Link href='/' className={linkClass('/')}>
                Home
              </Link>
              <Link href='/coach' className={linkClass('/coach')}>
                LLM Chat
              </Link>
              <Link href='/goals' className={linkClass('/goals')}>
                Goals
              </Link>
            </div>
          </div>

          <div className='flex items-center space-x-3'>
            <Link
              href='/api/auth/signin'
              className='px-3 py-1 text-sm rounded-md bg-white/5 text-gray-200 hover:bg-white/10'
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
