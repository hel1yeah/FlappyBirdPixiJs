import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1600,
    assetsInlineLimit: 0,
    lib: 0,
  },
});

// npm run dev
