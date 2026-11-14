'use strict';

/*
   Build-time page bodies for the EryyynIT portfolio.

   A CommonJS translation of the isolated design reference (app.js). It
   renders only the main content fragment: no site header, footer, <main>
   shell, page wrapper or script. The generator owns those.

   All copy and facts come from data/portfolio-content.js. This module is a
   renderer only: it holds labels, routes, markup and escaping, never a
   sentence of copy.

   All internal links are static routes:
     /, /work/, /experience/, /about/, /resume/, /contact/
   and their /ru/ equivalents, with the original anchors preserved.

   Public API:
     const { renderBody } = require('./prototype-templates');
     renderBody('en', 'home') // => HTML string

   The module is pure: it has no browser or storage dependencies and no
   top-level side effects.
*/

const content = require('../data/portfolio-content.js');

const LANGS = ['en', 'ru'];
const PAGES = ['home', 'work', 'experience', 'about', 'resume', 'contact'];

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return ESCAPES[character];
  });
}

function route(lang, page, hash) {
  const prefix = lang === 'ru' ? '/ru/' : '/';
  const suffix = page === 'home' ? '' : page + '/';
  return prefix + suffix + (hash || '');
}

/* Headings may break across lines. Lines are the only place a <br> is
   emitted, and the break is declared in the data, not inferred. */
function headingLines(lines) {
  return lines.map(esc).join('<br>');
}

function createContext(lang) {
  const tree = content[lang];

  function internal(label, page, hash, cls) {
    return '<a class="' + esc(cls || 'text-link internal') + '" href="' +
      esc(route(lang, page, hash || '')) + '">' + esc(label) + '</a>';
  }

  function external(label, href, cls) {
    return '<a class="' + esc(cls || 'text-link') + '" href="' + esc(href) +
      '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>';
  }

  return { lang: lang, c: tree, contacts: content.contacts, internal: internal, external: external };
}

function rail(ctx, context, evidence) {
  const labels = ctx.c.ui;
  return '<dl class="rail"><div><dt>' + esc(labels.context) + '</dt><dd>' + esc(context) +
    '</dd></div><div><dt>' + esc(labels.evidence) + '</dt><dd>' + esc(evidence) +
    '</dd></div></dl>';
}

function projectFeature(ctx, project) {
  return '<article class="project-feature" id="' + esc(project.id) +
    '"><div><div class="label">' + esc(project.kind) + '</div><h3>' + esc(project.name) +
    '</h3><p>' + esc(project.description) + '</p>' +
    ctx.external(ctx.c.ui.repository, project.url) + '</div>' +
    rail(ctx, project.rail.context, project.rail.evidence) + '</article>';
}

function projectRow(ctx, project) {
  return '<article class="project-row" id="' + esc(project.id) +
    '"><div><div class="label">' + esc(project.kind) + '</div><h3>' + esc(project.name) +
    '</h3></div><p>' + esc(project.description) + '</p>' +
    ctx.external(ctx.c.ui.repository, project.url) + '</article>';
}

function projectList(ctx) {
  return ctx.c.projects.map(function (project, index) {
    return index === 0 ? projectFeature(ctx, project) : projectRow(ctx, project);
  }).join('');
}

function experienceMinis(ctx) {
  return ctx.c.jobs.map(function (job) {
    return '<article class="experience-mini"><div class="label">' + esc(job.dates) +
      '</div><h3>' + esc(job.homeName || job.name) + '</h3><p>' + esc(job.blurb) +
      '</p></article>';
  }).join('');
}

function experienceEntry(ctx, job) {
  const ui = ctx.c.ui;
  return '<article class="experience" id="' + esc(job.id) + '">' +
    rail(ctx, job.context, ui.privateRoleEvidence) +
    '<div><div class="label">' + esc(job.dates) + '</div><h3>' + esc(job.name) +
    '</h3><p class="role">' + esc(job.roleLine) + '</p>' +
    job.paragraphs.map(function (paragraph) {
      return '<p>' + esc(paragraph) + '</p>';
    }).join('') +
    (job.status ? '<p class="maturity">' + esc(job.status) + '</p>' : '') +
    ctx.internal(ui.detailsInResume, 'resume', '#' + job.id) +
    '</div></article>';
}

