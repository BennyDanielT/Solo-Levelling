// Theme color system for productivity dashboard
// Design tokens for consistent theming across light and dark modes

/**
 * Color palette generation utility
 * Creates 100-900 shade scales from base colors
 */
function generateShades(baseColor: string): Record<number, string> {
  // Simplified shade generation - in production, use a proper color manipulation library
  const shades: Record<number, string> = {};
  const baseHex = baseColor.replace('#', '');
  const r = parseInt(baseHex.substr(0, 2), 16);
  const g = parseInt(baseHex.substr(2, 2), 16);
  const b = parseInt(baseHex.substr(4, 2), 16);

  // Generate 100-900 shades (simplified approach)
  for (let i = 1; i <= 9; i++) {
    const factor = (i - 5) * 0.15; // -0.6 to +0.6 range
    const newR = Math.max(0, Math.min(255, Math.round(r * (1 + factor))));
    const newG = Math.max(0, Math.min(255, Math.round(g * (1 + factor))));
    const newB = Math.max(0, Math.min(255, Math.round(b * (1 + factor))));
    shades[i * 100] = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  return shades;
}

// Light mode palette
export const lightPalette = {
  deep_sky_blue: {
    50: '#e6f9ff',
    100: '#ccedff',
    200: '#99dbff',
    300: '#66c9ff',
    400: '#33b7ff',
    500: '#01befe', // base
    600: '#018fcb',
    700: '#016598',
    800: '#014366',
    900: '#002133',
    ...generateShades('#01befe')
  },
  bright_gold: {
    50: '#fffce6',
    100: '#fff9cc',
    200: '#fff399',
    300: '#ffed66',
    400: '#ffe733',
    500: '#ffdd00', // base
    600: '#ccb000',
    700: '#998300',
    800: '#665600',
    900: '#332b00',
    ...generateShades('#ffdd00')
  },
  vivid_tangerine: {
    50: '#fff2e6',
    100: '#ffe4cc',
    200: '#ffc999',
    300: '#ffae66',
    400: '#ff9333',
    500: '#ff7d00', // base
    600: '#cc6400',
    700: '#994b00',
    800: '#663200',
    900: '#331900',
    ...generateShades('#ff7d00')
  },
  neon_pink: {
    50: '#ffe6f0',
    100: '#ffccd9',
    200: '#ff99b3',
    300: '#ff668d',
    400: '#ff3367',
    500: '#ff006d', // base
    600: '#cc0056',
    700: '#990040',
    800: '#66002b',
    900: '#330015',
    ...generateShades('#ff006d')
  },
  slime_lime: {
    50: '#f5ffe6',
    100: '#ebffcc',
    200: '#d7ff99',
    300: '#c3ff66',
    400: '#afff33',
    500: '#adff02', // base
    600: '#8acc02',
    700: '#679901',
    800: '#446601',
    900: '#223300',
    ...generateShades('#adff02')
  },
  violet_ray: {
    50: '#f2e6ff',
    100: '#e4ccff',
    200: '#c999ff',
    300: '#ae66ff',
    400: '#9333ff',
    500: '#8f00ff', // base
    600: '#7200cc',
    700: '#550099',
    800: '#380066',
    900: '#1c0033',
    ...generateShades('#8f00ff')
  }
};

// Dark mode palette
export const darkPalette = {
  strawberry_red: {
    50: '#fee6e7',
    100: '#fdccd0',
    200: '#fb99a1',
    300: '#f96672',
    400: '#f73343',
    500: '#f94144', // base
    600: '#c73436',
    700: '#952729',
    800: '#641a1c',
    900: '#320d0e',
    ...generateShades('#f94144')
  },
  atomic_tangerine: {
    50: '#fef2e6',
    100: '#fde4cc',
    200: '#fbc999',
    300: '#f9ae66',
    400: '#f79333',
    500: '#f3722c', // base
    600: '#c45e24',
    700: '#95471b',
    800: '#663012',
    900: '#331809',
    ...generateShades('#f3722c')
  },
  carrot_orange: {
    50: '#fef5e6',
    100: '#fdebcc',
    200: '#fbd799',
    300: '#f9c366',
    400: '#f7af33',
    500: '#f8961e', // base
    600: '#c67819',
    700: '#955a13',
    800: '#643c0e',
    900: '#321e07',
    ...generateShades('#f8961e')
  },
  tuscan_sun: {
    50: '#fefce6',
    100: '#fdf9cc',
    200: '#fbf399',
    300: '#f9ed66',
    400: '#f7e733',
    500: '#f9c74f', // base
    600: '#c7a140',
    700: '#957c30',
    800: '#645620',
    900: '#322b10',
    ...generateShades('#f9c74f')
  },
  willow_green: {
    50: '#eff5e9',
    100: '#dfecd3',
    200: '#bfd9a7',
    300: '#9fc67b',
    400: '#7fb34f',
    500: '#90be6d', // base
    600: '#739857',
    700: '#567241',
    800: '#394c2b',
    900: '#1c2615',
    ...generateShades('#90be6d')
  },
  seagrass: {
    50: '#e6f4f1',
    100: '#cce9e3',
    200: '#99d3c7',
    300: '#66bdab',
    400: '#33a78f',
    500: '#43aa8b', // base
    600: '#368970',
    700: '#286755',
    800: '#1a453a',
    900: '#0d221d',
    ...generateShades('#43aa8b')
  },
  blue_slate: {
    50: '#e9eef2',
    100: '#d3dde5',
    200: '#a7bbcb',
    300: '#7b99b1',
    400: '#4f7797',
    500: '#577590', // base
    600: '#465e75',
    700: '#34475a',
    800: '#23303f',
    900: '#11181f',
    ...generateShades('#577590')
  }
};

// Semantic color mappings for consistent usage
export const semanticColors = {
  primary: 'deep_sky_blue',
  secondary: 'bright_gold',
  accent: 'vivid_tangerine',
  success: 'slime_lime',
  warning: 'tuscan_sun',
  error: 'strawberry_red',
  info: 'blue_slate'
};

// Export flattened palettes for Tailwind
export const tailwindColors = {
  ...lightPalette,
  ...darkPalette
};

export const themeColorTokens = {
  light: {
    primary: lightPalette.deep_sky_blue[500],
    secondary: lightPalette.bright_gold[500],
    success: lightPalette.slime_lime[500],
    warning: lightPalette.vivid_tangerine[500],
    error: darkPalette.strawberry_red[500],
    background: '#f5f6f8',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
  },
  dark: {
    primary: darkPalette.blue_slate[400],
    secondary: darkPalette.tuscan_sun[500],
    success: darkPalette.willow_green[400],
    warning: darkPalette.atomic_tangerine[400],
    error: darkPalette.strawberry_red[500],
    background: '#292929',
    surface: '#1f1f1f',
    text: '#f8fafc',
    textSecondary: '#cbd5f5',
  },
};

// Best practices:
// 1. Use semantic names (primary, secondary) over direct color names
// 2. Always provide both light and dark variants
// 3. Test color combinations for accessibility (WCAG contrast ratios)
// 4. Use the generateShades utility for consistent color scales
// 5. Document color usage in component comments