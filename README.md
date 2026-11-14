# personal-hub

**Michael Barkalov / EryyynIT** — a bilingual static portfolio for backend
engineering in Go and Python. It presents confirmed work and experiments: an
early-stage CPA/AdTech platform, a confidential web platform, and small projects
built to understand specific problems.

Plain **HTML + CSS + vanilla JS**, no frameworks and no backend. Every page is
**pre-rendered at build time** from a single content source into static HTML;
JavaScript only handles presentation details such as the light/dark theme toggle
and carrying the query string across a language switch.

## Routes

English is served from the site root; Russian mirrors every route under `/ru/`.

| English | Russian | Content |
| --- | --- | --- |
| `/` | `/ru/` | Introduction, selected work, experience summary, about teaser, contact |
| `/work/` | `/ru/work/` | Experiments with context, stack and repository links |
| `/experience/` | `/ru/experience/` | Engagements described by scope and what was actually built |
| `/about/` | `/ru/about/` | Personal and professional narrative |
| `/resume/` | `/ru/resume/` | Experience and skills in one place, printable to PDF |
| `/contact/` | `/ru/contact/` | Email, Telegram and GitHub |

Every generated page carries its own canonical URL and reciprocal `hreflang`
links to its counterpart.

## Architecture

All bilingual copy, project facts and shared labels live in
`data/portfolio-content.js`. `scripts/prototype-templates.js` is a pure renderer;
the build step combines it with the shared page shell into static HTML:

```
data/portfolio-content.js + scripts/prototype-templates.js
        │  npm run build
        ▼
scripts/generate-site.js
        │
        ├── index.html              ru/index.html
        ├── work/index.html         ru/work/index.html
        ├── experience/index.html   ru/experience/index.html
        ├── about/index.html        ru/about/index.html
        ├── resume/index.html       ru/resume/index.html
        └── contact/index.html      ru/contact/index.html
```

- `data/portfolio-content.js` is a CommonJS module exporting two language trees,
  `en` and `ru`. Both trees have the same shape: `nav`, `hero`, `home`, `work`,
  `experience`, `about`, `resume`, `contact`, `projects[]`, `jobs[]`.
- `scripts/prototype-templates.js` escapes and renders page bodies from the data;
  `scripts/generate-site.js` combines those bodies with the shared shell,
  canonical, `hreflang`, Open Graph and home-page Person metadata.
- The data module is a build-time dependency only. Browsers receive complete
  semantic HTML; no content is fetched or injected at runtime.

## Build

```
npm run build
```

This runs `node scripts/generate-site.js` and rewrites the twelve generated
pages listed above. The generated HTML is committed alongside content changes.
The static build has no runtime dependencies. Browser checks use the pinned
Playwright development dependency; run `npm ci` and `npx playwright install chromium`
once before those checks.

Keep both languages in sync when changing navigation, metadata or page copy.

## Local development and checks

```sh
npm run build
npm run dev          # http://127.0.0.1:4173; serves this repository
npm test             # static route, fact, metadata and local-asset checks
npm run test:browser # starts its own local server; stop npm run dev first
```

Browser checks cover 12 routes, both languages and themes at 320, 390, 768,
820, 1024 and 1440 pixels, menu keyboard behavior, theme persistence,
route-preserving language links, print contacts, reduced motion, no-JS and
unavailable localStorage. Failed checks retain Playwright traces locally.
Language is explicit in the route and all internal links preserve it; direct
English and Russian URLs are never overridden by a stored redirect.

The selected design constraints are documented in `.ui-craft/`. The original
prototype at `/tmp/eryyynit-design-prototype` remains a reference, not the working
site. Old top-level test files target the legacy hub and are not part of the
current `npm test` contract.

## Content rules

The site only states confirmed facts:

- Commercial work is described by scope — what was actually built.
- Clients that cannot be named stay unnamed; no industry is invented.
- Projects are experiments. No benchmarks, users, adoption or results are
  claimed for them.
- Titles are exactly the titles held; no role is inflated.

## Deployment

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push
to `main` and on manual dispatch:

1. `npm test` regenerates all pages from the content and page templates and checks the generated site.
2. The workflow assembles a `public/` artifact containing the six English
   routes, their `/ru/` mirrors, `css/`, `js/`, `assets/`, `favicon.svg`,
   `robots.txt`, `sitemap.xml` and the domain-verification files.
3. Only the current styles, script, local Golos Text fonts and Open Graph images
   are copied; legacy game routes, media and CV PDFs are excluded.
4. The artifact is uploaded and deployed with the official Pages actions.

The outdated CV documents have been removed from the current tree. They remain
in previous Git commits and may exist in earlier published or cached copies;
no history is rewritten. The current resume is `/resume/` or `/ru/resume/`,
with browser print-to-PDF. No downloadable legacy CV is offered.

Verification and ownership files are preserved in the artifact:
`BingSiteAuth.xml`, `googlee26a7f172485daa4.html`,
`yandex_e492c0d3d0daa2af.html`, `ru/BingSiteAuth.xml` and `.well-known/`.

## Structure

```
/
├── index.html                  # generated EN home
├── work/index.html             # generated EN work
├── experience/index.html       # generated EN experience
├── about/index.html            # generated EN about
├── resume/index.html           # generated EN resume
├── contact/index.html          # generated EN contact
├── ru/                         # generated Russian mirror of all six routes
│   ├── index.html
│   ├── work/index.html
│   ├── experience/index.html
│   ├── about/index.html
│   ├── resume/index.html
│   ├── contact/index.html
│   ├── sitemap.xml
│   └── BingSiteAuth.xml
├── css/
│   ├── portfolio.css           # styles for the generated site
│   └── styles.css              # legacy stylesheet
├── js/
│   ├── portfolio.js            # theme toggle and language-switch state
│   └── main.js                 # legacy script
├── data/
│   └── portfolio-content.js    # ← edit content here (EN + RU)
├── scripts/
│   ├── generate-site.js        # page shell and static build
│   └── prototype-templates.js  # bilingual page bodies
├── assets/
│   ├── og/                     # Open Graph images (portfolio-en.png, portfolio-ru.png)
│   └── ...                     # project and legacy media
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── BingSiteAuth.xml
├── googlee26a7f172485daa4.html
├── yandex_e492c0d3d0daa2af.html
├── .well-known/
│   └── discord                 # domain verification
├── .github/workflows/pages.yml # build + GitHub Pages deployment
└── package.json
```

`game/`, `ru/game/`, `assets/game/` and `data/content.js` are legacy sources from
the previous hub. They stay in the repository but are not used by the build and
are not published.

## Languages

- **English (primary)** — served from `/`
- **Russian** — served from `/ru/`

Each page's header links to the same page in the other language; canonical and
`hreflang` metadata are generated with the page, so both language versions stay
directly crawlable. `sitemap.xml` lists all routes, and `ru/sitemap.xml` lists
the Russian ones.