function resumeEntry(ctx, job) {
  return '<article class="resume-entry" id="' + esc(job.id) + '"><h3>' + esc(job.name) +
    '</h3><div class="meta"><div>' + esc(job.dates) + '</div><div>' + esc(job.roleLine) +
    '</div></div><ul>' +
    job.resumePoints.map(function (point) {
      return '<li>' + esc(point) + '</li>';
    }).join('') +
    '</ul>' + (job.status ? '<p class="meta">' + esc(job.status) + '</p>' : '') +
    '</article>';
}

function contactSection(ctx) {
  const c = ctx.c;
  const contacts = ctx.contacts;
  const address = [contacts.email, contacts.telegramHandle, contacts.githubHandle].join(' · ');
  return '<section class="contact" id="contact"><h2>' + esc(c.contact.sectionTitle) +
    '</h2><div><p>' + esc(c.contact.sectionText) +
    '</p><div class="actions"><a class="text-link" href="' + esc(contacts.emailHref) + '">' +
    esc(c.ui.email) + '</a>' +
    ctx.external(c.ui.telegram, contacts.telegramHref) +
    ctx.external(c.ui.github, contacts.githubHref) +
    '</div><div class="contact-address">' + esc(address) + '</div></div></section>';
}

function contact(ctx) {
  return '<div class="wrap">' + contactSection(ctx) + '</div>';
}

function home(ctx) {
  const c = ctx.c;
  const hero = c.hero;
  return '<div class="wrap"><section class="hero"><p class="identity">' + esc(hero.identity) +
    '</p><h1>' + headingLines(hero.heading) + '</h1><p class="intro">' + esc(hero.intro) +
    '</p><div class="hero-bottom"><div><div class="actions">' +
    ctx.internal(hero.primary.label, hero.primary.page, '', 'primary') +
    ctx.internal(hero.secondary.label, hero.secondary.page) +
    '</div><div style="margin-top:12px">' +
    ctx.internal(hero.tertiary.label, hero.tertiary.page) +
    '</div></div><p class="hero-note"><span>' + esc(hero.noteTitle) + '</span>' +
    esc(hero.note) +
    '</p></div></section><section class="section" id="selected-work"><div class="section-top"><h2>' +
    esc(c.home.workTitle) + '</h2>' + ctx.internal(c.home.workLink, 'work') + '</div>' +
    projectList(ctx) +
    '</section></div><section class="section quiet" id="professional"><div class="wrap"><div class="section-top"><div><h2>' +
    esc(c.home.experienceTitle) + '</h2><p class="section-copy">' +
    esc(c.home.experienceCopy) + '</p></div></div><div class="experience-preview">' +
    experienceMinis(ctx) +
    '</div><div class="experience-bottom">' +
    ctx.internal(c.home.experienceLink, 'experience') +
    '</div></div></section><div class="wrap"><section class="section about-preview" id="about-preview"><h2>' +
    headingLines(c.home.aboutHeading) + '</h2><div><p>' + esc(c.home.aboutText) + '</p>' +
    ctx.internal(c.home.aboutLink, 'about') + '</div></section></div>' + contact(ctx);
}

function work(ctx) {
  const c = ctx.c;
  return '<div class="wrap"><header class="page-head"><h1>' + esc(c.work.title) +
    '</h1><p>' + esc(c.work.intro) + '</p><div class="actions">' +
    ctx.internal(c.work.projectsLink, 'work', '#projects') +
    ctx.internal(c.work.experienceLink, 'work', '#experience') +
    '</div></header><section class="work-section" id="projects"><h2>' +
    esc(c.work.projectsTitle) + '</h2>' + projectList(ctx) +
    '</section><section class="work-section" id="experience"><h2>' +
    esc(c.work.experienceTitle) +
    '</h2><article class="experience" id="experience-summary">' +
    rail(ctx, c.work.experienceContext, c.work.experienceEvidence) +
    '<div><p>' + esc(c.work.experienceSummary) +
    '</p>' + ctx.internal(c.work.experienceMore, 'experience') +
    '</div></article></section></div>' + contact(ctx);
}

function experiencePage(ctx) {
  const c = ctx.c;
  return '<div class="wrap"><header class="page-head"><p class="identity">' +
    esc(c.experience.identity) + '</p><h1>' + esc(c.experience.title) + '</h1><p>' +
    esc(c.experience.intro) +
    '</p></header><section class="work-section" id="experience"><h2>' +
    esc(c.experience.rolesTitle) + '</h2>' +
    c.jobs.map(function (job) {
      return experienceEntry(ctx, job);
    }).join('') + '</section></div>' + contact(ctx);
}

