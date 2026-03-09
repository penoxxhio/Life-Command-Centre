import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D1117',
        card: '#161B22',
        border: '#30363D',
        primary: '#5CB870',
        warning: '#D29922',
        alert: '#F85149',
        info: '#58A6FF',
        ai: '#A371F7',
        accent: '#2EA043',
        textPrimary: '#F0F6FC',
        textSecondary: '#8B949E',
        textMuted: '#484F58',
      },
    },
  },
  plugins: [],
};

export default config;
