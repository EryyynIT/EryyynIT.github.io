const { test, expect } = require('@playwright/test');
const pages = ['', 'work/', 'experience/', 'about/', 'resume/', 'contact/'];

for (const width of [320, 390, 768, 820, 1024, 1440]) {
  for (const colorScheme of ['light', 'dark']) {
    test(`${width}px ${colorScheme}: every language and route`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
      const page = await context.newPage();
      // Layout coverage uses a matching browser locale; redirect behavior has its own suite.
      await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => [location.pathname.startsWith('/ru/') ? 'ru-RU' : 'en-US'] }));
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173/')) errors.push('External request: ' + request.url()); });
      try {
        for (const prefix of ['/', '/ru/']) for (const route of pages) {
          const response = await page.goto(prefix + route);
          expect(response.status()).toBe(200);
          await page.evaluate(() => document.fonts.ready);
          await expect(page.locator('h1')).toHaveCount(1);
          await expect(page.locator('html')).toHaveAttribute('lang', prefix === '/' ? 'en' : 'ru');
          await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          const levels = await page.locator('main h1, main h2, main h3, main h4').evaluateAll(headings => headings.map(h => Number(h.tagName[1])));
          expect(levels.every((level, i) => i === 0 || level <= levels[i - 1] + 1)).toBe(true);
          if (route === 'resume/' && width > 820) {
            expect(await page.locator('.skills').evaluate(list => {
              const terms = [...list.querySelectorAll('dt')];
              return terms.every(term => {
                const next = term.nextElementSibling;
                return term.getBoundingClientRect().right < next.getBoundingClientRect().left && term.scrollWidth <= term.clientWidth;
              });
            })).toBe(true);
          }
          if (width <= 820) {
            await page.locator('#menu').click();
            await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'true');
            await expect(page.locator('#navigation a').first()).toBeFocused();
            await page.keyboard.press('Escape');
            await expect(page.locator('#menu')).toBeFocused();
            await expect(page.locator('#menu')).toHaveAttribute('aria-expanded', 'false');
          }
        }
        expect(errors).toEqual([]);
      } finally { await context.close(); }
    });
  }
}

test('preferences, route-aware language links, focus and print', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => [location.pathname.startsWith('/ru/') ? 'ru-RU' : 'en-US'] }));
  await page.goto('/ru/resume/?source=check#skills');
  await page.locator('#theme-toggle').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.locator('.language').click();
  await expect(page).toHaveURL(/\/resume\/\?source=check#skills$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-pressed', String(theme === 'dark'));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-contact')).toBeVisible();
  await expect(page.locator('.print-contact')).toContainText('barkalovmisha@gmail.com');
  await expect(page.locator('.print-contact')).toContainText('@eprintln');
  await expect(page.locator('.header')).toBeHidden();
  await page.goto('/ru/contact/');
  await expect(page.locator('.contact')).toBeVisible();
  await expect(page.locator('.contact')).toContainText('barkalovmisha@gmail.com');
  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior)).toBe('auto');
  await page.goto('/ru/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  expect(await page.locator('.skip').evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('content and mobile navigation survive disabled JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto('/ru/');
    await expect(page.locator('h1')).toContainText('пониманием продукта');
    await expect(page.locator('#navigation')).toBeVisible();
    await expect(page.locator('#navigation a')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test('theme storage failure does not disable navigation', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => ['ru-RU'] }));
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto('/ru/');
  await page.locator('#menu').click();
  await expect(page.locator('#navigation')).toBeVisible();
  await page.locator('#theme-toggle').click();
  await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-pressed', 'true');
});
