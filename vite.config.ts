import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-misc';
          }
          if (id.includes('/src/core/studio/') || id.includes('PersonalCodeStudioModal')) {
            return 'studio-engine';
          }
          if (id.includes('/src/components/dashboard/AlgorithmCardThumbnail') || id.includes('/src/components/dashboard/dynamicThumbnails')) {
            return 'dashboard-thumbnails';
          }
          if (id.includes('/src/modules/graphs/')) return 'modules-graphs';
          if (id.includes('/src/modules/trees/')) return 'modules-trees';
          if (id.includes('/src/modules/dp/')) return 'modules-dp';
          if (id.includes('/src/modules/sorting/') || id.includes('/src/modules/searching/')) {
            return 'modules-sort-search';
          }
          if (id.includes('/src/modules/linkedList/') || id.includes('/src/modules/stack/') || id.includes('/src/modules/arrays/')) {
            return 'modules-structures';
          }
          if (id.includes('/src/modules/strings/') || id.includes('/src/modules/math/') || id.includes('/src/modules/geometry/') || id.includes('/src/modules/recursion/')) {
            return 'modules-algorithms';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
