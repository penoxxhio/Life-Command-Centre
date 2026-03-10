/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core dark palette
        void: {
          50: '#e8eaf0',
          100: '#c5c9d6',
          200: '#9ea4ba',
          300: '#777d9e',
          400: '#596089',
          500: '#3b4374',
          600: '#353c6c',
          700: '#2d3361',
          800: '#252a57',
          900: '#171b44',
          950: '#0a0e1a',
        },
        // Neon cyan accent
        neon: {
          50: '#e0fcff',
          100: '#b3f7ff',
          200: '#80f1ff',
          300: '#4deaff',
          400: '#26e4ff',
          500: '#00d4ff',
          600: '#00a8cc',
          700: '#007d99',
          800: '#005266',
          900: '#002933',
        },
        // Purple accent
        nebula: {
          50: '#f0e6ff',
          100: '#d4b3ff',
          200: '#b880ff',
          300: '#9c4dff',
          400: '#8626ff',
          500: '#7000ff',
          600: '#5a00cc',
          700: '#430099',
          800: '#2d0066',
          900: '#160033',
        },
        // Amber/gold accent
        ember: {
          50: '#fff8e0',
          100: '#ffecb3',
          200: '#ffe080',
          300: '#ffd54d',
          400: '#ffca26',
          500: '#ffc000',
          600: '#cc9a00',
          700: '#997300',
          800: '#664d00',
          900: '#332600',
        },
        // Status colors
        hp: '#ff4d6a',
        mp: '#4d9fff',
        xp: '#ffc000',
        streak: '#ff7b26',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        glass: '16px',
        'glass-lg': '24px',
        'glass-xl': '32px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        neon: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(112, 0, 255, 0.3), 0 0 40px rgba(112, 0, 255, 0.1)',
        'neon-amber': '0 0 20px rgba(255, 192, 0, 0.3), 0 0 40px rgba(255, 192, 0, 0.1)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glass-border': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
        'neon-glow': 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(112, 0, 255, 0.15) 0%, transparent 70%)',
        'ember-glow': 'radial-gradient(ellipse at center, rgba(255, 192, 0, 0.15) 0%, transparent 70%)',
        'mesh-gradient': 'radial-gradient(at 20% 80%, rgba(0, 212, 255, 0.08) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(112, 0, 255, 0.08) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(255, 192, 0, 0.04) 0%, transparent 50%)',
      },
      backdropBlur: {
        glass: '16px',
        'glass-heavy': '24px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shimmer': 'shimmer 2s linear infinite',
        'creature-idle': 'creature-idle 3s ease-in-out infinite',
        'creature-bounce': 'creature-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'creature-sleep': 'creature-sleep 4s ease-in-out infinite',
        'xp-pop': 'xp-pop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ring-fill': 'ring-fill 1s ease-out forwards',
        'evolve-glow': 'evolve-glow 2s ease-in-out',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'creature-idle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-4px) rotate(-1deg)' },
          '75%': { transform: 'translateY(-2px) rotate(1deg)' },
        },
        'creature-bounce': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '40%': { transform: 'translateY(-20px) scale(1.1)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'creature-sleep': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(2px) scale(0.98)' },
        },
        'xp-pop': {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '0' },
          '50%': { transform: 'scale(1.3) translateY(-20px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(-30px)', opacity: '0' },
        },
        'ring-fill': {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--ring-offset)' },
        },
        'evolve-glow': {
          '0%': { boxShadow: '0 0 0 rgba(0, 212, 255, 0)', filter: 'brightness(1)' },
          '50%': { boxShadow: '0 0 60px rgba(0, 212, 255, 0.8), 0 0 120px rgba(112, 0, 255, 0.4)', filter: 'brightness(1.5)' },
          '100%': { boxShadow: '0 0 0 rgba(0, 212, 255, 0)', filter: 'brightness(1)' },
        },
      },
    },
  },
  plugins: [],
};
