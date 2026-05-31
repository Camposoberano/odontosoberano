import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('exibe tela de login', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /instituto belém/i })).toBeVisible();
    await expect(page.getByPlaceholder(/e-mail/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible();
  });

  test('erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/auth');
    await page.getByPlaceholder(/e-mail/i).fill('invalido@teste.com');
    await page.getByPlaceholder(/senha/i).fill('senhaerrada');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8000 });
  });

  test('redireciona para /auth sem login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth/);
  });
});
