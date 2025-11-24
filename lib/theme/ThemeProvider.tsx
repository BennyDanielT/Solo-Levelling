'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme context type
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Handle hydration and initial theme detection
  useEffect(() => {
    setMounted(true);

    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    const initialTheme = savedTheme || systemTheme;

    setThemeState(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Set theme function
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // Always provide context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error('useTheme must be used within a ThemeProvider');
    // Return default values instead of throwing
    return {
      theme: 'light' as const,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
