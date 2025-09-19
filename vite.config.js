import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: './',
  root: path.resolve('./renderer'),
  plugins: [vue()],
  build: {
    outDir: path.resolve('./dist'),
    emptyOutDir: true
  }
})
