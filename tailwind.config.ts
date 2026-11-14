import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#15191E', 700: '#2B323B', 500: '#5B6470', 300: '#A3AAB3', 200: '#D9DCE0', 100: '#ECEDEF' },
        canvas: '#F6F5F3',
        brand: { DEFAULT: '#D93A0B', 500: '#F2501A', 600: '#D93A0B', 700: '#B32F08', 50: '#FFF1EB' },
        ok: '#0F7B4F', warn: '#9A6700', bad: '#B42318',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      borderRadius: { DEFAULT: '6px', lg: '10px', xl: '16px' },
    },
  },
  plugins: [],
};
export default config;
