import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'tests', 'screenshots');
const GRID_PROJECTS = ['iPhone', 'Android', 'Safari', 'Opera', 'Chrome', 'MacBook'];

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test('captura tela de login', async ({ page }, testInfo) => {
  const projectName = testInfo.project.name;

  test.skip(!GRID_PROJECTS.includes(projectName), 'Apenas projetos do grid visual');

  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(OUT_DIR, `${projectName}-login.png`),
    fullPage: false,
  });
});
