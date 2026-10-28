/** @type {import('tailwindcss').Config} */
import {
  colors as tokenColors,
  spacing as tokenSpacing,
  fontFamily as tokenFontFamily,
  fontSize as tokenFontSize,
  fontWeight as tokenFontWeight,
  letterSpacing as tokenLetterSpacing,
  borderRadius as tokenBorderRadius,
  boxShadow as tokenBoxShadow,
  zIndex as tokenZIndex,
  breakpoints as tokenBreakpoints,
  components as tokenComponents,
} from './tailwind.tokens.js';

// Helper to convert object entries to Tailwind-compatible format
const objToTailwind = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = objToTailwind(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: tokenColors.background,
        foreground: tokenColors.foreground,
        border: tokenColors.surface.border,
        ring: tokenColors.focus.ring,
        card: tokenColors.surface.base,
        'card-foreground': tokenColors.foreground,
        surface: {
          base: tokenColors.surface.base,
          elevated: tokenColors.surface.elevated,
          overlay: tokenColors.surface.overlay,
          border: tokenColors.surface.border,
        },
        // Flat colors for bg-primary, text-primary, bg-primary/30, etc.
        primary: tokenColors.primary.base,
        'primary-hover': tokenColors.primary.hover,
        'primary-active': tokenColors.primary.active,
        'primary-muted': tokenColors.primary.muted,
        'on-primary': tokenColors.primary.onPrimary,
        secondary: tokenColors.secondary.base,
        'secondary-hover': tokenColors.secondary.hover,
        'secondary-active': tokenColors.secondary.active,
        'on-secondary': tokenColors.secondary.onSecondary,
        destructive: tokenColors.destructive.base,
        'destructive-hover': tokenColors.destructive.hover,
        'destructive-active': tokenColors.destructive.active,
        'destructive-muted': tokenColors.destructive.muted,
        'on-destructive': tokenColors.destructive.onDestructive,
        warning: tokenColors.warning.base,
        'warning-hover': tokenColors.warning.hover,
        'warning-muted': tokenColors.warning.muted,
        info: tokenColors.info.base,
        'info-hover': tokenColors.info.hover,
        'info-muted': tokenColors.info.muted,
        success: tokenColors.success.base,
        'success-hover': tokenColors.success.hover,
        'success-muted': tokenColors.success.muted,
        text: {
          primary: tokenColors.text.primary,
          secondary: tokenColors.text.secondary,
          muted: tokenColors.text.muted,
          inverse: tokenColors.text.inverse,
          link: tokenColors.text.link,
          linkHover: tokenColors.text.linkHover,
        },
        status: tokenColors.status,
        focus: tokenColors.focus,
      },
      spacing: tokenSpacing,
      fontFamily: tokenFontFamily,
      fontSize: Object.fromEntries(
        Object.entries(tokenFontSize).map(([key, [size, lineHeight]]) => [
          key,
          [size, lineHeight],
        ])
      ),
      fontWeight: tokenFontWeight,
      letterSpacing: tokenLetterSpacing,
      borderRadius: tokenBorderRadius,
      boxShadow: tokenBoxShadow,
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: tokenZIndex,
      screens: tokenBreakpoints,
      height: {
        'button-sm': tokenComponents.button.height.sm,
        'button-md': tokenComponents.button.height.md,
        'button-lg': tokenComponents.button.height.lg,
        'input': tokenComponents.input.height,
        'header': tokenComponents.header.height,
        'sidebar-collapsed': tokenComponents.sidebar.width.collapsed,
        'sidebar-expanded': tokenComponents.sidebar.width.expanded,
        'sidebar-mobile': tokenComponents.sidebar.mobileWidth,
      },
      width: {
        'sidebar-collapsed': tokenComponents.sidebar.width.collapsed,
        'sidebar-expanded': tokenComponents.sidebar.width.expanded,
        'sidebar-mobile': tokenComponents.sidebar.mobileWidth,
      },
      maxWidth: {
        'content': '1200px',
        'content-narrow': '800px',
        'form': '560px',
      },
      minWidth: {
        'touch-target': '44px',
      },
      minHeight: {
        'touch-target': '44px',
      },
      gap: tokenSpacing,
      padding: tokenSpacing,
      margin: tokenSpacing,
    },
  },
  plugins: [],
};