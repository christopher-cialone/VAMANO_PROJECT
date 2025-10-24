import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'frontend-e2e',
      testMatch: '**/vamano-e2e.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api-smoke',
      testMatch: '**/api-smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: '**/vamano-e2e.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: '**/vamano-e2e.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: [
    {
      command: 'yarn workspace frontend dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'yarn workspace backend dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
    },
  ],
});




