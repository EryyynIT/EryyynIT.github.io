const { test, expect } = require('@playwright/test');
const routes = ['', 'work/', 'experience/', 'about/', 'resume/', 'contact/'];

async function preferences(page, options = {}) {
  await page.addInitScript(({ languages, language, saved, session, blocked, invalidLanguages }) => {
    Object.defineProperty(navigator, 'languages', { get: () => invalidLanguages ? undefined : languages });
    Object.defineProperty(navigator, 'language', { get: () => language });
    for (const storage of blocked) Object.defineProperty(window, storage, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    // Seed once per tab so a manual switch is allowed to replace the test preference.
    if (saved !== undefined && !sessionStorage.getItem('seeded')) {
      localStorage.setItem('language', saved); sessionStorage.setItem('seeded', '1');
    }
    if (session !== undefined && !window.__sessionSeeded) {
      if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('language', session); sessionStorage.setItem('seeded', '1'); }
    }
  }, { languages: options.languages === undefined ? ['en-US'] : options.languages, language: options.language || 'en-US', saved: options.saved, session: options.session, blocked: options.blocked || [], invalidLanguages: options.invalidLanguages || false });
}
function bounded(page) {
  const requests = [];
  page.on('request', request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) requests.push(request.url()); });
  return requests;
}

for (const route of routes) {
  for (const target of ['ru', 'en']) {
    test(`automatic ${target}: ${route || 'home'} preserves page/query/hash`, async ({ page }) => {
      await preferences(page, { languages: [target + (target === 'ru' ? '-RU' : '-GB')] });
      const requests = bounded(page);
      const start = (target === 'ru' ? '/' : '/ru/') + route + '?source=a%20b&x=1#contact';
      const destination = (target === 'ru' ? '/ru/' : '/') + route + '?source=a%20b&x=1#contact';
      await page.goto(start);
      await expect(page).toHaveURL('http://127.0.0.1:4173' + destination);
      await expect(page.locator('html')).toHaveAttribute('lang', target);
      expect(requests.length).toBeLessThanOrEqual(2);
      expect(await page.evaluate(() => localStorage.getItem('language'))).toBeNull();
    });
  }
}

for (const [saved, browser] of [['ru', 'en-US'], ['en', 'ru-RU']]) {
  test(`saved ${saved} overrides ${browser}`, async ({ page }) => {
    await preferences(page, { saved, languages: [browser] });
    await page.goto(saved === 'ru' ? '/about/' : '/ru/about/');
    await expect(page).toHaveURL(saved === 'ru' ? /\/ru\/about\/$/ : /(?<!ru)\/about\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', saved);
  });
}

for (const [languages, expected] of [
  [['fr-FR', 'en-GB', 'ru-RU'], 'en'],
  [['de-DE', 'ru-RU', 'en-US'], 'ru'],
  [['EN-us', 'ru-RU'], 'en'],
  [['fr-FR', 'de-DE'], 'en']
]) {
  test(`ordered browser languages ${languages.join(',')}`, async ({ page }) => {
    await preferences(page, { languages, language: 'ru-RU' });
    await page.goto('/ru/work/');
    await expect(page.locator('html')).toHaveAttribute('lang', expected);
    await expect(page).toHaveURL('http://127.0.0.1:4173' + (expected === 'ru' ? '/ru/work/' : '/work/'));
  });
}
for (const invalidLanguages of [false, true]) {
  test(`navigator.language fallback (${invalidLanguages ? 'unavailable' : 'empty'} list)`, async ({ page }) => {
    await preferences(page, { languages: [], invalidLanguages, language: 'ru-RU' });
    await page.goto('/');
    await expect(page).toHaveURL(/\/ru\/$/);
  });
}

test('valid local preference has priority over an older session preference', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'en');
    sessionStorage.setItem('language', 'ru');
    Object.defineProperty(navigator, 'languages', { get: () => ['ru-RU'] });
  });
  await page.goto('/ru/contact/');
  await expect(page).toHaveURL('http://127.0.0.1:4173/contact/');
});

test('old resume files return 404 while current resume pages remain available', async ({ request }) => {
  for (const name of ['MichaelBarkalov_CV.pdf', 'MikhailBarkalov_CV_RU.pdf']) {
    expect((await request.get('/assets/cv/' + name)).status()).toBe(404);
  }
  for (const route of ['/resume/', '/ru/resume/']) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('id="print"');
  }
});

test('manual choice persists, preserves URL state and wins on later visits', async ({ page }) => {
  await preferences(page, { languages: ['ru-RU'] });
  await page.goto('/ru/resume/?source=a%20b#skills');
  await page.locator('.language').click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/resume/?source=a%20b#skills');
  expect(await page.evaluate(() => localStorage.getItem('language'))).toBe('en');
  await page.goto('/ru/experience/');
  await expect(page).toHaveURL('http://127.0.0.1:4173/experience/');
});

test('session choice works when localStorage is unavailable', async ({ page }) => {
  await preferences(page, { languages: ['en-US'], blocked: ['localStorage'] });
  await page.goto('/about/?x=1#contact');
  await page.locator('.language').click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/ru/about/?x=1#contact');
  expect(await page.evaluate(() => sessionStorage.getItem('language'))).toBe('ru');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.goto('/experience/');
  await expect(page).toHaveURL('http://127.0.0.1:4173/ru/experience/');
});

