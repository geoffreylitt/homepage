/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloomberg': {
          'bg': '#000000',
          'panel': '#1a1a1a',
          'border': '#ff6900',
          'orange': '#ff6900',
          'orange-bright': '#ff8533',
          'orange-dim': '#cc5200',
          'text': '#ffffff',
          'text-dim': '#cccccc',
          'muted': '#666666',
          'green': '#00ff00',
          'red': '#ff0000',
          'blue': '#0066ff'
        }
      },
      fontFamily: {
        'terminal': ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace']
      },
      fontSize: {
        'terminal': ['13px', '16px']
      }
    },
  },
  plugins: [],
}