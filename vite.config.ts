import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /<repo>/; Vercel (and local) serve from /.
const isStaticHost = process.env.GITHUB_PAGES !== 'false' && !process.env.VERCEL;

export default defineConfig({
  base: isStaticHost ? '/neural-code-platform/' : '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
