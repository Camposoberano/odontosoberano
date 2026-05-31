import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081/belem/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 1,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
  },
  projects: [
    // Os 6 que o usuário quer ver lado a lado
    { name: 'iPhone',   use: { ...devices['iPhone 14'] } },
    { name: 'Android',  use: { ...devices['Pixel 7'] } },
    { name: 'Safari',   use: { ...devices['Desktop Safari'] } },
    { name: 'Opera',    use: { ...devices['Desktop Chrome'], userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0' } },
    { name: 'Chrome',   use: { ...devices['Desktop Chrome'] } },
    { name: 'MacBook',  use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },

    // Extra (smoke tests completos)
    { name: 'Firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'Edge',     use: { ...devices['Desktop Edge'] } },
  ],

  // Sobe o dev server automaticamente antes dos testes
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
