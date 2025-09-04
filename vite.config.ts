import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Production optimizations
  build: {
    target: 'es2015',
    minify: 'esbuild', // Use esbuild instead of terser (faster and built-in)
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          utils: ['clsx', 'tailwind-merge'],
        },
      },
    },
    // Enable gzip compression
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: mode === 'development',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
  },
  // Performance settings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}));
