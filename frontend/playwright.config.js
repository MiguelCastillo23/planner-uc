import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  workers: 1, // Correr en serie para evitar conflictos en la BD en memoria
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'on',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node ../backend/run-e2e-server.js',
      url: 'http://localhost:3000/api/estudiantes',
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
