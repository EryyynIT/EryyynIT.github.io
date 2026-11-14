#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const content = require('../data/portfolio-content.js');
const { renderBody } = require('./prototype-templates.js');
const root = path.join(__dirname, '..');
const base = 'https://eryyynit.github.io';
const pages = ['home', 'work', 'experience', 'about', 'resume', 'contact'];
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const url = (lang, page) => (lang === 'ru' ? '/ru/' : '/') + (page === 'home' ? '' : page + '/');

function render(lang, page) {
  const c = content[lang];
  const ui = c.ui;
  const ru = lang === 'ru';
  const other = ru ? 'en' : 'ru';
  const current = url(lang, page);
  const title = page === 'home' ? ui.homeTitle : `${c.nav[page]}${page === 'resume' || page === 'about' ? ' · ' + c.resume.title : ''} — EryyynIT`;
  const desc = page === 'home' ? ui.homeDescription : (c[page].intro || c.about.paragraphs[0]);
  const image = `${base}/assets/og/portfolio-${lang}.png`;
  const nav = ['work', 'experience', 'about', 'resume', 'contact'].map(p =>
    `<a href="${url(lang, p)}"${p === page ? ' aria-current="page"' : ''}>${esc(c.nav[p])}</a>`
  ).join('');
  const switchLink = `<a class="language" href="${url(other, page)}" lang="${other}" hreflang="${other}" aria-label="${other.toUpperCase()} — ${ru ? 'Switch to English' : 'Переключить на русский'}">${other.toUpperCase()}</a>`;
  const currentLanguage = `<span class="current" aria-current="true">${lang.toUpperCase()}</span>`;
  const person = {
    '@context': 'https://schema.org', '@type': 'Person', '@id': base + '/#person',
    name: c.resume.title, alternateName: 'EryyynIT', url: base + url(lang, 'home'),
    jobTitle: ru ? 'Backend-разработчик' : 'Backend developer', sameAs: ['https://github.com/EryyynIT', 'https://t.me/eprintln'],
  };
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="author" content="${esc(c.resume.title)}">
  <meta name="color-scheme" content="light dark">
  <link rel="canonical" href="${base + current}">
  <link rel="alternate" hreflang="en" href="${base + url('en', page)}">
  <link rel="alternate" hreflang="ru" href="${base + url('ru', page)}">
  <link rel="alternate" hreflang="x-default" href="${base + url('en', page)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EryyynIT">
  <meta property="og:locale" content="${ru ? 'ru_RU' : 'en_US'}">
  <meta property="og:locale:alternate" content="${ru ? 'en_US' : 'ru_RU'}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${base + current}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(ui.homeTitle)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${image}">
  <meta name="theme-color" content="#f5f7f6">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}</script>
  <link rel="stylesheet" href="/css/portfolio.css">
  <script defer src="/js/portfolio.js"></script>
${page === 'home' ? `  <script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body data-page="${page}">
  <a class="skip" href="#main">${esc(ui.skip)}</a>
  <div class="wrap">
    <header class="header">
      <a class="brand" href="${url(lang, 'home')}" aria-label="EryyynIT — ${esc(c.nav.home)}"${page === 'home' ? ' aria-current="page"' : ''}>EryyynIT</a>
      <nav class="nav" id="navigation" aria-label="${esc(ui.mainNavigation)}">${nav}</nav>
      <div class="utility">
        <div class="lang" role="group" aria-label="${esc(ui.language)}">${ru ? switchLink : currentLanguage}<span aria-hidden="true">/</span>${ru ? currentLanguage : switchLink}</div>
        <button class="theme" id="theme-toggle" type="button" aria-label="${esc(ui.darkTheme)}" hidden>${esc(ui.theme)}</button>
        <button class="menu-button" id="menu" type="button" aria-controls="navigation" aria-expanded="false" data-open-label="${esc(ui.menu)}" data-close-label="${esc(ui.close)}" hidden>${esc(ui.menu)}</button>
      </div>
    </header>
  </div>
  <main id="main" tabindex="-1">${renderBody(lang, page)}</main>
  <div class="wrap">
    <footer class="footer">
      <span>EryyynIT · ${esc(ui.personName)}</span>
      <div class="footer-links">${['work', 'about', 'resume'].map(p => `<a href="${url(lang, p)}">${esc(c.nav[p])}</a>`).join('')}<a href="https://github.com/EryyynIT">GitHub</a></div>
      <span>${esc(ui.footerRole)}</span>
    </footer>
  </div>
</body>
</html>
`;
}

for (const lang of ['en', 'ru']) for (const page of pages) {
  const target = path.join(root, url(lang, page), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, render(lang, page));
}
console.log(`Generated ${pages.length * 2} pages.`);
