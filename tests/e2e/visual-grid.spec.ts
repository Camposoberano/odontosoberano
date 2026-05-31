import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'tests', 'screenshots');
const GRID_PROJECTS = ['iPhone', 'Android', 'Safari', 'Opera', 'Chrome', 'MacBook'];
const EMAIL = process.env.TEST_EMAIL || '';
const PASSWORD = process.env.TEST_PASSWORD || '';

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test('login', async ({ page }, testInfo) => {
  test.skip(!GRID_PROJECTS.includes(testInfo.project.name), 'Apenas grid visual');

  await page.goto('auth');
  await page.waitForLoadState('networkidle');
  // Aguarda elemento real — garante que React montou (crítico no WebKit/iPhone)
  await page.waitForSelector('input[type="email"], input[placeholder*="mail"], button', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUT_DIR, `${testInfo.project.name}-login.png`),
    fullPage: false,
  });
});

test('dashboard', async ({ page }, testInfo) => {
  test.skip(!GRID_PROJECTS.includes(testInfo.project.name), 'Apenas grid visual');
  test.skip(!EMAIL || !PASSWORD, 'TEST_EMAIL e TEST_PASSWORD nao definidos');

  await page.goto('auth');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder(/e-mail/i).fill(EMAIL);
  await page.getByPlaceholder(/senha/i).fill(PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 12000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(OUT_DIR, `${testInfo.project.name}-dashboard.png`),
    fullPage: false,
  });
});
