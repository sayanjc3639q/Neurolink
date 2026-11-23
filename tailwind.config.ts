import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        margin: 'var(--margin)',
        ink: 'var(--ink)',
        pencil: 'var(--pencil)',
        rule: 'var(--rule)',
        biro: 'var(--biro)',
        redline: 'var(--redline)',
        marker: 'var(--marker)',
        'marker-text': 'var(--marker-text)',
      },
      fontFamily: {
        serif: ['Literata', 'Georgia', 'serif'],
        sans: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        prose: '66ch',
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        full: '2px', // strictly no pills as requested
      },
    },
  },
  plugins: [typography],
} satisfies Config;