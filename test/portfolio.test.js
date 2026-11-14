/*
   Portfolio acceptance tests for the generated static site.

   The site is pre-rendered by scripts/generate-site.js. This test reads the
   twelve generated HTML files from disk — no browser, no JavaScript execution,
   no third-party packages — and checks the public contract of the new site:

     - all twelve routes exist and are distinct;
     - every route declares the right html lang, a non-empty title and
       description, exactly one canonical URL, reciprocal hreflang links and
       the required Open Graph metadata;
     - every route has exactly one non-empty, page-specific h1;
     - every route links to the other five routes of its language and to its
       counterpart in the other language;
     - every local href/src/srcset target resolves to a real file inside the
       static site, and fragment links resolve to a real id;
     - every route loads at least one local stylesheet and one local script;
     - the current employment dates and Ozon ORD are present on the experience
       and resume pages;
     - the contact page carries email, Telegram and GitHub, and the resume
       carries email plus at least one profile link;
     - no page references the legacy game, old CV PDFs, a telephone number or
       the confidential platform's industry.

   Deliberately NOT checked: CSS classes, element ids, aria-current, the
   presence of <nav>/<main>/<header>/<footer>, exact link counts or labels, or
   any other template structure. The tests should survive a redesign that keeps
   the routes, metadata and facts.

   Node.js standard library only.
*/
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://eryyynit.github.io';
const BASE_HOST = new URL(BASE).hostname.toLowerCase();
const LANGS = ['en', 'ru'];
const PAGES = ['home', 'work', 'experience', 'about', 'resume', 'contact'];

const EXPECTED_DATES = {
  en: ['December 2025 — April 2026', 'November 2023 — December 2025'],
  ru: ['Декабрь 2025 — апрель 2026', 'Ноябрь 2023 — декабрь 2025']
};

const EXPECTED_JOBS = {
  en: ['ADNova', 'Confidential platform'],
  ru: ['ADNova', 'Конфиденциальная платформа']
};

const CONTACTS = {
  email: 'barkalovmisha@gmail.com',
  telegramHandle: '@eprintln',
  telegramPath: '/eprintln',
  githubPath: '/eryyynit'
};

const OG_KEYS = ['og:type', 'og:title', 'og:description', 'og:url', 'og:image'];

/* =====================================================================
   Reporting
   ===================================================================== */

let total = 0;
const failures = [];

function check(scope, name, condition, detail) {
  total += 1;
  if (!condition) {
    failures.push({ scope, name, detail });
  }
}

function eq(scope, name, actual, expected) {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  check(scope, name, same, same ? null : { actual, expected });
}

/* =====================================================================
   Routes
   ===================================================================== */

function routeUrl(lang, page) {
  return (lang === 'ru' ? '/ru/' : '/') + (page === 'home' ? '' : page + '/');
}

function routeFile(route) {
  return path.join(ROOT, route.replace(/^\//, ''), 'index.html');
}

const ROUTES = [];
for (const lang of LANGS) {
  for (const page of PAGES) {
    const route = routeUrl(lang, page);
    ROUTES.push({ lang, page, route, file: routeFile(route) });
  }
}

/* =====================================================================
   Minimal HTML helpers (no dependencies)
   ===================================================================== */

function decodeEntities(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    })
    .replace(/&#(\d+);/g, (match, decimal) => {
      const code = parseInt(decimal, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    })
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&amp;/g, '&');
}

/* Remove script/style bodies so inline code can never be mistaken for
   document markup or visible text. */
function stripRawText(html) {
  return String(html)
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1');
}

const TAG_RE = /<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR_RE = /([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const ANCHOR_RE = /<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a>/gi;

function parseAttrs(source) {
  const attrs = {};
  let match;
  ATTR_RE.lastIndex = 0;
  while ((match = ATTR_RE.exec(source)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] !== undefined
      ? match[2]
      : match[3] !== undefined
        ? match[3]
        : match[4] !== undefined
          ? match[4]
          : '';
    attrs[name] = decodeEntities(value);
  }
  return attrs;
}

function parseTags(html) {
  const source = stripRawText(html);
  const tags = [];
  let match;
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(source)) !== null) {
    tags.push({
      name: match[1].toLowerCase(),
      attrs: parseAttrs(match[2]),
      raw: match[0]
    });
  }
  return tags;
}

