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
  ChevronLeftIcon,
} from '@radix-ui/react-icons';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const navigationItems = [
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden'
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col border-r border-gray-200 dark:border-white/5
        bg-white dark:bg-gradient-to-b dark:from-[#050c1a] dark:via-[#050f24] dark:to-[#020409]
        shadow-2xl transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
        ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-white/5 flex-shrink-0'>
          {!isCollapsed && (
            <h1 className='text-xl font-bold text-deep_sky_blue-600 dark:text-[#01befe] whitespace-nowrap'>
              Productivity Hub
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 lg:flex hidden'
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronLeftIcon
              className={`h-5 w-5 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
          <button
            onClick={onToggle}
            className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden'
          >
            <Cross2Icon className='h-5 w-5' />
          </button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto px-2 py-6'>
          <ul className='space-y-2'>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center lg:justify-start rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-[#01befe]/10 text-[#01befe] dark:bg-[#01befe]/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white/70 dark:hover:bg-white/5'
                    }
                    ${isCollapsed ? 'w-12' : ''}`}
                    title={item.name}
                  >
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    {!isCollapsed && (
                      <span className='ml-3 whitespace-nowrap'>
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className='p-3 border-t border-gray-200 dark:border-white/5 flex-shrink-0'>
          <div
            className={`rounded-xl bg-gray-50 dark:bg-[#040914] dark:border dark:border-white/5 p-3 flex ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#01befe] via-[#ff7d00] to-[#adff02] text-white shadow-lg flex-shrink-0'>
              <PersonIcon className='h-4 w-4' />
            </div>
            {!isCollapsed && (
              <div>
                <p className='text-xs font-semibold text-gray-800 dark:text-white'>
                  John Doe
                </p>
                <p className='text-xs text-gray-500 dark:text-white/70'>
                  Level 5
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className='lg:hidden'>
      <div className='flex items-center justify-between h-16 px-4 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-gray-800'>
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
