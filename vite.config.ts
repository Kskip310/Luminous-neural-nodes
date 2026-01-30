import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Keeps the root at the base
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html', // Vite looks for index.html in the root
    },
  },
});
