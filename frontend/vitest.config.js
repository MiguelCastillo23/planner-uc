import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'lcov', 'text'],
      exclude: [
        '**/node_modules/**',
        '**/tests/**',
        '**/cypress/**',
        '**/playwright-report/**',
        '**/*.config.*',
      ]
    }
  },
});
