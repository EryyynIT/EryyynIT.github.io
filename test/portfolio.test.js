/*
   Portfolio acceptance test for the generated static site.

   The site is built by scripts/generate-site.js from data/portfolio-content.js.
   This test reads the twelve generated HTML files directly — no browser, no
   JavaScript execution, no third-party dependencies — and verifies the public
   contract of the new site:

     - all twelve routes exist after the build;
     - every route has the right html lang and exactly one h1;
     - canonical, hreflang and the language switch are correct;
     - navigation, contact details and the shared footer are present;
     - legacy game assets, legacy CV PDFs and the confidential project's
       industry are not mentioned;
     - current ADNova dates and Ozon ORD are present;
     - the same two projects are rendered in EN and RU;
     - every local href/src points at a real file in the static site.
*/
'use strict';

const fs = require('fs');
const path = require('path');
const content = require('../data/portfolio-content.js');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://eryyynit.github.io';
const LANGS = ['en', 'ru'];
const PAGES = ['home', 'work', 'experience', 'about', 'resume', 'contact'];

const CURRENT_DATES = {
  en: ['December 2025 — April 2026', 'November 2023 — December 2025'],
  ru: ['Декабрь 2025 — апрель 2026', 'Ноябрь 2023 — декабрь 2025']
};

const PROJECT_NAMES = [
  'Async Payment Processing Service',
  'queue'
];

const PROJECT_URLS = [
  'https://github.com/EryyynIT/async-payment-processing-service',
  'https://github.com/EryyynIT/queue'
];

const CONTACT_HREFS = [
  'mailto:barkalovmisha@gmail.com',
  'https://t.me/eprintln',
  'https://github.com/EryyynIT'
];

let total = 0;
const failures = [];

function check(scope, name, ok, detail) {
  total += 1;
  if (!ok) {
    failures.push({ scope, name, detail });
  }
}

function eq(scope, name, actual, expected) {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  check(scope, name, same, same ? null : { actual, expected });
}

function pageUrl(lang, page) {
  return (lang === 'ru' ? '/ru/' : '/') + (page === 'home' ? '' : page + '/');
}

function fileOf(route) {
  return path.join(ROOT, route.replace(/^\//, ''), 'index.html');
}

const ROUTES = [];
for (const lang of LANGS) {
  for (const page of PAGES) {
    ROUTES.push({ lang, page, route: pageUrl(lang, page) });
  }
}

/* --- Minimal HTML helpers (no dependencies) ---------------------------- */

function decodeEntities(value) {
  return String(value)
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function textOf(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(attrs, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp('(?:^|\\s)' + escaped + '\\s*=\\s*"([^"]*)"', 'i').exec(attrs);
  return match ? decodeEntities(match[1]) : null;
}

function tagsOf(html, tagName) {
  const tags = [];
  const re = new RegExp('<' + tagName + '\\b([^>]*)>', 'gi');
  let match;
  while ((match = re.exec(html)) !== null) {
    tags.push({ attrs: match[1], raw: match[0] });
  }
  return tags;
}

function anchorsOf(html) {
  const anchors = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    anchors.push({
      attrs: match[1],
      href: attr(match[1], 'href'),
      class: attr(match[1], 'class'),
      lang: attr(match[1], 'lang'),
      hreflang: attr(match[1], 'hreflang'),
      ariaCurrent: attr(match[1], 'aria-current'),
      text: textOf(match[2])
    });
  }
  return anchors;
}

function navBlock(html) {
  const match = /<nav\b([^>]*)>([\s\S]*?)<\/nav>/i.exec(html);
  return match ? { attrs: match[1], inner: match[2], anchors: anchorsOf(match[2]) } : null;
}

function contactBlock(html) {
  const match = /<div class="contact-links">([\s\S]*?)<\/div>/.exec(html);
  return match ? anchorsOf(match[1]) : null;
}

function projectRows(html) {
  return html.split('<article class="project-row">').slice(1).map((part) => {
    // Home uses h3 for project cards; the dedicated work page promotes them
    // to h2 so the page keeps exactly one h1.
    const nameMatch = /<h([23])>([\s\S]*?)<\/h\1>/.exec(part);
    const urlMatch = /href="(https:\/\/github\.com\/EryyynIT\/[^"]+)"/.exec(part);
    const stack = [...part.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => textOf(m[1]));
    return {
      name: nameMatch ? textOf(nameMatch[2]) : null,
      url: urlMatch ? decodeEntities(urlMatch[1]) : null,
      stack
    };
  });
}

/* Resolve a link found on a generated page to a file in the static site.
   Returns null for external links and fragments. */
function localFile(ref, pageFile) {
  if (!ref) return null;
  if (ref.startsWith('#')) return null;

  let value = ref;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (scheme) {
    if (value.toLowerCase() === BASE.toLowerCase()) {
      value = '/';
    } else if (value.toLowerCase().startsWith(BASE.toLowerCase() + '/')) {
      value = value.slice(BASE.length);
    } else {
      return null;
    }
  }

  value = value.split('#')[0].split('?')[0];
  if (!value) return null;

  try {
    value = decodeURIComponent(value);
  } catch (error) {
    // Leave malformed encodings as-is; existence check below will report it.
  }

  let target = value.startsWith('/')
    ? path.join(ROOT, value)
    : path.resolve(path.dirname(pageFile), value);

  if (value.endsWith('/') || !path.extname(target)) {
    target = path.join(target, 'index.html');
  }

  return target;
}

function readSitemapLocs(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1]));
}

