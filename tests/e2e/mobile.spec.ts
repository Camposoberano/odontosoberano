import { test, expect } from '@playwright/test';

test.describe('Mobile — layout responsivo', () => {
  test('login responsivo no mobile', async ({ page }) => {
    await page.goto('auth');
    // Botão e campos visíveis sem scroll horizontal
    await expect(page.getByPlaceholder(/e-mail/i)).toBeInViewport();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeInViewport();

    // Sem overflow horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('anamnese pública abre sem login', async ({ page }) => {
    // Rota pública — deve carregar sem redirect para /auth
    await page.goto('anamnese/token-teste');
    await expect(page).not.toHaveURL(/auth/);
  });
});
