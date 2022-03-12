import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
    lib: 0,
  },
});

// npm run dev