/* --- Build and route files --------------------------------------------- */

check('build', 'expected number of routes', ROUTES.length === 12, ROUTES.length);

const htmlByRoute = new Map();
for (const route of ROUTES) {
  const file = fileOf(route.route);
  let exists = false;
  try {
    exists = fs.statSync(file).isFile();
  } catch (error) {
    exists = false;
  }
  check(route.route, 'generated route file exists', exists, file);
  if (exists) {
    htmlByRoute.set(route.route, fs.readFileSync(file, 'utf8'));
  }
}

check(
  'build',
  'all twelve pages were generated',
  htmlByRoute.size === ROUTES.length,
  { found: htmlByRoute.size, expected: ROUTES.length }
);

const sitemapFile = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapFile)) {
  const locs = readSitemapLocs(sitemapFile);
  eq(
    'sitemap',
    'sitemap lists every public route',
    [...new Set(locs)].sort(),
    ROUTES.map((route) => BASE + route.route).sort()
  );
  check('sitemap', 'sitemap has no game route', !locs.some((loc) => /\/game\/?$/i.test(loc)));
} else {
  check('sitemap', 'sitemap.xml exists', false);
}

const ruSitemapFile = path.join(ROOT, 'ru', 'sitemap.xml');
if (fs.existsSync(ruSitemapFile)) {
  eq(
    'sitemap',
    'Russian sitemap lists the six Russian routes',
    [...new Set(readSitemapLocs(ruSitemapFile))].sort(),
    ROUTES.filter((route) => route.lang === 'ru')
      .map((route) => BASE + route.route)
      .sort()
  );
} else {
  check('sitemap', 'ru/sitemap.xml exists', false);
}

/* --- Content-level checks shared by both languages --------------------- */

for (const lang of LANGS) {
  const c = content[lang];
  eq('content', `${lang}: two projects`, c.projects.length, 2);
  eq(
    'content',
    `${lang}: project names are current`,
    c.projects.map((project) => project.name),
    PROJECT_NAMES
  );
  eq(
    'content',
    `${lang}: project repositories are current`,
    c.projects.map((project) => project.url),
    PROJECT_URLS
  );
  eq(
    'content',
    `${lang}: ADNova dates are current`,
    c.jobs[0].dates,
    CURRENT_DATES[lang][0]
  );
  eq(
    'content',
    `${lang}: confidential platform dates are current`,
    c.jobs[1].dates,
    CURRENT_DATES[lang][1]
  );
}

