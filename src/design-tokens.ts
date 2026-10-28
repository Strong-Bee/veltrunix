/**
 * Design Tokens - Single source of truth for Veltrunix design system
 * All components should reference these tokens instead of hardcoded values
 */

// Color palette - Dark theme optimized for developer tools
export const colors = {
  // Base
  background: '#0B1220',
  foreground: '#E2E8F0',

  // Surface layers
  surface: {
    base: '#111827',
    elevated: '#161F33',
    overlay: '#1E293B',
    border: '#2D3A4F',
  },

  // Semantic colors
  primary: {
    base: '#22C55E',      // Green 500 - main accent
    hover: '#16A34A',     // Green 600
    active: '#15803D',    // Green 700
    muted: '#22C55E33',   // 20% opacity
    onPrimary: '#0B1220',
  },

  secondary: {
    base: '#334155',      // Slate 700
    hover: '#475569',     // Slate 600
    active: '#64748B',    // Slate 500
    onSecondary: '#F8FAFC',
  },

  destructive: {
    base: '#EF4444',      // Red 500
    hover: '#DC2626',     // Red 600
    active: '#B91C1C',    // Red 700
    muted: '#EF444433',   // 20% opacity
    onDestructive: '#FFFFFF',
  },

  warning: {
    base: '#F59E0B',      // Amber 500
    hover: '#D97706',     // Amber 600
    muted: '#F59E0B33',   // 20% opacity
  },

  info: {
    base: '#3B82F6',      // Blue 500
    hover: '#2563EB',     // Blue 600
    muted: '#3B82F633',   // 20% opacity
  },

  success: {
    base: '#22C55E',      // Green 500
    hover: '#16A34A',     // Green 600
    muted: '#22C55E33',   // 20% opacity
  },

  // Text colors
  text: {
    primary: '#F8FAFC',      // slate-50
    secondary: '#94A3B8',    // slate-400
    muted: '#64748B',        // slate-500
    inverse: '#0B1220',
    link: '#22C55E',
    linkHover: '#16A34A',
  },

  // Status colors (for badges, indicators)
  status: {
    installed: { bg: '#22C55E33', text: '#22C55E', border: '#22C55E4D' },
    running: { bg: '#22C55E33', text: '#22C55E', border: '#22C55E4D' },
    stopped: { bg: '#F59E0B33', text: '#F59E0B', border: '#F59E0B4D' },
    notFound: { bg: '#64748B33', text: '#94A3B8', border: '#64748B4D' },
    error: { bg: '#EF444433', text: '#EF4444', border: '#EF44444D' },
    active: { bg: '#22C55E33', text: '#22C55E', border: '#22C55E4D' },
    inactive: { bg: '#64748B33', text: '#94A3B8', border: '#64748B4D' },
  },

  // Focus ring
  focus: {
    ring: '#22C55E',
    offset: '#0B1220',
  },
} as const;

// Spacing scale (4px base unit)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px',
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
    base: ['1rem', { lineHeight: '1.6' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.6' }],     // 18px
    xl: ['1.25rem', { lineHeight: '1.5' }],      // 20px
    '2xl': ['1.5rem', { lineHeight: '1.4' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '1.3' }],  // 30px
    '4xl': ['2.25rem', { lineHeight: '1.2' }],   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Shadow scale
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: '0 0 0 2px #22C55E',
} as const;

// Transition durations
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
    },
    fontSize: {
      sm: '0.75rem',
      md: '0.875rem',
      lg: '1rem',
    },
    gap: '8px',
    borderRadius: borderRadius.md,
  },
  input: {
    height: '40px',
    padding: '0 12px',
    fontSize: '0.875rem',
    borderRadius: borderRadius.md,
    borderWidth: '1px',
  },
  card: {
    padding: '24px',
    borderRadius: borderRadius.xl,
    borderWidth: '1px',
  },
  table: {
    cellPadding: '12px 16px',
    headerHeight: '40px',
    rowHeight: '48px',
    borderWidth: '1px',
  },
  sidebar: {
    width: {
      collapsed: '64px',
      expanded: '256px',
    },
    mobileWidth: '288px',
  },
  header: {
    height: '56px',
  },
} as const;

// Icon sizes
export const iconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Transitions = typeof transitions;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type Components = typeof components;
export type IconSizes = typeof iconSizes;