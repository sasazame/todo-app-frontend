import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Priority colors
        'priority-low': {
          bg: 'var(--priority-low-bg)',
          text: 'var(--priority-low-text)',
        },
        'priority-medium': {
          bg: 'var(--priority-medium-bg)',
          text: 'var(--priority-medium-text)',
        },
        'priority-high': {
          bg: 'var(--priority-high-bg)',
          text: 'var(--priority-high-text)',
        },
        // Status colors
        'status-pending': {
          bg: 'var(--status-pending-bg)',
          text: 'var(--status-pending-text)',
        },
        'status-in-progress': {
          bg: 'var(--status-in-progress-bg)',
          text: 'var(--status-in-progress-text)',
        },
        'status-completed': {
          bg: 'var(--status-completed-bg)',
          text: 'var(--status-completed-text)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
    },
  },
  plugins: [],
}
export default config