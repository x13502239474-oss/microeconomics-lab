import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 相对 base，便于部署到 GitHub Pages 的子路径
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
})
