// Vitest configuration for physics engine testing
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
  // Use node environment to avoid browser URL polyfills in headless tests
  environment: 'node',

  // Setup test environment
  setupFiles: ['./src/tests/setup-tests.js'],

    // Test globals for easier testing
    globals: true,

    // Timeout for async operations (physics init, WebAssembly)
    testTimeout: 30000,

    // Pool configuration for proper WebAssembly support
    pool: 'threads',

    // Maximize threads for CPU-intensive tests
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2,
      },
    },

    // Coverage configuration
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.jsx',
        'src/App.jsx',
        'vite.config.js',
        'vitest.config.js',
        '**/*.test.js'  // Exclude test files from coverage
      ]
    }
  },

  // Optimize dependencies for faster testing
  optimizeDeps: {
    include: [
      '@react-three/rapier',
      'three'
    ]
  },

  // Define paths for imports
  resolve: {
    alias: {
      '@': '/src'
    }
  },

  // Server configuration for testing
  server: {
    headers: {
      // Ensure WebAssembly support
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  }
});