test('both storage APIs blocked: one-shot choice is cleaned and does not bounce', async ({ page }) => {
  await preferences(page, { languages: ['en-US'], blocked: ['localStorage', 'sessionStorage'] });
  const requests = bounded(page);
  await page.goto('/resume/?q=hello%20world&x=%2f#skills');
  await page.locator('.language').click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/ru/resume/?q=hello%20world&x=%2f#skills');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  expect(await page.evaluate(() => history.state.__eryyynit_language)).toBe('ru');
  await page.reload();
  await expect(page).toHaveURL('http://127.0.0.1:4173/ru/resume/?q=hello%20world&x=%2f#skills');
  expect(requests.length).toBeLessThanOrEqual(3);
  await page.locator('.language').click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/resume/?q=hello%20world&x=%2f#skills');
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/ru/resume/?q=hello%20world&x=%2f#skills');
  expect(requests.length).toBeLessThanOrEqual(5);
});

test('automatic redirect replaces history rather than adding a language loop', async ({ page }) => {
  await preferences(page, { languages: ['ru-RU'] });
  await page.goto('/ru/contact/');
  await page.goto('/about/');
  await expect(page).toHaveURL(/\/ru\/about\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/ru\/contact\/$/);
});

test('invalid stored choice is ignored and automatic detection never saves it', async ({ page }) => {
  await preferences(page, { saved: 'fr', languages: ['ru-RU'] });
  await page.goto('/');
  await expect(page).toHaveURL(/\/ru\/$/);
  expect(await page.evaluate(() => localStorage.getItem('language'))).toBe('fr');
});

test('a saved choice overrides a stale one-shot history entry', async ({ page }) => {
  await preferences(page, { languages: ['ru-RU'], saved: 'en' });
  await page.addInitScript(() => history.replaceState({ __eryyynit_language: 'ru' }, ''));
  await page.goto('/ru/about/#contact');
  await expect(page).toHaveURL('http://127.0.0.1:4173/about/#contact');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('localStorage write failure falls back to the session', async ({ page }) => {
  await preferences(page, { languages: ['en-US'] });
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage) throw new DOMException('Full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/');
  await page.locator('.language').click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/ru/');
  expect(await page.evaluate(() => sessionStorage.getItem('language'))).toBe('ru');
  expect(await page.evaluate(() => localStorage.getItem('language'))).toBeNull();
});

for (const sessionWritable of [true, false]) {
  test(`stale readable local choice cannot undo a manual switch (session writable=${sessionWritable})`, async ({ page }) => {
    await page.addInitScript(({ sessionWritable }) => {
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US'] });
      const original = Storage.prototype.setItem;
      if (!localStorage.getItem('language')) original.call(localStorage, 'language', 'en');
      Storage.prototype.setItem = function (key, value) {
        if (this === localStorage || !sessionWritable) throw new DOMException('Full', 'QuotaExceededError');
        return original.call(this, key, value);
      };
    }, { sessionWritable });
    await page.goto('/about/?q=1#contact');
    await page.locator('.language').click();
    await expect(page).toHaveURL('http://127.0.0.1:4173/ru/about/?q=1#contact');
    await page.reload();
    await expect(page).toHaveURL('http://127.0.0.1:4173/ru/about/?q=1#contact');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });
}

test('all language routes remain static with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, locale: 'en-US' });
  try {
    const page = await context.newPage();
    for (const prefix of ['/', '/ru/']) for (const route of routes) {
      await page.goto(prefix + route);
      await expect(page).toHaveURL('http://127.0.0.1:4173' + prefix + route);
      await expect(page.locator('html')).toHaveAttribute('lang', prefix === '/ru/' ? 'ru' : 'en');
      await expect(page.locator('h1')).not.toBeEmpty();
      await expect(page.locator('.language')).toHaveAttribute('href', (prefix === '/' ? '/ru/' : '/') + route);
    }
  } finally { await context.close(); }
});

for (const lang of ['en', 'ru']) {
  test(`${lang}: contact links, hero positioning and theme toggle semantics`, async ({ page }) => {
    await preferences(page, { languages: [lang] });
    await page.setViewportSize({ width: 390, height: 850 });
    await page.goto(lang === 'ru' ? '/ru/' : '/');
    await expect(page.locator('.hero .intro')).toContainText('Go');
    await expect(page.locator('.hero .intro')).toContainText('Python');
    for (const href of ['mailto:barkalovmisha@gmail.com', 'https://t.me/eprintln']) {
      const link = page.locator('.contact .actions a[href="' + href + '"]');
      await expect(link).toBeVisible();
      await link.scrollIntoViewIfNeeded();
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    const theme = page.locator('#theme-toggle');
    const label = lang === 'ru' ? 'Тема: тёмный режим' : 'Theme: dark mode';
    await expect(theme).toHaveAccessibleName(label);
    await expect(theme).toHaveAttribute('title', label);
    const pressed = await theme.getAttribute('aria-pressed');
    await theme.click();
    await expect(theme).toHaveAttribute('aria-pressed', String(pressed !== 'true'));
    await expect(theme).toHaveAccessibleName(label);
    await expect(theme).toHaveAttribute('title', label);
  });
}
