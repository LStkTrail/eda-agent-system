import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pixel: {
          'bg-deep': '#0a0a0f',
          'bg-dark': '#111118',
          'bg-mid': '#1a1a2e',
          'bg-panel': '#16213e',
          green: '#00ff41',
          'green-dim': '#00b32c',
          blue: '#0ff0fc',
          'blue-dim': '#0a9aac',
          yellow: '#ffd700',
          'yellow-dim': '#b8960c',
          border: 'rgba(0, 255, 65, 0.4)',
          grid: 'rgba(0, 255, 65, 0.04)',
          text: '#e2e8f0',
          'text-dim': '#718096',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        'pixel-mono': ['VT323', 'monospace'],
      },
      boxShadow: {
        'pixel-glow': '0 0 10px rgba(0, 255, 65, 0.3), 0 0 30px rgba(0, 255, 65, 0.15)',
        'pixel-glow-strong': '0 0 15px rgba(0, 255, 65, 0.5), 0 0 40px rgba(0, 255, 65, 0.25)',
        'pixel-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
        'pixel-btn': '4px 4px 0px #00b32c',
        'pixel-btn-active': '2px 2px 0px #00b32c',
        'pixel-border-glow': '0 0 8px rgba(0, 255, 65, 0.2)',
      },
      animation: {
        'blink': 'blink 1s steps(1) infinite',
        'glow-pulse': 'glow-pulse 2s steps(2) infinite',
        'scanline': 'scanline 8s linear infinite',
        'pixel-float': 'pixel-float 6s steps(12) infinite',
        'pixel-slide-in': 'pixel-slide-in 0.3s steps(4) forwards',
        'pixel-fade-in': 'pixel-fade-in 0.4s steps(4) forwards',
        'loading-bar': 'loading-bar 1.2s steps(4) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' },
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100vh' },
        },
        'pixel-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '25%': { transform: 'translateY(-8px)' },
          '50%': { transform: 'translateY(-4px)' },
          '75%': { transform: 'translateY(-12px)' },
        },
        'pixel-slide-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pixel-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'loading-bar': {
          '0%': { width: '0%' },
          '25%': { width: '40%' },
          '50%': { width: '70%' },
          '75%': { width: '90%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
