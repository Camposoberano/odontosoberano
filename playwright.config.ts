import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081/belem/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Desktop
    { name: 'Chrome',  use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Safari',  use: { ...devices['Desktop Safari'] } },  // WebKit
    { name: 'Edge',    use: { ...devices['Desktop Edge'] } },

    // Mobile
    { name: 'iPhone 14',      use: { ...devices['iPhone 14'] } },
    { name: 'Pixel 7',        use: { ...devices['Pixel 7'] } },
    { name: 'iPad Pro',       use: { ...devices['iPad Pro 11'] } },
  ],

  // Sobe o dev server automaticamente antes dos testes
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