function textOf(html) {
  return decodeEntities(stripRawText(html).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function anchorsOf(html) {
  const source = stripRawText(html);
  const anchors = [];
  let match;
  ANCHOR_RE.lastIndex = 0;
  while ((match = ANCHOR_RE.exec(source)) !== null) {
    const attrs = parseAttrs(match[1]);
    anchors.push({
      attrs,
      inner: match[2],
      href: attrs.href !== undefined ? attrs.href : null,
      text: textOf(match[2]),
      hreflang: attrs.hreflang || null,
      lang: attrs.lang || null,
      ariaLabel: attrs['aria-label'] || null,
      title: attrs.title || null
    });
  }
  return anchors;
}

function accessibleName(anchor) {
  if (anchor.text) return anchor.text;
  if (anchor.ariaLabel) return anchor.ariaLabel.trim();
  if (anchor.title) return anchor.title.trim();
  const alt = /<img\b[^>]*\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(anchor.inner);
  return alt ? decodeEntities(alt[1] !== undefined ? alt[1] : alt[2]).trim() : '';
}

function relTokens(value) {
  return String(value || '').toLowerCase().split(/\s+/).filter(Boolean);
}

function metaEntries(tags) {
  return tags
    .filter((tag) => tag.name === 'meta')
    .map((tag) => ({
      key: String(tag.attrs.property || tag.attrs.name || '').toLowerCase(),
      content: tag.attrs.content || ''
    }));
}

function metaValues(tags, key) {
  const wanted = key.toLowerCase();
  return metaEntries(tags)
    .filter((entry) => entry.key === wanted)
    .map((entry) => entry.content);
}

function parseSrcset(value) {
  return String(value || '')
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function collectRefs(tags) {
  const refs = [];
  for (const tag of tags) {
    for (const attribute of ['href', 'src', 'poster']) {
      if (Object.prototype.hasOwnProperty.call(tag.attrs, attribute)) {
        refs.push({ raw: tag.attrs[attribute], tag: tag.name, attribute });
      }
    }
    if (Object.prototype.hasOwnProperty.call(tag.attrs, 'srcset')) {
      for (const candidate of parseSrcset(tag.attrs.srcset)) {
        refs.push({ raw: candidate, tag: tag.name, attribute: 'srcset' });
      }
    }
  }
  return refs;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (error) {
    return false;
  }
}

function fileSize(file) {
  try {
    return fs.statSync(file).size;
  } catch (error) {
    return 0;
  }
}

function routeFromPathname(pathname) {
  let value = pathname || '/';
  if (!value.startsWith('/')) value = '/' + value;
  if (value === '/') return '/';
  if (value.endsWith('/index.html')) return value.slice(0, -'index.html'.length);
  if (value.endsWith('/')) return value;
  if (path.extname(value) === '') return value + '/';
  return null;
}

/* Resolve a URL-ish attribute against the page URL and classify it.

   Returns one of:
     skip        — mailto:, tel:, data: and friends
     external    — a different host
     local       — same origin; file (or null) and route (or null)
     outside     — a local path that escapes the static site
     malformed   — unparsable or empty
     bad-scheme  — javascript:, file:, ftp:, etc.                              */
function resolveRef(ref, pageUrl) {
  const raw = String(ref === null || ref === undefined ? '' : ref).trim();
  if (!raw) return { type: 'empty', raw };

  let url;
  try {
    url = new URL(raw, pageUrl);
  } catch (error) {
    return { type: 'malformed', raw };
  }

  const protocol = url.protocol.toLowerCase();
  if (['mailto:', 'tel:', 'sms:', 'data:', 'blob:', 'about:'].includes(protocol)) {
    return { type: 'skip', raw, url, protocol };
  }
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { type: 'bad-scheme', raw, url, protocol };
  }

  const sameOrigin = url.hostname.toLowerCase() === BASE_HOST;
  if (!sameOrigin) {
    return { type: 'external', raw, url, insecure: protocol === 'http:' };
  }

  const pathname = safeDecode(url.pathname || '/');
  const relative = pathname.replace(/\\/g, '/').replace(/^\/+/, '');
  const absolute = path.resolve(ROOT, relative);
  const relativeToRoot = path.relative(ROOT, absolute);
  if (
    relativeToRoot === '..' ||
    relativeToRoot.startsWith('..' + path.sep) ||
    path.isAbsolute(relativeToRoot)
  ) {
    return { type: 'outside', raw, url, pathname, insecure: protocol === 'http:' };
  }

  const candidates = [];
  if (pathname.endsWith('/')) {
    candidates.push(path.join(absolute, 'index.html'));
  } else {
    candidates.push(absolute);
    if (path.extname(absolute) === '') {
      candidates.push(path.join(absolute, 'index.html'));
    }
  }
  const file = candidates.find(isFile) || null;

  return {
    type: 'local',
    raw,
    url,
    pathname,
    candidates,
    file,
    route: routeFromPathname(pathname),
    fragment: url.hash && url.hash.length > 1 ? safeDecode(url.hash.slice(1)) : '',
    hasEmptyHash: url.hash === '#',
    insecure: protocol === 'http:'
  };
}

function isGamePath(value) {
  const pathname = String(value || '').toLowerCase();
  return (
    /(^|\/)game(\/|$)/.test(pathname) ||
    /(^|\/)assets\/game(\/|$)/.test(pathname)
  );
}

function isOldCvPath(value) {
  const pathname = String(value || '').toLowerCase();
  return (
    /(^|\/)assets\/cv(\/|$)/.test(pathname) ||
    /\.pdf$/.test(pathname) ||
    /barkalov_cv/.test(pathname)
  );
}

function mailtoAddress(href) {
  const match = /^mailto:([^?#]+)/i.exec(String(href || '').trim());
  return match ? safeDecode(match[1]).toLowerCase() : null;
}

function linkHost(anchor) {
  return anchor.resolved && anchor.resolved.url
    ? anchor.resolved.url.hostname.toLowerCase()
    : '';
}

function linkPath(anchor) {
  return anchor.resolved && anchor.resolved.url
    ? anchor.resolved.url.pathname.replace(/\/+$/, '').toLowerCase()
    : '';
}

function isTelegramLink(anchor) {
  const host = linkHost(anchor);
  return (host === 't.me' || host === 'www.t.me') && linkPath(anchor) === CONTACTS.telegramPath;
}

function isGithubProfileLink(anchor) {
  const host = linkHost(anchor);
  return (
    (host === 'github.com' || host === 'www.github.com') &&
    linkPath(anchor) === CONTACTS.githubPath
  );
}

/* =====================================================================
   Page files
   ===================================================================== */

check('build', 'the route list has twelve pages', ROUTES.length === 12, ROUTES.length);

const htmlCache = new Map();
const idCache = new Map();

function readHtml(file) {
  if (!htmlCache.has(file)) {
    try {
      htmlCache.set(file, fs.readFileSync(file, 'utf8'));
    } catch (error) {
      htmlCache.set(file, null);
    }
  }
  return htmlCache.get(file);
}

function idsOfFile(file) {
  if (idCache.has(file)) return idCache.get(file);
  const html = readHtml(file);
  const ids = new Set();
  if (html !== null) {
    for (const tag of parseTags(html)) {
      if (tag.attrs.id) ids.add(tag.attrs.id);
    }
  }
  idCache.set(file, ids);
  return ids;
}

const pageHtml = new Map();
for (const route of ROUTES) {
  const relativeFile = path.relative(ROOT, route.file);
  const exists = isFile(route.file);
  check(route.route, 'generated page exists', exists, relativeFile);
  if (!exists) continue;

  const html = readHtml(route.file);
  if (html === null) {
    check(route.route, 'generated page is readable', false, relativeFile);
    continue;
  }
  check(route.route, 'generated page is not empty', html.trim().length > 0, html.length);
  pageHtml.set(route.route, html);
}

check(
  'build',
  'all twelve pages were generated',
  pageHtml.size === ROUTES.length,
  { found: pageHtml.size, expected: ROUTES.length }
);

if (pageHtml.size === ROUTES.length) {
  check(
    'build',
    'the twelve generated pages are distinct',
    new Set(pageHtml.values()).size === ROUTES.length,
    new Set(pageHtml.values()).size
  );
}

/* =====================================================================
   Per-page checks
   ===================================================================== */

const h1ByLang = { en: [], ru: [] };
const titleByRoute = new Map();

for (const route of ROUTES) {
  const html = pageHtml.get(route.route);
  if (!html) continue;

  const scope = route.route;
  const pageUrl = BASE + route.route;
  const tags = parseTags(html);
  const linkTags = tags.filter((tag) => tag.name === 'link');
  const bodyText = textOf(html);
  const anchors = anchorsOf(html).map((anchor) => ({
    ...anchor,
    resolved: anchor.href === null ? null : resolveRef(anchor.href, pageUrl),
    name: accessibleName(anchor)
  }));

  /* --- Document basics ------------------------------------------------ */

  check(scope, 'starts with an HTML doctype', /^(?:\uFEFF)?\s*<!doctype\s+html>/i.test(html));
  check(scope, 'closes the html document', /<\/html>\s*$/i.test(html));
  check(scope, 'page has visible text', bodyText.length > 0, bodyText.length);

  const htmlTags = tags.filter((tag) => tag.name === 'html');
  check(scope, 'single html element', htmlTags.length === 1, htmlTags.length);
  if (htmlTags.length === 1) {
    const pageLang = String(htmlTags[0].attrs.lang || '').toLowerCase();
    check(
      scope,
      'html lang',
      pageLang === route.lang || pageLang.startsWith(route.lang + '-'),
      pageLang
    );
  }

  /* --- Title and description ----------------------------------------- */

  const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(stripRawText(html));
  const title = titleMatch ? textOf(titleMatch[1]) : '';
  check(scope, 'non-empty title', title.length > 0, title);
  if (title) {
    check(
      scope,
      'title is unique across the site',
      !titleByRoute.has(title),
      titleByRoute.get(title) || null
    );
    titleByRoute.set(title, scope);
  }

  const descriptions = metaValues(tags, 'description');
  check(scope, 'single meta description', descriptions.length === 1, descriptions.length);
  const description = descriptions.length === 1 ? descriptions[0] : '';
  check(scope, 'meta description is non-empty', description.trim().length > 0, description);
  if (description) {
    const hasCyrillic = /[А-Яа-яЁё]/.test(description);
    check(
      scope,
      route.lang === 'ru' ? 'meta description is in Russian' : 'meta description is in English',
      route.lang === 'ru' ? hasCyrillic : !hasCyrillic,
      description
    );
  }

  /* --- Exactly one meaningful h1 ------------------------------------- */

  const h1Matches = [...stripRawText(html).matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  check(scope, 'exactly one h1', h1Matches.length === 1, h1Matches.length);
  if (h1Matches.length === 1) {
    const h1 = textOf(h1Matches[0][1]);
    check(scope, 'h1 is non-empty', h1.length > 0, h1);
    const hasCyrillic = /[А-Яа-яЁё]/.test(h1);
    check(
      scope,
      route.lang === 'ru' ? 'h1 is in Russian' : 'h1 is in English',
      route.lang === 'ru' ? hasCyrillic : !hasCyrillic,
      h1
    );
    h1ByLang[route.lang].push({ scope, h1 });
  }

  /* --- Canonical and reciprocal hreflang ----------------------------- */

  const canonicalTags = linkTags.filter((tag) =>
    relTokens(tag.attrs.rel).includes('canonical')
  );
  check(scope, 'single canonical link', canonicalTags.length === 1, canonicalTags.length);
  const canonical = canonicalTags.length === 1 ? canonicalTags[0].attrs.href || '' : '';
  if (canonicalTags.length === 1) {
    eq(scope, 'canonical URL', canonical, BASE + route.route);
  }

  const alternates = linkTags.filter(
    (tag) => relTokens(tag.attrs.rel).includes('alternate') && tag.attrs.hreflang
  );
  const alternatesByCode = new Map();
  for (const tag of alternates) {
    const code = String(tag.attrs.hreflang).toLowerCase();
    const href = tag.attrs.href || '';
    if (!alternatesByCode.has(code)) alternatesByCode.set(code, []);
    alternatesByCode.get(code).push(href);
  }

  const expectedAlternates = {
    en: BASE + routeUrl('en', route.page),
    ru: BASE + routeUrl('ru', route.page),
    'x-default': BASE + routeUrl('en', route.page)
  };
  for (const code of Object.keys(expectedAlternates)) {
    const hrefs = alternatesByCode.get(code) || [];
    check(scope, 'single hreflang ' + code, hrefs.length === 1, hrefs);
    if (hrefs.length === 1) {
      eq(scope, 'hreflang ' + code + ' target', hrefs[0], expectedAlternates[code]);
    }
  }

  /* --- Open Graph metadata ------------------------------------------- */

  for (const key of OG_KEYS) {
    const values = metaValues(tags, key);
    check(scope, 'single ' + key, values.length === 1, values.length);
    check(
      scope,
      key + ' is non-empty',
      values.length > 0 && values[0].trim().length > 0,
      values[0] || ''
    );
  }

  const ogUrl = metaValues(tags, 'og:url')[0] || '';
  eq(scope, 'og:url matches canonical', ogUrl, canonical);

  const ogImage = metaValues(tags, 'og:image')[0] || '';
  check(scope, 'og:image is an absolute URL', /^https:\/\//i.test(ogImage), ogImage);
  if (ogImage) {
    const resolvedImage = resolveRef(ogImage, pageUrl);
    check(scope, 'og:image is a local asset', resolvedImage.type === 'local', resolvedImage.type);
    if (resolvedImage.type === 'local') {
      check(scope, 'og:image file exists', Boolean(resolvedImage.file), ogImage);
      check(
        scope,
        'og:image has an image extension',
        /\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(resolvedImage.pathname),
        resolvedImage.pathname
      );
      check(
        scope,
        'og:image is not a game or CV asset',
        !isGamePath(resolvedImage.pathname) && !isOldCvPath(resolvedImage.pathname),
        resolvedImage.pathname
      );
    }
  }

  /* --- Navigation and language switch -------------------------------- */

  const placeholderAnchors = anchors.filter((anchor) => {
    const href = anchor.href === null ? '' : anchor.href.trim();
    return !href || href === '#' || /^javascript:/i.test(href);
  });
  check(
    scope,
    'no anchor has an empty or placeholder href',
    placeholderAnchors.length === 0,
    placeholderAnchors.map((anchor) => ({ href: anchor.href, text: anchor.text }))
  );

  for (const navPage of PAGES) {
    // A nav may render the current page as plain text instead of a self-link;
    // that is a presentation choice, so only the other routes are required.
    if (navPage === route.page) continue;
    const expectedRoute = routeUrl(route.lang, navPage);
    const matching = anchors.filter((anchor) =>
      anchor.resolved &&
      anchor.resolved.type === 'local' &&
      anchor.resolved.route === expectedRoute
    );
    check(
      scope,
      'link to ' + expectedRoute + ' exists',
      matching.length > 0,
      { expected: expectedRoute, hrefs: anchors.map((anchor) => anchor.href) }
    );
    check(
      scope,
      'link to ' + expectedRoute + ' is labelled',
      matching.some((anchor) => anchor.name.length > 0),
      matching.map((anchor) => anchor.name)
    );
  }

  const otherLang = route.lang === 'ru' ? 'en' : 'ru';
  const counterpart = routeUrl(otherLang, route.page);
  const languageLinks = anchors.filter((anchor) =>
    anchor.resolved &&
    anchor.resolved.type === 'local' &&
    anchor.resolved.route === counterpart
  );
  check(
    scope,
    'link to the ' + otherLang + ' version exists',
    languageLinks.length > 0,
    { expected: counterpart, hrefs: anchors.map((anchor) => anchor.href) }
  );
  check(
    scope,
    'link to the ' + otherLang + ' version is labelled',
    languageLinks.some((anchor) => anchor.name.length > 0),
    languageLinks.map((anchor) => anchor.name)
  );
  for (const languageLink of languageLinks) {
    if (languageLink.hreflang) {
      eq(scope, 'language link hreflang', languageLink.hreflang.toLowerCase(), otherLang);
    }
    if (languageLink.lang) {
      eq(scope, 'language link lang', languageLink.lang.toLowerCase(), otherLang);
    }
  }

  /* --- Local links and assets ---------------------------------------- */

  const stylesheets = linkTags.filter(
    (tag) => relTokens(tag.attrs.rel).includes('stylesheet') && tag.attrs.href
  );
  const localStylesheets = stylesheets
    .map((tag) => resolveRef(tag.attrs.href, pageUrl))
    .filter((resolved) => resolved.type === 'local');
  check(
    scope,
    'at least one local stylesheet',
    localStylesheets.length > 0,
    stylesheets.map((tag) => tag.attrs.href)
  );
  check(
    scope,
    'local stylesheets exist and are not empty',
    localStylesheets.length > 0 &&
      localStylesheets.every((resolved) => resolved.file && fileSize(resolved.file) > 0),
    localStylesheets.map((resolved) => resolved.file)
  );

  const scripts = tags.filter((tag) => tag.name === 'script' && tag.attrs.src);
  const localScripts = scripts
    .map((tag) => resolveRef(tag.attrs.src, pageUrl))
    .filter((resolved) => resolved.type === 'local');
  check(
    scope,
    'at least one local script',
    localScripts.length > 0,
    scripts.map((tag) => tag.attrs.src)
  );
  check(
    scope,
    'local scripts exist and are not empty',
    localScripts.length > 0 &&
      localScripts.every((resolved) => resolved.file && fileSize(resolved.file) > 0),
    localScripts.map((resolved) => resolved.file)
  );

  const refs = collectRefs(tags);
  const missing = [];
  const outside = [];
  const malformed = [];
  const badSchemes = [];
  const insecure = [];
  const emptyFragments = [];
  const fragmentChecks = [];

  for (const ref of refs) {
    const resolved = resolveRef(ref.raw, pageUrl);

    if (resolved.type === 'local') {
      if (!resolved.file) {
        missing.push({
          ref: ref.raw,
          candidates: resolved.candidates.map((file) => path.relative(ROOT, file))
        });
      }
      if (resolved.insecure) insecure.push(ref.raw);
      if (resolved.hasEmptyHash) emptyFragments.push(ref.raw);
      if (resolved.fragment) fragmentChecks.push({ ref: ref.raw, resolved });
    } else if (resolved.type === 'outside') {
      outside.push(ref.raw);
      if (resolved.insecure) insecure.push(ref.raw);
    } else if (resolved.type === 'malformed' || resolved.type === 'empty') {
      malformed.push(ref.raw || '(empty)');
    } else if (resolved.type === 'bad-scheme') {
      badSchemes.push(ref.raw);
    } else if (resolved.type === 'external' && resolved.insecure) {
      insecure.push(ref.raw);
    }
  }

  check(scope, 'all local href/src targets exist', missing.length === 0, missing);
  check(scope, 'no local href/src escapes the site', outside.length === 0, outside);
  check(scope, 'no malformed or empty href/src', malformed.length === 0, malformed);
  check(scope, 'no unsupported URL schemes', badSchemes.length === 0, badSchemes);
  check(scope, 'no insecure http links', insecure.length === 0, insecure);
  check(scope, 'no empty fragment links', emptyFragments.length === 0, emptyFragments);

  for (const item of fragmentChecks) {
    const target = item.resolved.file;
    if (!target) continue; // already reported as missing
    if (!/\.html?$/i.test(target)) continue;
    const ids = idsOfFile(target);
    check(
      scope,
      'fragment target exists for ' + item.ref,
      ids.has(item.resolved.fragment),
      { fragment: item.resolved.fragment, target: path.relative(ROOT, target) }
    );
  }

  /* --- Legacy game and old CV must not leak back --------------------- */

  const pagePaths = refs
    .map((ref) => resolveRef(ref.raw, pageUrl))
    .filter((resolved) => resolved.type === 'local' || resolved.type === 'outside')
    .map((resolved) => resolved.pathname || '');

  const gamePaths = pagePaths.filter(isGamePath);
  const cvPaths = pagePaths.filter(isOldCvPath);

  check(scope, 'no game route or game asset in href/src', gamePaths.length === 0, gamePaths);
  check(scope, 'no old CV or PDF asset in href/src', cvPaths.length === 0, cvPaths);
  check(
    scope,
    'no legacy game markup',
    !/assets\/game|undead\s*overhaul/i.test(html),
    'found legacy game markup'
  );
  check(
    scope,
    'no legacy CV markup',
    !/assets\/cv|(?:michael|mikhail)?barkalov_cv/i.test(html),
    'found legacy CV markup'
  );
  check(
    scope,
    'no PDF references in markup',
    !/\.pdf(?:[?#"'\s)]|$)/i.test(html),
    'found a .pdf reference'
  );
  check(scope, 'no telephone links', !/href\s*=\s*["']tel:/i.test(html));

  /* --- Contacts ------------------------------------------------------ */

  const mailtoAnchors = anchors.filter((anchor) =>
    /^mailto:/i.test(String(anchor.href || '').trim())
  );
  const badEmails = mailtoAnchors
    .filter((anchor) => mailtoAddress(anchor.href) !== CONTACTS.email)
    .map((anchor) => anchor.href);
  check(
    scope,
    'every email link uses the current address',
    badEmails.length === 0,
    badEmails
  );

  const telegramLinks = anchors.filter(
    (anchor) => ['t.me', 'www.t.me'].includes(linkHost(anchor))
  );
  const badTelegramLinks = telegramLinks.filter((anchor) => !isTelegramLink(anchor));
  check(
    scope,
    'every Telegram link points at ' + CONTACTS.telegramHandle,
    badTelegramLinks.length === 0,
    badTelegramLinks.map((anchor) => anchor.href)
  );

  const telAnchors = anchors.filter((anchor) => /^tel:/i.test(anchor.href || ''));
  check(scope, 'no tel: anchors', telAnchors.length === 0, telAnchors.map((a) => a.href));

  if (route.page === 'contact') {
    check(
      scope,
      'contact page has an email link',
      anchors.some((anchor) => mailtoAddress(anchor.href) === CONTACTS.email)
    );
    check(
      scope,
      'contact page has a Telegram link',
      anchors.some(isTelegramLink)
    );
    check(
      scope,
      'contact page has a GitHub profile link',
      anchors.some(isGithubProfileLink)
    );
    check(
      scope,
      'contact page shows the email address',
      bodyText.toLowerCase().includes(CONTACTS.email.toLowerCase()),
      bodyText
    );
  }

  if (route.page === 'resume') {
    check(
      scope,
      'resume has an email link',
      anchors.some((anchor) => mailtoAddress(anchor.href) === CONTACTS.email)
    );
    check(
      scope,
      'resume shows the email address',
      bodyText.toLowerCase().includes(CONTACTS.email.toLowerCase()),
      bodyText
    );
    check(
      scope,
      'resume has a Telegram or GitHub profile link',
      anchors.some(isTelegramLink) || anchors.some(isGithubProfileLink)
    );
  }

  /* --- Current dates and Ozon ORD ------------------------------------ */

  const showsExperience = route.page === 'experience' || route.page === 'resume';
  if (showsExperience) {
    for (const date of EXPECTED_DATES[route.lang]) {
      check(scope, 'current date is present: ' + date, bodyText.includes(date));
    }
    check(scope, 'current Ozon ORD is present', bodyText.includes('Ozon ORD'));
    for (const job of EXPECTED_JOBS[route.lang]) {
      check(scope, 'current job is named: ' + job, bodyText.includes(job));
    }
  } else if (route.page === 'home') {
    // A home page may omit experience entirely. If it does show an
    // engagement, its dates must be current rather than stale.
    if (bodyText.includes(EXPECTED_JOBS[route.lang][0])) {
      check(
        scope,
        'current ADNova date on home',
        bodyText.includes(EXPECTED_DATES[route.lang][0]),
        EXPECTED_DATES[route.lang][0]
      );
    }
    if (bodyText.includes(EXPECTED_JOBS[route.lang][1])) {
      check(
        scope,
        'current confidential platform date on home',
        bodyText.includes(EXPECTED_DATES[route.lang][1]),
        EXPECTED_DATES[route.lang][1]
      );
    }
  }

  check(
    scope,
    'no stale March 2026 dates',
    !/(?:March|Mar)\s+2026|Март\s+2026/i.test(html)
  );
  check(
    scope,
    'confidential platform industry is not named',
    !/fintech|финтех/i.test(html)
  );
}

/* =====================================================================
   Cross-page checks
   ===================================================================== */

for (const lang of LANGS) {
  const headings = h1ByLang[lang].map((entry) => entry.h1);
  check(
    'cross-language',
    lang + ': h1 headings are page-specific',
    new Set(headings).size === headings.length,
    headings
  );
}

/* Data shape, templates, and local font dependencies are part of the build contract. */
const source = require('../data/portfolio-content.js');
function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, shape(value[key])]));
  return typeof value;
}
eq('content', 'English and Russian trees have the same shape', shape(source.en), shape(source.ru));
for (const language of LANGS) {
  check('content', language + ': test assignments are honestly labelled', source[language].projects.every(project => /test assignment|тестовое задание/i.test(project.kind)));
  for (const project of source[language].projects) {
    for (const page of ['home', 'work']) {
      const html = fs.readFileSync(routeFile(routeUrl(language, page)), 'utf8');
      check('content', language + '/' + page + ': ' + project.name + ' repository is present', html.includes(project.url));
    }
  }
}
const style = fs.readFileSync(path.join(ROOT, 'css/portfolio.css'), 'utf8');
check('assets', 'fonts have no Google Fonts runtime dependency', !/fonts\.googleapis|@import/.test(style));
for (const match of style.matchAll(/url\(['"]?(\/assets\/fonts\/[^)'"\s]+)/g)) {
  check('assets', 'local font exists: ' + match[1], fs.existsSync(path.join(ROOT, match[1])));
}
for (const route of ROUTES) {
  const html = fs.readFileSync(route.file, 'utf8');
  check(route.route, 'main landmark is present', /<main\b[^>]*id="main"/.test(html));
  check(route.route, 'mobile menu has an accessible disclosure control', /aria-controls="navigation"[^>]*aria-expanded="false"/.test(html));
  check(route.route, 'no decorative logo block returns', !/hero-signature/.test(html));
  if (route.page === 'home') {
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    check(route.route, 'honest Person structured data is present', !!json && JSON.parse(json[1])['@type'] === 'Person');
  }
}

/* Removed CV files must not return through archived sources or documentation. */
for (const name of ['MichaelBarkalov_CV.pdf', 'MikhailBarkalov_CV_RU.pdf']) {
  check('legacy-cv', 'old document is absent: ' + name, !fs.existsSync(path.join(ROOT, 'assets', 'cv', name)));
}
for (const name of ['README.md', 'data/content.js', 'data/portfolio-content.js', 'test/resume.test.js', '.github/workflows/pages.yml']) {
  const text = fs.readFileSync(path.join(ROOT, name), 'utf8');
  check('legacy-cv', name + ': no legacy file reference', !/assets\/cv|(?:Michael|Mikhail)Barkalov_CV(?:_RU)?\.pdf/.test(text));
}
for (const lang of LANGS) {
  check('content', lang + ': Go and Python visible in hero', /Go/.test(source[lang].hero.intro) && /Python/.test(source[lang].hero.intro));
}
const inlineLanguage = fs.readFileSync(path.join(ROOT, 'js/language.js'), 'utf8');
for (const route of ROUTES) {
  check(route.route, 'language bootstrap is embedded before styles', fs.readFileSync(route.file, 'utf8').includes('<script>' + inlineLanguage + '</script>'));
}

/* =====================================================================
   Report
   ===================================================================== */

if (failures.length > 0) {
  const failedScopes = [...new Set(failures.map((failure) => failure.scope))];
  console.error('\n✗ ' + failures.length + ' of ' + total + ' portfolio checks failed:\n');
  for (const failure of failures) {
    let detail = '';
    if (failure.detail !== undefined && failure.detail !== null) {
      detail = ' — ' + (typeof failure.detail === 'string'
        ? failure.detail
        : JSON.stringify(failure.detail));
    }
    console.error('  [' + failure.scope + '] ' + failure.name + detail);
  }
  console.error('\nScopes with failures: ' + failedScopes.join(', '));
  process.exitCode = 1;
} else {
  console.log(
    '✓ ALL PORTFOLIO CHECKS PASSED — ' + total + ' checks across ' +
    ROUTES.length + ' routes (EN + RU)'
  );
  console.log('  routes:   ' + ROUTES.length + ' generated pages, all distinct');
  console.log('  metadata: lang, title, description, canonical, hreflang, Open Graph');
  console.log('  headings: exactly one non-empty, page-specific h1 per route');
  console.log('  links:    route links, language switch, all local targets exist');
  console.log('  content:  current dates, Ozon ORD, contact details');
  console.log('  legacy:   no game, no old CV/PDF, no telephone, no confidential industry');
}