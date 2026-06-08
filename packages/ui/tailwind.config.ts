import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAF7F1',
          indigo: '#2E2860',
          'indigo-light': '#3D3580',
          gold: '#E0A943',
          'gold-light': '#EFC06A',
          text: '#1E1B2E',
          'text-secondary': '#8A8797',
          'dark-bg': '#17141F',
          'dark-surface': '#211E2D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}

export default config
