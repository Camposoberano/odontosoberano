import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'tests', 'screenshots');

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

// Só roda nos 6 projetos do grid visual
test.skip(({ projectName }) =>
  !['iPhone', 'Android', 'Safari', 'Opera', 'Chrome', 'MacBook'].includes(projectName),
  'Apenas projetos do grid visual'
);

test('captura tela de login', async ({ page, projectName }) => {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(OUT_DIR, `${projectName}-login.png`),
    fullPage: false,
  });
});
