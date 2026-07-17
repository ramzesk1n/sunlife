import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'exclude-content',
      writeBundle() {
        // Remove content/ from dist to prevent overwriting server data
        const contentDir = path.resolve('dist/content');
        if (fs.existsSync(contentDir)) {
          fs.rmSync(contentDir, { recursive: true, force: true });
          console.log('Excluded dist/content from build');
        }
      },
    },
  ],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false, // Disabled for production (saves ~1.2MB per chunk)
    cssMinify: 'lightningcss',
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          // Framer Motion - separate from GSAP
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // GSAP - separate chunk
          if (id.includes('node_modules/gsap')) {
            return 'gsap';
          }
          return undefined;
        },
      },
    },
  },
});
