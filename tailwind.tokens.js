// Tailwind Design Tokens - Plain JS version for Tailwind config
// Source of truth: src/design-tokens.ts (keep in sync)

export const colors = {
  background: '#0B1220',
  foreground: '#F8FAFC',
  surface: {
    base: '#111827',
    elevated: '#161F33',
    overlay: '#1E293B',
    border: '#2D3A4F',
  },
  primary: {
    base: '#22C55E',
    hover: '#16A34A',
    active: '#15803D',
    muted: '#22C55E33',
    onPrimary: '#0B1220',
  },
  secondary: {
    base: '#334155',
    hover: '#475569',
    active: '#64748B',
    onSecondary: '#F8FAFC',
  },
  destructive: {
    base: '#EF4444',
    hover: '#DC2626',
    active: '#B91C1C',
    muted: '#EF444433',
    onDestructive: '#FFFFFF',
  },
  warning: {
    base: '#F59E0B',
    hover: '#D97706',
    muted: '#F59E0B33',
  },
  info: {
    base: '#3B82F6',
    hover: '#2563EB',
    muted: '#3B82F633',
  },
  success: {
    base: '#22C55E',
    hover: '#16A34A',
    muted: '#22C55E33',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0B1220',
    link: '#22C55E',
    linkHover: '#16A34A',
  },
  status: {
    installed: { bg: '#22C55E33', text: '#22C55E', border: '#22C55E4D' },
    running: { bg: '#22C55E33', text: '#22C55E', border: '#22C55E4D' },
    stopped: { bg: '#F59E0B33', text: '#F59E0B', border: '#F59E0B4D' },
    notFound: { bg: '#64748B33', text: '#94A3B8', border: '#64748B4D' },
    error: { bg: '#EF444433', text: '#EF4444', border: '#EF44444D' },
    active: { bg: '#22C55E33', text: '#22C55E', border: '#22C55E4D' },
    inactive: { bg: '#64748B33', text: '#94A3B8', border: '#64748B4D' },
  },
  focus: {
    ring: '#22C55E',
    offset: '#0B1220',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

export const fontFamily = {
  sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
};

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1.5' }],
  sm: ['0.875rem', { lineHeight: '1.5' }],
  base: ['1rem', { lineHeight: '1.6' }],
  lg: ['1.125rem', { lineHeight: '1.6' }],
  xl: ['1.25rem', { lineHeight: '1.5' }],
  '2xl': ['1.5rem', { lineHeight: '1.4' }],
  '3xl': ['1.875rem', { lineHeight: '1.3' }],
  '4xl': ['2.25rem', { lineHeight: '1.2' }],
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.02em',
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

export const boxShadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  focus: '0 0 0 2px #22C55E',
};

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
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const components = {
  button: {
    height: { sm: '32px', md: '40px', lg: '48px' },
    padding: { sm: '0 12px', md: '0 16px', lg: '0 24px' },
    fontSize: { sm: '0.75rem', md: '0.875rem', lg: '1rem' },
    gap: '8px',
    borderRadius: '0.375rem',
  },
  input: {
    height: '40px',
    padding: '0 12px',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    borderWidth: '1px',
  },
  card: {
    padding: '24px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
  },
  table: {
    cellPadding: '12px 16px',
    headerHeight: '40px',
    rowHeight: '48px',
    borderWidth: '1px',
  },
  sidebar: {
    width: { collapsed: '64px', expanded: '256px' },
    mobileWidth: '288px',
  },
  header: {
    height: '56px',
  },
};

export const iconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
};