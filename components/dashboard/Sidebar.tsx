'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  TargetIcon,
  BellIcon,
  PersonIcon,
  Cross2Icon,
  BarChartIcon,
  GearIcon,
  HamburgerMenuIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Goals', href: '/goals', icon: TargetIcon },
  { name: 'Achievements', href: '/achievements', icon: CheckCircledIcon },
  { name: 'Reminders', href: '/reminders', icon: BellIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChartIcon },
  { name: 'Profile', href: '/profile', icon: PersonIcon },
  { name: 'Settings', href: '/settings', icon: GearIcon },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700'>
          <h1 className='text-xl font-bold text-deep_sky_blue-600 dark:text-deep_sky_blue-400'>
            Productivity Hub
          </h1>
          <button
            onClick={onToggle}
            className='p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden'
          >
            <Cross2Icon className='h-6 w-6' />
          </button>
        </div>

        <nav className='mt-8 px-4'>
          <ul className='space-y-2'>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                      ${
                        isActive
                          ? 'bg-deep_sky_blue-50 text-deep_sky_blue-700 dark:bg-deep_sky_blue-900 dark:text-deep_sky_blue-300'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      }
                    `}
                  >
                    <item.icon className='h-5 w-5 mr-3' />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-deep_sky_blue-500 rounded-full flex items-center justify-center'>
                <PersonIcon className='h-4 w-4 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                John Doe
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Level 5 Achiever
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className='lg:hidden'>
      <div className='flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
        <button
          onClick={onMenuClick}
          className='p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <HamburgerMenuIcon className='h-6 w-6' />
        </button>
        <h1 className='text-lg font-bold text-deep_sky_blue-600 dark:text-deep_sky_blue-400'>
          Productivity Hub
        </h1>
        <div className='w-10' /> {/* Spacer for centering */}
      </div>
    </div>
  );
}
