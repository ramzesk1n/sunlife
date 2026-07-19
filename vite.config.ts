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
        // Groups capture only matched modules; shared deps stay in their
        // natural chunks, so framer-motion/gsap are not pulled into the
        // critical path (unlike manualChunks, which drags deps along)
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              priority: 20,
            },
            {
              name: 'framer-motion',
              test: /node_modules[\\/]framer-motion[\\/]/,
              priority: 10,
            },
            {
              name: 'gsap',
              test: /node_modules[\\/]gsap[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
