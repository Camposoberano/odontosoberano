const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
  try {
    await page.goto('http://localhost:8080/orto/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('PAGE_TITLE:', await page.title());
    await page.screenshot({ path: 'screenshot_diagnostic.png' });
  } catch (e) {
    console.log('CRAWL_ERROR:', e.message);
  }
  await browser.close();
})();
