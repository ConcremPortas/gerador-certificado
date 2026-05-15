/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark forest green — Concrem primary brand
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          hover: 'hsl(142, 93%, 12%)',
          foreground: '#ffffff',
        },
        // Medium green — interactive / secondary brand
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: '#ffffff',
        },
        // Light emerald — accent / focus rings
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--primary) / <alpha-value>)',
        },
        // Dourado da logo premium
        gold: {
          DEFAULT: '#B8960C',
          light: '#D4AF37',
        },
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        status: {
          success: 'hsl(var(--secondary) / <alpha-value>)',
          warning: 'hsl(27, 90%, 65%)',
          danger: 'hsl(var(--status-danger) / <alpha-value>)',
          info: 'hsl(204, 71%, 57%)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.05)',
        primary: '0 4px 14px rgba(2, 48, 12, 0.22)',
      },
    },
  },
  plugins: [],
}
