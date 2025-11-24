'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

/**
 * Sample Button Component
 *
 * Demonstrates usage of theme colors in Tailwind classes
 * Uses semantic color names for consistent theming
 */
export function ThemeButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { theme } = useTheme();

  // Base classes
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Color variants using theme colors
  const variantClasses = {
    primary: `
      bg-deep_sky_blue-500 hover:bg-deep_sky_blue-600 text-white
      focus:ring-deep_sky_blue-500
      dark:bg-deep_sky_blue-400 dark:hover:bg-deep_sky_blue-500
    `,
    secondary: `
      bg-bright_gold-500 hover:bg-bright_gold-600 text-white
      focus:ring-bright_gold-500
      dark:bg-bright_gold-400 dark:hover:bg-bright_gold-500
    `,
    success: `
      bg-slime_lime-500 hover:bg-slime_lime-600 text-white
      focus:ring-slime_lime-500
      dark:bg-slime_lime-400 dark:hover:bg-slime_lime-500
    `,
    error: `
      bg-strawberry_red-500 hover:bg-strawberry_red-600 text-white
      focus:ring-strawberry_red-500
      dark:bg-strawberry_red-400 dark:hover:bg-strawberry_red-500
    `,
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Usage Examples:
 *
 * // Basic usage
 * <ThemeButton onClick={() => console.log('clicked!')}>
 *   Click me
 * </ThemeButton>
 *
 * // With variants and sizes
 * <ThemeButton variant="success" size="lg">
 *   Success Action
 * </ThemeButton>
 *
 * <ThemeButton variant="error" size="sm">
 *   Delete
 * </ThemeButton>
 *
 * // Best practices:
 * - Use semantic variant names (primary, secondary, success, error)
 * - Always test color combinations for accessibility
 * - Use the theme-aware classes for automatic light/dark mode switching
 * - Document color usage in component comments
 */
