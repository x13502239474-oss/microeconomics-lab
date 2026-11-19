/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F2E9',
        surface: '#FFFCF5',
        ink: '#12263F',
        ink2: '#33475F',
        muted: '#6E7F93',
        line: '#DCD3C2',
        linesoft: '#E9E2D4',
        navy: '#16324F',
        navy2: '#2C4B6B',
        steel: '#7C93AB',
        copper: '#9C7A4A',
        copper2: '#C0A176',
        oxblood: '#8F3B31',
        moss: '#3F6B4F',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', 'STSong', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: {
        reading: '46rem',
      },
    },
  },
  plugins: [],
}
