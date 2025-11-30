// Modern productivity dashboard color system (2025)
// Inspired by: Vercel, Linear, Stripe, Arc Browser
// Optimized for dark mode with WCAG AA+ accessibility

// Primary colors - Blue gradient (trust, productivity)
export const blue = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

// Accent - Purple/Violet (creativity, premium)
export const violet = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
};

// Success - Emerald green
export const emerald = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
};

// Warning - Amber
export const amber = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
};

// Error - Rose/Red
export const rose = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
  950: '#4c0519',
};

// Cyan - For charts
export const cyan = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#06b6d4',
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344',
};

// Pink - For charts
export const pink = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
  950: '#500724',
};

// Orange - For charts
export const orange = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
};

// Neutral - Modern grays
export const neutral = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

// Chart colors - Professional data viz palette
export const chartColors = {
  primary: '#3b82f6',    // blue-500
  secondary: '#8b5cf6',  // violet-500
  success: '#10b981',    // emerald-500
  warning: '#f59e0b',    // amber-500
  error: '#f43f5e',      // rose-500
  cyan: '#06b6d4',       // cyan-500
  pink: '#ec4899',       // pink-500
  orange: '#f97316',     // orange-500
};

// Theme tokens
export const themeTokens = {
  light: {
    // Brand colors
    primary: blue[600],
    primaryHover: blue[700],
    primaryActive: blue[800],
    accent: violet[600],
    accentHover: violet[700],
    
    // Status colors
    success: emerald[600],
    successBg: emerald[50],
    warning: amber[600],
    warningBg: amber[50],
    error: rose[600],
    errorBg: rose[50],
    info: blue[600],
    infoBg: blue[50],
    
    // Backgrounds
    background: '#ffffff',
    backgroundAlt: neutral[50],
    surface: '#ffffff',
    surfaceHover: neutral[100],
    surfaceActive: neutral[200],
    
    // Borders
    border: neutral[200],
    borderHover: neutral[300],
    borderStrong: neutral[400],
    
    // Text
    textPrimary: neutral[900],
    textSecondary: neutral[600],
    textTertiary: neutral[500],
    textOnPrimary: '#ffffff',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  
  dark: {
    // Brand colors
    primary: blue[500],
    primaryHover: blue[400],
    primaryActive: blue[300],
    accent: violet[500],
    accentHover: violet[400],
    
    // Status colors
    success: emerald[500],
    successBg: emerald[950],
    warning: amber[500],
    warningBg: amber[950],
    error: rose[500],
    errorBg: rose[950],
    info: blue[500],
    infoBg: blue[950],
    
    // Backgrounds
    background: '#0a0a0a',
    backgroundAlt: neutral[950],
    surface: '#18181b',
    surfaceHover: neutral[800],
    surfaceActive: neutral[700],
    
    // Borders
    border: neutral[800],
    borderHover: neutral[700],
    borderStrong: neutral[600],
    
    // Text
    textPrimary: neutral[50],
    textSecondary: neutral[400],
    textTertiary: neutral[500],
    textOnPrimary: '#ffffff',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
  },
};

// Export all for Tailwind
export const modernColors = {
  blue,
  violet,
  emerald,
  amber,
  rose,
  cyan,
  pink,
  orange,
  neutral,
};

export default modernColors;
