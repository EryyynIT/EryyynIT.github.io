# personal-hub

**EryyynIT's** personal developer hub — a static site that works as a portfolio,
social links hub and showcase for the indie game **UndeadOverhaul**.

> EryyynIT is the public developer identity (pronounced roughly like "Eryn"). Michael is the person behind it.

The site is structured around **user intent** — every visitor gets a short path to
the context they care about, and each specialized page goes deep from there.

Built with plain **HTML + CSS + vanilla JS**. No frameworks, no backend. All content is
**pre-rendered at build time** from a single content source into static HTML — JavaScript
only adds interactive behavior (theme, menu, language preference, reveal animations).

## Routes

```
/
├── /                  ← home: personal hub (who / selected work / two paths / find me / support)
├── /resume/           ← professional profile (EN, from the source CV)
├── /game/             ← UndeadOverhaul — the indie game (media, team, devlog, support)
└── /ru/               ← Russian versions of all routes (/ru/, /ru/resume/, /ru/game/)
```

```
EryyynIT / Backend Developer · Go / Python
│
├── Hero                 ← who I am (5 seconds)
├── Selected work        ← ADNova · Async Payment Processing Service · queue
│   └── More experiments → MailingTGBot · go-exercises · Tic-Tac-ToeAI
├── Two paths            ← Developer (Resume / GitHub / Work with me) | Game (page / devlog)
├── UndeadOverhaul       ← teaser: 1 asset, status, CTA → /game/
├── About                ← short, human introduction (Who is Michael?)
├── Work with me         ← contact CTA (email / Telegram)
├── Build                ← capabilities (Backend / Infrastructure / Experiments)
├── Workbench            ← terminal-style "currently building"
├── Find me              ← grouped discovery (Code / Game / Personal / Support)
├── Support              ← developer + artist (independent Boosty links)
└── Footer               ← utility layer (X · GitHub · Resume · Game · Artist · Support)

/game/ (UndeadOverhaul)
├── Game hero            ← title, tagline, status, cover
├── Overview             ← honest project description + facts
├── Media                ← screenshots / concept art gallery
├── Team                 ← the two people behind the game
├── Follow               ← Telegram devlog + team socials
├── Support              ← developer + artist (prominent here)
└── Footer               ← back to hub, resume, GitHub, Telegram, artist, support

/resume/ (professional profile, unchanged second layer)
├── /resume/             ← EN professional profile (from MichaelBarkalov_CV.pdf)
├── /ru/resume/          ← RU professional profile (from БаркаловМихаил_CV.pdf)
├── assets/cv/           ← downloadable PDF CVs (source documents, unmodified)
└── contact: email · Telegram · GitHub
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
       ├── index.html        ← pre-rendered EN home
       ├── ru/index.html     ← pre-rendered RU home
       ├── resume/index.html ← EN professional profile
       ├── ru/resume/index.html ← RU professional profile
       ├── game/index.html   ← EN UndeadOverhaul page
       └── ru/game/index.html ← RU UndeadOverhaul page
```

The browser receives fully pre-rendered semantic HTML — every project, link, team member,
social and footer entry is in the raw HTML. No JavaScript is required to see any content.
`data/content.js` is a build-time dependency only and is not shipped to the browser.

## Languages

- **English (primary)** — `/`, `/resume/`, `/game/`
- **Russian** — `/ru/`, `/ru/resume/`, `/ru/game/`

All pages are generated from `data/content.js` (`CONTENT_EN` and `CONTENT_RU`). The
compact `EN / RU` switcher in the header is **route-aware**: switching language never
changes the page context (home ↔ home, resume ↔ resume, game ↔ game), preserves the
query string, and carries the current viewport position over.

**Automatic language selection** — the site matches the visitor's browser language on the
first visit: Russian-speaking visitors are sent from `/` to `/ru/`, and non-Russian-speaking
visitors who land on `/ru/` are sent back to `/`. An explicit choice made via the switcher
is remembered in `localStorage` and always takes precedence. Crawlers and robots are never
redirected, so every language route stays directly crawlable.

## Features

- **Light / dark themes** — toggle, saved to `localStorage`, defaults to `prefers-color-scheme`
- **Responsive** — 320px → 1440px+, mobile hamburger menu
- **Pre-rendered content** — build areas, projects, paths, workbench, game teaser, team,
  socials, support and footer are static HTML generated from `data/content.js` (EN + RU);
  no runtime content rendering
- **Project hierarchy** — featured grid (selected work) + compact rows (experiments)
- **Two paths** — an explicit developer / game fork on the home page
- **Dedicated game page** — UndeadOverhaul has its own route with media, team, devlog and support
- **SEO** — content in raw HTML, semantic HTML, Open Graph (per-language 1200×630 image),
  Twitter card, canonical, hreflang, favicon, sitemap, robots.txt
- **Accessible** — skip link, aria labels, focus states, keyboard navigation, `prefers-reduced-motion`
- **Fast** — zero external dependencies, inline SVG icons, local placeholder assets

## Structure

```
/
├── index.html              # generated English home (build artifact)
├── resume/                 # generated English resume (build artifact)
├── game/                   # generated English UndeadOverhaul page (build artifact)
├── ru/
│   ├── index.html          # generated Russian home (build artifact)
│   ├── resume/             # generated Russian resume (build artifact)
│   └── game/               # generated Russian UndeadOverhaul page (build artifact)
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

Everything editable lives in `data/content.js` — identity, build areas, projects,
paths, workbench, game info, team, socials, support, footer and UI labels, in **both**
languages:

- `CONTENT_EN` — English (primary)
- `CONTENT_RU` — Russian

After editing, regenerate the static pages:

```
npm run build
```

This rewrites `index.html`, `ru/index.html`, `resume/index.html`, `ru/resume/index.html`,
`game/index.html` and `ru/game/index.html` from `data/content.js` (relative asset paths
are resolved per language automatically). Commit the regenerated HTML together with your
content change.

## Test

```
npm test
```

Runs `scripts/generate-site.js` first, then:

- `test/smoke.test.js` — reads the generated home HTML directly (no JS execution) and
  verifies all core content is present in raw HTML, semantic structure is intact, relative
  asset URLs resolve, and no stale containers / URLs remain.
- `test/lang-redirect.test.js` — verifies the auto language selection for the home pages:
  explicit choice wins, browser language drives the initial route, crawlers are never redirected.
- `test/resume.test.js` — the same pre-render + language checks for `/resume/` and `/ru/resume/`.
- `test/game.test.js` — the same pre-render + language checks for `/game/` and `/ru/game/`.
- `test/nav-state.test.js` — statically verifies the route-aware language switcher contract
  (home / resume / game routes, viewport carry-over, no hardcoded redirects).
