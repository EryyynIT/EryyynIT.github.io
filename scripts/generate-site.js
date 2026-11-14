#!/usr/bin/env node
'use strict';

// All public pages are static and share the same bilingual content source.
const fs = require('fs');
const path = require('path');
const content = require('../data/portfolio-content.js');
const root = path.join(__dirname, '..');
const base = 'https://eryyynit.github.io';
const pages = ['home', 'work', 'experience', 'about', 'resume', 'contact'];
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = (lang, page) => (lang === 'ru' ? '/ru/' : '/') + (page === 'home' ? '' : page + '/');
const arrow = '<span aria-hidden="true"> ↗</span>';
const link = (href, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}">${esc(text)}${arrow}</a>`;
const stack = items => `<ul class="stack" role="list">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const contactLinks = lang => `<div class="contact-links">${link('mailto:barkalovmisha@gmail.com', 'barkalovmisha@gmail.com')}${link('https://t.me/eprintln', 'Telegram · @eprintln')}${link('https://github.com/EryyynIT', 'GitHub · EryyynIT')}</div>`;
const project = (p, lang, detail) => { const heading = detail ? 'h2' : 'h3'; return `<article class="project-row"><div><p class="meta">${esc(p.kind)}</p><${heading}>${esc(p.name)}</${heading}></div><div><p>${esc(p.description)}</p>${detail ? `<p>${esc(p.details)}</p>` : ''}${stack(p.stack)}${link(p.url, lang === 'ru' ? 'Репозиторий на GitHub' : 'Repository on GitHub', 'text-link')}</div></article>`; };
const job = (j, lang, detail, standalone = false) => { const heading = standalone ? 'h2' : 'h3'; return `<article class="job-row"><div><p class="meta">${esc(j.dates)}</p><${heading}>${esc(j.name)}</${heading}><p class="role">${esc(j.role)}</p></div><div><p>${esc(j.summary)}</p>${detail ? `<ul class="job-details">${j.details.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${stack(j.stack)}` : ''}</div></article>`; };
const sectionHeading = (title, intro, action) => `<div class="section-head"><div><h2>${esc(title)}</h2>${intro ? `<p>${esc(intro)}</p>` : ''}</div>${action || ''}</div>`;
function body(c, lang, page) {
  const ru = lang === 'ru';
  const more = (p, label) => link(url(lang, p), label, 'text-link');
  if (page === 'home') return `<section class="hero wrap"><div class="hero-copy"><p class="meta hero-kicker">${esc(c.hero.eyebrow)}</p><h1>${esc(c.hero.title)}</h1><p class="hero-description">${esc(c.hero.description)}</p><div class="actions"><a class="button" href="${url(lang,'work')}">${esc(c.hero.primary)} <span aria-hidden="true">↗</span></a><a class="text-link" href="${url(lang,'experience')}">${ru ? 'Профессиональный опыт' : 'Professional experience'} ${arrow}</a></div></div><div class="hero-signature" aria-hidden="true"><span>Eryyyn</span><span>IT<span class="signature-dot">.</span></span><small>Michael / Михаил<br>Go · Python</small></div></section>
  <section class="section wrap">${sectionHeading(c.home.workTitle, c.home.workIntro, more('work',ru?'Все проекты':'All projects'))}<div class="project-list">${c.projects.map(p => project(p,lang,false)).join('')}</div></section>
  <section class="section section-tint"><div class="wrap">${sectionHeading(c.home.experienceTitle,c.home.experienceIntro,more('experience',ru?'Подробнее об опыте':'Explore experience'))}<div class="job-list">${c.jobs.map(j => job(j,lang,false)).join('')}</div></div></section>
  <section class="section wrap about-teaser"><div><h2>${esc(c.home.aboutTitle)}</h2></div><div><p class="lead">${esc(c.home.aboutText)}</p>${more('about',ru?'Узнать обо мне':'More about me')}</div></section>
  <section class="section contact-band"><div class="wrap contact-band-inner"><div><h2>${esc(c.home.contactTitle)}</h2><p>${esc(c.home.contactText)}</p></div>${more('contact',ru?'Связаться':'Get in touch')}</div></section>`;
  const title = c[page].title;
  const intro = c[page].intro || '';
  let inner = '';
  if (page === 'work') inner = `<div class="project-list">${c.projects.map(p => project(p,lang,true)).join('')}</div>`;
  if (page === 'experience') inner = `<div class="job-list">${c.jobs.map(j => job(j,lang,true,true)).join('')}</div>`;
  if (page === 'about') inner = `<div class="prose">${c.about.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${more('contact',ru?'Связаться':'Get in touch')}</div>`;
  if (page === 'resume') inner = `<div class="resume-intro"><div><h2>${ru?'Михаил Баркалов':'Michael Barkalov'}</h2><p>${ru?'Backend-разработчик':'Backend Developer'} · Go / Python</p>${contactLinks(lang)}</div><button class="button print-button" type="button" onclick="window.print()">${ru?'Сохранить в PDF / печать':'Save as PDF / print'}</button></div><section class="resume-section"><h2>${esc(c.nav.experience)}</h2><div class="job-list">${c.jobs.map(j => job(j,lang,true)).join('')}</div></section><section class="resume-section"><h2>${esc(c.resume.skillsTitle)}</h2>${stack(c.resume.skills)}</section>`;
  if (page === 'contact') inner = `<div class="contact-page">${contactLinks(lang)}<p>${ru?'Пишите по вопросам сотрудничества или о разработке.':'For collaboration or a conversation about engineering.'}</p></div>`;
  return `<div class="wrap page"><header class="page-heading"><p class="meta">EryyynIT / ${esc(c.nav[page])}</p><h1>${esc(title)}</h1>${intro ? `<p class="page-intro">${esc(intro)}</p>` : ''}</header>${inner}</div>`;
}
function render(lang,page) {
  const c = content[lang], ru = lang === 'ru', current = url(lang,page), alternate = url(ru?'en':'ru',page);
  const title = page === 'home' ? (ru?'Михаил Баркалов — backend-разработчик | EryyynIT':'Michael Barkalov — backend developer | EryyynIT') : `${c.nav[page]} — EryyynIT`;
  const desc = page === 'home' ? c.hero.description : (c[page].intro || c.about.paragraphs[0]);
  const nav = pages.map(p => `<a href="${url(lang,p)}"${p===page?' aria-current="page"':''}>${esc(c.nav[p])}</a>`).join('');
  return `<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${base+current}"><link rel="alternate" hreflang="en" href="${base+url('en',page)}"><link rel="alternate" hreflang="ru" href="${base+url('ru',page)}"><link rel="alternate" hreflang="x-default" href="${base+url('en',page)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${base+current}"><meta property="og:image" content="${base}/assets/og/portfolio-${lang}.png"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#f5f7f5"><link rel="icon" href="/favicon.svg"><script>try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}</script><link rel="stylesheet" href="/css/portfolio.css"><script defer src="/js/portfolio.js"></script></head><body><a class="skip-link" href="#main">${ru?'К содержанию':'Skip to content'}</a><header class="site-header"><div class="wrap header-inner"><a class="brand" href="${url(lang,'home')}" aria-label="EryyynIT — ${esc(c.nav.home)}">EryyynIT<span>.</span></a><nav class="nav" aria-label="${ru?'Основная навигация':'Main navigation'}">${nav}</nav><div class="utilities"><a class="language" href="${alternate}" lang="${ru?'en':'ru'}" hreflang="${ru?'en':'ru'}" aria-label="${ru?'Switch to English':'Переключить на русский'}">${ru?'EN':'RU'}</a><button id="theme-toggle" class="theme-toggle" type="button" aria-label="${ru?'Сменить тему':'Change theme'}"><span aria-hidden="true">◐</span></button></div></div></header><main id="main">${body(c,lang,page)}</main><footer class="site-footer"><div class="wrap footer-inner"><a class="brand" href="${url(lang,'home')}">EryyynIT<span>.</span></a><p>${ru?'Михаил Баркалов · Backend-разработка':'Michael Barkalov · Backend engineering'}</p><div>${link('https://github.com/EryyynIT','GitHub')} ${link('mailto:barkalovmisha@gmail.com','Email')}</div></div></footer></body></html>\n`;
}
for (const lang of ['en','ru']) for (const page of pages) {
  const target = path.join(root, url(lang,page), 'index.html');
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, render(lang,page));
}
console.log(`Generated ${pages.length * 2} pages.`);
