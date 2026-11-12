import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#F5EFFA',
          100: '#E6D8F1',
          200: '#CDB1E3',
          600: '#6C3995',
          800: '#4A2568',
        },
        teal: {
          50: '#E0F7F6',
          200: '#B3EBE9',
          500: '#00B9B4',
          700: '#007D7A',
        },
        ink: {
          DEFAULT: '#232323',
        },
        danger: {
          DEFAULT: '#B4414F',
          bg: '#FCE4E6',
        },
        warning: {
          DEFAULT: '#8A5A00',
          bg: '#FFF1CC',
        },
        success: {
          DEFAULT: '#1E6B3A',
          bg: '#E3F4E8',
        },
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        chip: '999px',
      },
      fontFamily: {
        quicksand: ['var(--font-quicksand)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
};

export default config;
