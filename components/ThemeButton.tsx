'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

/**
 * ThemeButton Component
 *
 * Demonstrates:
 * - Using theme colors from design tokens
 * - Accessing theme context
 * - Semantic color usage (primary, secondary, etc.)
 * - Accessible button patterns
 *
 * Accessibility Notes:
 * - Sufficient color contrast (4.5:1 for WCAG AA)
 * - Clear focus states for keyboard navigation
 * - Semantic HTML (button element)
 */
export function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        flex items-center gap-2
        ${
          isDark
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-primary-100 hover:bg-primary-200 text-primary-900'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
      `}
    >
      {isDark ? (
        <SunIcon className='w-4 h-4' />
      ) : (
        <MoonIcon className='w-4 h-4' />
      )}
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
