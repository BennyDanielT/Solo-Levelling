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
      className="
        group relative inline-flex items-center gap-2
        px-4 py-2 rounded-xl font-medium
        transition-all duration-300 ease-in-out
        bg-white/10 dark:bg-gray-800/50
        hover:bg-white/20 dark:hover:bg-gray-700/50
        border border-gray-200/50 dark:border-gray-700/50
        text-gray-700 dark:text-gray-200
        shadow-sm hover:shadow-md
        backdrop-blur-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
      "
    >
      <div className="relative w-5 h-5 transition-transform duration-300 group-hover:scale-110">
        {isDark ? (
          <SunIcon className="w-5 h-5 text-amber-400" />
        ) : (
          <MoonIcon className="w-5 h-5 text-blue-500" />
        )}
      </div>
      <span className="text-sm font-semibold">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
