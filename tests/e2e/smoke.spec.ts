import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_EMAIL || '';
const PASSWORD = process.env.TEST_PASSWORD || '';

test.describe('Smoke — páginas principais carregam', () => {
  test.beforeEach(async ({ page }) => {
    if (!EMAIL || !PASSWORD) test.skip();
    await page.goto('auth');
    await page.getByPlaceholder("seu@email.com").fill(EMAIL);
    await page.getByPlaceholder(/senha/i).fill(PASSWORD);
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('dashboard carrega', async ({ page }) => {
    await expect(page.getByText(/instituto belém/i).first()).toBeVisible();
  });

  test('lista de pacientes carrega', async ({ page }) => {
    await page.goto('patients');
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible({ timeout: 8000 });
  });

  test('agenda carrega', async ({ page }) => {
    await page.goto('appointments');
    await expect(page.getByRole('heading', { name: /agenda/i })).toBeVisible({ timeout: 8000 });
  });

  test('sem erros de console críticos', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('dashboard');
    await page.waitForTimeout(2000);
    const critical = errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('Non-Error')
    );
    expect(critical).toHaveLength(0);
  });
});
