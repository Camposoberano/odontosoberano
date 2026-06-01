import { test, expect } from '@playwright/test';

// Verifica que as páginas PDF carregam e não há erros de console críticos
// Testa o que é acessível sem login (login page) e com login (via env credentials)

const EMAIL = process.env.TEST_EMAIL || '';
const PASSWORD = process.env.TEST_PASSWORD || '';
const BASE = 'http://localhost:8081/inst.belem/';

test.describe('PDF Templates — verificação visual', () => {
  test('login page carrega sem erros', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/pdf-verify-login.png', fullPage: true });
    const critical = errors.filter(e => !e.includes('ResizeObserver') && !e.includes('Non-Error'));
    expect(critical).toHaveLength(0);
  });

  test.describe('com auth', () => {
    test.beforeEach(async ({ page }) => {
      if (!EMAIL || !PASSWORD) test.skip();
      await page.goto(BASE);
      await page.getByPlaceholder("seu@email.com").fill(EMAIL);
      await page.getByPlaceholder(/senha/i).fill(PASSWORD);
      await page.getByRole('button', { name: /entrar/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    });

    test('orçamento PDF — tabela Qtd/Valor Unit/Total sem NaN', async ({ page }) => {
      // Navega para lista de orçamentos
      await page.goto(BASE + 'orcamentos');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/pdf-verify-orcamentos.png', fullPage: true });

      // Abre primeiro orçamento se houver
      const firstLink = page.locator('table tbody tr').first();
      if (await firstLink.isVisible()) {
        await firstLink.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'tests/screenshots/pdf-verify-orcamento-detalhe.png', fullPage: true });

        // Verifica que o template está no DOM (id orcamento-pdf)
        const template = page.locator('#orcamento-pdf');
        if (await template.isVisible()) {
          // Check no NaN in rendered text
          const text = await template.textContent();
          expect(text).not.toContain('NaN');
          expect(text).toContain('Procedimento');
          expect(text).toContain('Qtd');
          expect(text).toContain('Valor Unit.');
          expect(text).toContain('Total');
        }
      }
    });

    test('documento modal — contrato com tabela de procedimentos', async ({ page }) => {
      // Navega para um paciente
      await page.goto(BASE + 'patients');
      await page.waitForTimeout(2000);

      const firstPatient = page.locator('table tbody tr').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.click();
        await page.waitForTimeout(1500);

        // Vai para aba documentos
        const docTab = page.getByRole('tab', { name: /documentos/i });
        if (await docTab.isVisible()) {
          await docTab.click();
          await page.waitForTimeout(1000);

          // Clica em gerar documento
          const gerarBtn = page.getByRole('button', { name: /gerar documento/i });
          if (await gerarBtn.isVisible()) {
            await gerarBtn.click();
            await page.waitForTimeout(1000);

            // Seleciona contrato
            const contratoOpt = page.getByRole('option', { name: /contrato/i });
            if (await contratoOpt.isVisible()) {
              await contratoOpt.click();
              await page.waitForTimeout(1500);
              await page.screenshot({ path: 'tests/screenshots/pdf-verify-contrato-modal.png', fullPage: true });

              // Verifica template do contrato
              const template = page.locator('#documento-pdf');
              if (await template.isVisible()) {
                const text = await template.textContent();
                expect(text).not.toContain('NaN');
              }
            }
          }
        }
      }
    });

    test('atestado — DATA_HOJE e HORA_ATUAL não são fallback', async ({ page }) => {
      await page.goto(BASE + 'patients');
      await page.waitForTimeout(2000);

      const firstPatient = page.locator('table tbody tr').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.click();
        await page.waitForTimeout(1500);

        const docTab = page.getByRole('tab', { name: /documentos/i });
        if (await docTab.isVisible()) {
          await docTab.click();
          const gerarBtn = page.getByRole('button', { name: /gerar documento/i });
          if (await gerarBtn.isVisible()) {
            await gerarBtn.click();
            await page.waitForTimeout(1000);

            const atestadoOpt = page.getByRole('option', { name: /atestado/i });
            if (await atestadoOpt.isVisible()) {
              await atestadoOpt.click();
              await page.waitForTimeout(1500);
              await page.screenshot({ path: 'tests/screenshots/pdf-verify-atestado.png', fullPage: true });

              const template = page.locator('#documento-pdf');
              if (await template.isVisible()) {
                const text = await template.textContent() ?? '';
                // Must NOT show fallback placeholders
                expect(text).not.toContain('___/___/______');
                expect(text).not.toContain('___:___');
              }
            }
          }
        }
      }
    });

    test('assinatura height 36px em DocumentoBase', async ({ page }) => {
      // Verifica via CSS que a assinatura tem height 36px
      await page.goto(BASE + 'patients');
      await page.waitForTimeout(2000);

      const firstPatient = page.locator('table tbody tr').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.click();
        await page.waitForTimeout(1500);

        const docTab = page.getByRole('tab', { name: /documentos/i });
        if (await docTab.isVisible()) {
          await docTab.click();
          const gerarBtn = page.getByRole('button', { name: /gerar documento/i });
          if (await gerarBtn.isVisible()) {
            await gerarBtn.click();
            await page.waitForTimeout(1000);

            // Abre qualquer tipo de documento que usa DocumentoBase (anamnese)
            const anamneseOpt = page.getByRole('option', { name: /anamnese padrão/i });
            if (await anamneseOpt.isVisible()) {
              await anamneseOpt.click();
              await page.waitForTimeout(1500);

              const template = page.locator('#documento-pdf');
              if (await template.isVisible()) {
                // Verifica que há um elemento de assinatura com height 36px
                const sigHeight = await template.evaluate((el) => {
                  const sigs = el.querySelectorAll('[style*="border-bottom"]');
                  for (const sig of sigs) {
                    const h = (sig as HTMLElement).style.height;
                    if (h) return h;
                  }
                  return 'not found';
                });
                console.log('Signature height:', sigHeight);
                expect(sigHeight).toBe('36px');
              }
            }
          }
        }
      }
    });
  });
});
