import nativewindPreset from 'nativewind/preset';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewindPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito'],
      },
      colors: {
        primary: {
          light: '#B8E986',
          DEFAULT: '#9FD356',
          dark: '#7AB82D',
        },
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.title-xl': {
          fontSize: '32px',
          lineHeight: '40px',
          fontWeight: '700',
        },
        '.title-lg': {
          fontSize: '24px',
          lineHeight: '32px',
          fontWeight: '700',
        },
        '.title-md': {
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: '600',
        },
        '.title-sm': {
          fontSize: '18px',
          lineHeight: '24px',
          fontWeight: '600',
        },
        '.title-xs': {
          fontSize: '16px',
          lineHeight: '22px',
          fontWeight: '600',
        },
      });
    },
  ],
};
