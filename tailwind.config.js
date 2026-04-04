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
    function ({ addComponents, addUtilities }) {
      // React Native cannot auto-select font weight variants from a single fontFamily.
      // fontWeight: '700' + fontFamily: 'Nunito' stays Regular.
      // Override Tailwind's weight utilities to set the correct named font file instead.
      addUtilities({
        '.font-light': { fontFamily: 'Nunito-Light' },
        '.font-normal': { fontFamily: 'Nunito' },
        '.font-medium': { fontFamily: 'Nunito-Medium' },
        '.font-semibold': { fontFamily: 'Nunito-SemiBold' },
        '.font-bold': { fontFamily: 'Nunito-Bold' },
        '.font-extrabold': { fontFamily: 'Nunito-ExtraBold' },
      });

      addComponents({
        '.title-xl': {
          fontSize: '32px',
          lineHeight: '40px',
          fontFamily: 'Nunito-Bold',
        },
        '.title-lg': {
          fontSize: '24px',
          lineHeight: '32px',
          fontFamily: 'Nunito-Bold',
        },
        '.title-md': {
          fontSize: '20px',
          lineHeight: '28px',
          fontFamily: 'Nunito-SemiBold',
        },
        '.title-sm': {
          fontSize: '18px',
          lineHeight: '24px',
          fontFamily: 'Nunito-SemiBold',
        },
        '.title-xs': {
          fontSize: '16px',
          lineHeight: '22px',
          fontFamily: 'Nunito-SemiBold',
        },
      });
    },
  ],
};
