# personal-hub

**EryyynIT's** personal developer hub — a static one-page site that works as a portfolio,
social links hub and showcase for the indie game **UndeadOverhaul**.

> EryyynIT is the public developer identity (pronounced roughly like "Eryn"). Michael is the person behind it.

Built with plain **HTML + CSS + vanilla JS**. No frameworks, no backend. All content is
**pre-rendered at build time** from a single content source into static HTML — JavaScript
only adds interactive behavior (theme, menu, language preference, reveal animations).

```
EryyynIT / Backend Developer · Go / Python
│
├── About
├── Work with me (contact CTA)
├── What I build (Backend / Infrastructure / Experiments)
├── Projects
│   ├── Selected work
│   │   ├── UndeadOverhaul (flagship — game)
│   │   ├── ADNova (commercial · AdTech)
│   │   ├── Async Payment Processing Service (FastAPI / RabbitMQ)
│   │   └── queue (Go)
│   └── More experiments
│       ├── MailingTGBot
│       ├── go-exercises
│       └── Tic-Tac-ToeAI
├── Currently building
├── Game (UndeadOverhaul)
├── Find me (GitHub · Boosty · X · TikTok · Telegram)
└── Support
```

## Architecture

Content is authored once in `data/content.js` and turned into static HTML by a small
build step:

```
data/content.js          ← single source of truth (EN + RU)
       │  npm run build
       ▼
scripts/generate-site.js
       │
       ├── index.html    ← pre-rendered EN page
       └── ru/index.html ← pre-rendered RU page
```

The browser receives fully pre-rendered semantic HTML — every project, link, team member,
social and footer entry is in the raw HTML. No JavaScript is required to see any content.
`data/content.js` is a build-time dependency only and is not shipped to the browser.

## Languages

- **English (primary)** — `index.html` at the site root (`https://eryyynit.github.io/`)
- **Russian** — `ru/index.html` (`https://eryyynit.github.io/ru/`)

Both pages are generated from `data/content.js` (`CONTENT_EN` and `CONTENT_RU`). The
compact `EN / RU` switcher in the header links between the two versions.

**Automatic language selection** — the site matches the visitor's browser language on the
first visit: Russian-speaking visitors are sent from `/` to `/ru/`, and non-Russian-speaking
visitors who land on `/ru/` (for example via a link shared from the Russian version) are sent
back to `/`. An explicit choice made via the `EN / RU` switcher is remembered in `localStorage`
and always takes precedence over auto-detection. Crawlers and robots are never redirected, so
both `/` and `/ru/` stay directly crawlable as valid pages.

## Features

- **Light / dark themes** — toggle, saved to `localStorage`, defaults to `prefers-color-scheme`
- **Responsive** — 320px → 1440px+, mobile hamburger menu
- **Pre-rendered content** — build areas, projects, current work, team, socials, support and footer are static HTML generated from `data/content.js` (EN + RU); no runtime content rendering
- **Project hierarchy** — flagship card, featured grid, compact rows (commercial / selected work / experiments)
- **SEO** — content in raw HTML, semantic HTML, Open Graph (per-language 1200×630 image), Twitter card, canonical, hreflang, favicon, sitemap, robots.txt
- **Accessible** — skip link, aria labels, focus states, keyboard navigation, `prefers-reduced-motion`
- **Fast** — zero external dependencies, inline SVG icons, local placeholder assets

## Structure

```
/
├── index.html              # generated English page (build artifact)
├── ru/
│   └── index.html          # generated Russian page (build artifact)
├── css/
│   └── styles.css          # design tokens (colors) in :root / [data-theme="dark"]
├── js/
│   └── main.js             # interactive behavior only: theme, menu, lang choice, reveal, active nav
├── data/
│   └── content.js          # ← edit content here (single source of truth, EN + RU)
├── scripts/
│   └── generate-site.js    # build step: content.js → pre-rendered HTML
├── assets/
│   ├── game/               # UndeadOverhaul media (placeholders now)
│   ├── projects/           # project card covers (placeholders now)
│   ├── og/                 # Open Graph images (text-generated SVG + PNG render)
│   ├── images/             # legacy og-cover placeholder
│   ├── profile/            # reserved
│   └── icons/              # reserved
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── package.json            # npm run build / npm test
└── .github/workflows/pages.yml
```

## Edit content

Everything editable lives in `data/content.js` — identity, build areas, projects, current
work, game info, team, socials, support, footer and UI labels, in **both** languages:

- `CONTENT_EN` — English (primary)
- `CONTENT_RU` — Russian

After editing, regenerate the static pages:

```
npm run build
```

This rewrites `index.html` and `ru/index.html` from `data/content.js` (relative asset paths
are resolved per language automatically). Commit the regenerated HTML together with your
content change.

## Test

```
npm test
```

Runs `scripts/generate-site.js` first, then:

- `test/smoke.test.js` — reads the generated HTML directly (no JS execution) and verifies
  that all core content is present in raw HTML, semantic structure is intact, relative
  asset URLs resolve, and no stale containers / URLs remain.
- `test/lang-redirect.test.js` — verifies the auto language selection: explicit choice wins,
  browser language drives the initial route, and crawlers are never redirected.