eq(
  'content',
  'EN and RU project names match',
  content.en.projects.map((project) => project.name),
  content.ru.projects.map((project) => project.name)
);
eq(
  'content',
  'EN and RU project repositories match',
  content.en.projects.map((project) => project.url),
  content.ru.projects.map((project) => project.url)
);
eq(
  'content',
  'EN and RU project stacks match',
  content.en.projects.map((project) => project.stack),
  content.ru.projects.map((project) => project.stack)
);
eq(
  'content',
  'EN and RU nav has the same routes',
  Object.keys(content.en.nav),
  Object.keys(content.ru.nav)
);

/* --- Per-page checks --------------------------------------------------- */

for (const { lang, page, route } of ROUTES) {
  const html = htmlByRoute.get(route);
  if (!html) continue;

  const c = content[lang];
  const isRu = lang === 'ru';
  const otherLang = isRu ? 'en' : 'ru';
  const expectedTitle = page === 'home' ? c.hero.title : c[page].title;

  /* Document basics */
  const htmlTags = tagsOf(html, 'html');
  check(route, 'single html element', htmlTags.length === 1, htmlTags.length);
  if (htmlTags.length === 1) {
    eq(route, 'html lang', attr(htmlTags[0].attrs, 'lang'), lang);
  }
  check(route, 'doctype', /^<!doctype html>/i.test(html));
  check(route, 'closes html document', /<\/html>\s*$/.test(html));

  /* Exactly one h1, and it is the page's real heading */
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  check(route, 'exactly one h1', h1s.length === 1, h1s.length);
  if (h1s.length === 1) {
    eq(route, 'h1 text', textOf(h1s[0][1]), expectedTitle);
  }

  /* Canonical and hreflang */
  const linkTags = tagsOf(html, 'link');
  const canonical = linkTags.filter((tag) => attr(tag.attrs, 'rel') === 'canonical');
  check(route, 'one canonical link', canonical.length === 1, canonical.length);
  if (canonical.length === 1) {
    eq(route, 'canonical href', attr(canonical[0].attrs, 'href'), BASE + route);
  }

  const alternates = linkTags.filter((tag) => attr(tag.attrs, 'rel') === 'alternate');
  const hreflang = {};
  for (const tag of alternates) {
    const code = attr(tag.attrs, 'hreflang');
    if (code) hreflang[code] = attr(tag.attrs, 'href');
  }
  eq(
    route,
    'hreflang set',
    Object.keys(hreflang).sort(),
    ['en', 'ru', 'x-default']
  );
  eq(route, 'hreflang en target', hreflang.en, BASE + pageUrl('en', page));
  eq(route, 'hreflang ru target', hreflang.ru, BASE + pageUrl('ru', page));
  eq(route, 'hreflang x-default target', hreflang['x-default'], BASE + pageUrl('en', page));

  /* Navigation */
  const nav = navBlock(html);
  check(route, 'main navigation exists', !!nav);
  if (nav) {
    eq(
      route,
      'navigation aria-label',
      attr(nav.attrs, 'aria-label'),
      isRu ? 'Основная навигация' : 'Main navigation'
    );
    eq(route, 'navigation link count', nav.anchors.length, PAGES.length);
    eq(
      route,
      'navigation hrefs',
      nav.anchors.map((anchor) => anchor.href),
      PAGES.map((p) => pageUrl(lang, p))
    );
    eq(
      route,
      'navigation labels',
      nav.anchors.map((anchor) => anchor.text),
      PAGES.map((p) => c.nav[p])
    );
    const current = nav.anchors.filter((anchor) => anchor.ariaCurrent === 'page');
    check(route, 'one current navigation item', current.length === 1, current.length);
    if (current.length === 1) {
      eq(route, 'current navigation item', current[0].href, route);
    }
  }

  /* Header: brand, language switch, theme control, skip link */
  const anchors = anchorsOf(html);
  const brand = anchors.find((anchor) => anchor.class && anchor.class.split(/\s+/).includes('brand'));
  check(route, 'brand link exists', !!brand);
  if (brand) {
    eq(route, 'brand links home', brand.href, pageUrl(lang, 'home'));
  }

  const language = anchors.find((anchor) =>
    anchor.class && anchor.class.split(/\s+/).includes('language')
  );
  check(route, 'language switch exists', !!language);
  if (language) {
    eq(route, 'language switch target', language.href, pageUrl(otherLang, page));
    eq(route, 'language switch lang attribute', language.lang, otherLang);
    eq(route, 'language switch hreflang attribute', language.hreflang, otherLang);
    eq(route, 'language switch label', language.text, isRu ? 'EN' : 'RU');
  }

  check(route, 'theme toggle button', /<button\b[^>]*id="theme-toggle"[^>]*type="button"/.test(html));

  const skip = anchors.find((anchor) =>
    anchor.class && anchor.class.split(/\s+/).includes('skip-link')
  );
  check(route, 'skip link exists', !!skip);
  if (skip) {
    eq(route, 'skip link target', skip.href, '#main');
  }
  check(route, 'main landmark', /<main\b[^>]*id="main"/.test(html));

  /* Contact details: every page has email and GitHub in its footer */
  check(
    route,
    'footer email link',
    html.includes('href="mailto:barkalovmisha@gmail.com"')
  );
  check(
    route,
    'footer GitHub link',
    html.includes('href="https://github.com/EryyynIT"')
  );
  check(route, 'no phone links', !/href="tel:/i.test(html));

  if (page === 'contact') {
    const links = contactBlock(html);
    check(route, 'contact block exists', !!links);
    if (links) {
      eq(route, 'contact block link count', links.length, CONTACT_HREFS.length);
      eq(route, 'contact block hrefs', links.map((anchor) => anchor.href), CONTACT_HREFS);
      check(route, 'contact email is visible', links.some((anchor) =>
        anchor.text.includes('barkalovmisha@gmail.com')));
      check(route, 'Telegram handle is visible', links.some((anchor) =>
        anchor.text.includes('@eprintln')));
      check(route, 'GitHub handle is visible', links.some((anchor) =>
        anchor.text.includes('EryyynIT')));
    }
  }

  if (page === 'resume') {
    const links = contactBlock(html);
    check(route, 'resume contact block exists', !!links);
    if (links) {
      eq(route, 'resume contact hrefs', links.map((anchor) => anchor.href), CONTACT_HREFS);
    }
  }

  /* Legacy content must not leak back into the new site */
  const refs = [...html.matchAll(/\b(?:href|src)="([^"]*)"/gi)].map((m) => decodeEntities(m[1]));
  const refsText = refs.join('\n');

  check(
    route,
    'no game route or game asset references',
    !/(^|\/)game(\/|$)/i.test(refsText) &&
      !/assets\/game/i.test(html) &&
      !/UndeadOverhaul/i.test(html)
  );
  check(
    route,
    'no legacy PDF files or CV assets',
    !/\.pdf(?:[?#"]|$)/i.test(refsText) &&
      !/assets\/cv/i.test(html) &&
      !/MichaelBarkalov_CV|MikhailBarkalov_CV/i.test(html)
  );
  check(
    route,
    'confidential project industry is not named',
    !/fintech|финтех/i.test(html)
  );
  check(
    route,
    'no stale March 2026 dates',
    !/March 2026|Март 2026|Mar 2026/i.test(html)
  );
  check(
    route,
    'no legacy project names',
    !/tic-tac-toe|TicTacToe|go-exercises|KickTheDoll|EscapeIQ|mailing/i.test(html)
  );
  check(route, 'no stale personal-hub URLs', !/\/personal-hub\//.test(html));

  if (page === 'experience' || page === 'resume' || page === 'home') {
    check(
      route,
      'confidential platform says its industry is unnamed',
      isRu ? /отрасль не называются/i.test(html) : /industry stay unnamed/i.test(html)
    );
  }

  /* Current facts: dates and Ozon ORD */
  if (page === 'home' || page === 'experience' || page === 'resume') {
    for (const date of CURRENT_DATES[lang]) {
      check(route, 'current date is present: ' + date, html.includes(date));
    }
    check(route, 'Ozon ORD is present', html.includes('Ozon ORD'));
  }

  /* Projects: exactly the two current experiments, localized */
  if (page === 'home' || page === 'work') {
    const rows = projectRows(html);
    eq(route, 'project row count', rows.length, 2);
    eq(route, 'project names', rows.map((row) => row.name), PROJECT_NAMES);
    eq(route, 'project repositories', rows.map((row) => row.url), PROJECT_URLS);
    eq(
      route,
      'project stacks',
      rows.map((row) => row.stack),
      content[lang].projects.map((project) => project.stack)
    );
  }

  /* Every internal href/src must resolve to a file in the static site */
  const pageFile = fileOf(route);
  const missing = [];
  let localRefs = 0;
  for (const ref of refs) {
    const target = localFile(ref, pageFile);
    if (!target) continue;
    localRefs += 1;

    const relative = path.relative(ROOT, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      missing.push(ref + ' -> outside site: ' + target);
      continue;
    }

    let isFile = false;
    try {
      isFile = fs.statSync(target).isFile();
    } catch (error) {
      isFile = false;
    }
    if (!isFile) {
      missing.push(ref + ' -> ' + relative);
    }
  }
  check(route, 'internal href/src targets exist', missing.length === 0, missing);
  check(route, 'page links to local static assets', localRefs >= 8, localRefs);

  /* Shared assets are present on every page */
  check(
    route,
    'shared CSS, JS and favicon are linked',
    html.includes('href="/css/portfolio.css"') &&
      html.includes('src="/js/portfolio.js"') &&
      html.includes('href="/favicon.svg"')
  );
  check(route, 'no insecure http links', !/(?:href|src)="http:\/\//i.test(html));
  check(
    route,
    'does not load the content module in the browser',
    !/<script\b[^>]*src="[^"]*data\/portfolio-content\.js"/.test(html)
  );
}

/* --- Cross-language project parity in generated pages ------------------ */

function workPage(lang) {
  return htmlByRoute.get(pageUrl(lang, 'work')) || '';
}

const workEn = projectRows(workPage('en'));
const workRu = projectRows(workPage('ru'));
eq(
  'projects',
  'EN and RU generated project names match',
  workEn.map((row) => row.name),
  workRu.map((row) => row.name)
);
eq(
  'projects',
  'EN and RU generated project repositories match',
  workEn.map((row) => row.url),
  workRu.map((row) => row.url)
);
eq(
  'projects',
  'EN and RU generated project stacks match',
  workEn.map((row) => row.stack),
  workRu.map((row) => row.stack)
);

/* --- Report ------------------------------------------------------------ */

const failedScopes = [...new Set(failures.map((failure) => failure.scope))];

if (failures.length > 0) {
  console.error('\n✗ ' + failures.length + ' of ' + total + ' portfolio checks failed:\n');
  for (const failure of failures) {
    const detail = failure.detail === undefined || failure.detail === null
      ? ''
      : ' — ' + (typeof failure.detail === 'string'
        ? failure.detail
        : JSON.stringify(failure.detail));
    console.error('  [' + failure.scope + '] ' + failure.name + detail);
  }
  console.error('\nScopes with failures: ' + failedScopes.join(', '));
  process.exitCode = 1;
} else {
  console.log(
    '✓ ALL PORTFOLIO CHECKS PASSED — ' + total + ' checks across ' +
    ROUTES.length + ' routes (EN + RU)'
  );
  console.log('  routes:  ' + ROUTES.length + ' generated pages');
  console.log('  metadata: lang, one h1, canonical, reciprocal hreflang');
  console.log('  content: navigation, contacts, current dates, Ozon ORD, projects');
  console.log('  legacy:  no game, no old PDFs, no confidential industry');
  console.log('  links:   all internal href/src resolve to local static files');
}