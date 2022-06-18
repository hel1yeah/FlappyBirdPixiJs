import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const path = require('path')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
    lib: 0,
    publicDir: 'https://hel1yeah.github.io/js/'
  },
});

// npm run dev