function about(ctx) {
  const c = ctx.c;
  const entry = c.about;
  const paragraphs = entry.paragraphs.map(function (paragraph) {
    return '<p>' + esc(paragraph) + '</p>';
  }).join('');
  const storyParagraphs = entry.storyParagraphs.map(function (paragraph) {
    return '<p>' + esc(paragraph) + '</p>';
  }).join('');
  return '<div class="wrap"><header class="page-head"><p class="identity">' +
    esc(entry.identity) + '</p><h1>' + headingLines(entry.heading) +
    '</h1></header><div class="about-layout"><aside class="about-aside"><strong>' +
    esc(entry.asideBrand) + '</strong>' + esc(entry.asideText) +
    '<div style="margin-top:20px">' +
    ctx.external(c.ui.github, ctx.contacts.githubHref) +
    '</div></aside><article class="about-story">' + paragraphs + '<h2>' +
    esc(entry.storyTitle) + '</h2>' + storyParagraphs +
    ctx.internal(entry.cta, 'work') + '</article></div></div>' + contact(ctx);
}

function resumePage(ctx) {
  const c = ctx.c;
  const resume = c.resume;
  const contacts = ctx.contacts;
  return '<div class="wrap"><header class="page-head"><p class="identity">' +
    esc(resume.identity) + ' · <a href="' + esc(contacts.emailHref) + '">' +
    esc(contacts.email) + '</a></p><h1>' + esc(resume.title) + '</h1><p>' +
    esc(resume.intro) + '</p><div class="actions"><a class="text-link" href="' +
    esc(contacts.emailHref) + '">' + esc(c.ui.email) + '</a><a class="text-link" href="' +
    esc(contacts.telegramHref) + '">' + esc(c.ui.telegram) +
    '</a><button class="text-link" id="print">' + esc(resume.printLabel) +
    '</button></div><p class="print-contact" hidden><a href="' + esc(contacts.emailHref) +
    '">' + esc(contacts.email) + '</a> · <a href="' + esc(contacts.telegramHref) + '">' +
    esc(c.ui.telegram) + ' · ' + esc(contacts.telegramHandle) +
    '</a></p></header><div class="resume-grid"><nav class="resume-index" aria-label="' +
    esc(resume.indexLabel) + '">' +
    resume.index.map(function (item) {
      return '<a href="' + esc(item.href) + '">' + esc(item.label) + '</a>';
    }).join('') +
    '</nav><div class="resume-body"><section id="summary"><h2>' +
    esc(resume.summaryTitle) + '</h2><p>' + esc(resume.summary) +
    '</p></section><section id="experience"><h2>' + esc(resume.experienceTitle) + '</h2>' +
    c.jobs.map(function (job) {
      return resumeEntry(ctx, job);
    }).join('') +
    '</section><section id="skills"><h2>' + esc(resume.skillsTitle) +
    '</h2><dl class="skills">' +
    resume.skillGroups.map(function (group) {
      return '<dt>' + esc(group.term) + '</dt><dd>' + esc(group.value) + '</dd>';
    }).join('') + '</dl></section></div></div></div>' + contact(ctx);
}

function contactPage(ctx) {
  return '<div class="wrap"><header class="page-head"><p class="identity">' +
    esc(ctx.contacts.brand) + '</p><h1>' + esc(ctx.c.contact.title) +
    '</h1></header>' + contactSection(ctx) + '</div>';
}

function renderBody(lang, page) {
  if (LANGS.indexOf(lang) === -1) {
    throw new RangeError('renderBody: unsupported language "' + lang + '"');
  }
  if (PAGES.indexOf(page) === -1) {
    throw new RangeError('renderBody: unsupported page "' + page + '"');
  }

  const ctx = createContext(lang);
  switch (page) {
    case 'home':
      return home(ctx);
    case 'work':
      return work(ctx);
    case 'experience':
      return experiencePage(ctx);
    case 'about':
      return about(ctx);
    case 'resume':
      return resumePage(ctx);
    case 'contact':
      return contactPage(ctx);
    default:
      throw new RangeError('renderBody: unsupported page "' + page + '"');
  }
}

module.exports = { renderBody: renderBody };