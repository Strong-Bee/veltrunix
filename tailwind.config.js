/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        foreground: '#F8FAFC',
        card: '#1B2336',
        'card-foreground': '#F8FAFC',
        muted: '#272F42',
        'muted-foreground': '#94A3B8',
        border: '#475569',
        primary: '#1E293B',
        'on-primary': '#FFFFFF',
        secondary: '#334155',
        'on-secondary': '#FFFFFF',
        accent: '#22C55E',
        'on-accent': '#0F172A',
        destructive: '#EF4444',
        'on-destructive': '#000000',
        ring: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
