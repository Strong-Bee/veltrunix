// Tailwind Design Tokens - Plain JS version for Tailwind config
// Source of truth: src/design-tokens.ts (keep in sync)

export const colors = {
  background: '#0A0F18',
  foreground: '#E7EDF5',
  surface: {
    base: '#101925',
    elevated: '#141F2D',
    overlay: '#1A2938',
    border: '#263647',
  },
  primary: {
    base: '#55D6A0',
    hover: '#38BD87',
    active: '#26996C',
    muted: '#55D6A033',
    onPrimary: '#0A0F18',
  },
  secondary: {
    base: '#304356',
    hover: '#40566A',
    active: '#718397',
    onSecondary: '#E7EDF5',
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
    base: '#55D6A0',
    hover: '#38BD87',
    muted: '#55D6A033',
  },
  text: {
    primary: '#E7EDF5',
    secondary: '#9AABBA',
    muted: '#718397',
    inverse: '#0A0F18',
    link: '#55D6A0',
    linkHover: '#38BD87',
  },
  status: {
    installed: { bg: '#55D6A033', text: '#55D6A0', border: '#55D6A04D' },
    running: { bg: '#55D6A033', text: '#55D6A0', border: '#55D6A04D' },
    stopped: { bg: '#F59E0B33', text: '#F59E0B', border: '#F59E0B4D' },
    notFound: { bg: '#71839733', text: '#9AABBA', border: '#7183974D' },
    error: { bg: '#EF444433', text: '#EF4444', border: '#EF44444D' },
    active: { bg: '#55D6A033', text: '#55D6A0', border: '#55D6A04D' },
    inactive: { bg: '#71839733', text: '#9AABBA', border: '#7183974D' },
  },
  focus: {
    ring: '#55D6A0',
    offset: '#0A0F18',
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
  focus: '0 0 0 2px #55D6A0',
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