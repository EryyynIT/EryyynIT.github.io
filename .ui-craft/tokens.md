# Selected design tokens

The code source of truth is `css/portfolio.css`. These document the owner-selected prototype, not a new palette proposal.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas `--bg` | #f5f7f6 | #111a18 |
| Surface `--surface` | #ffffff | #1b2824 |
| Quiet section `--quiet` | #e7efeb | #17221e |
| Primary text `--ink` | #182623 | #edf3ef |
| Secondary text `--muted` | #475b53 | #b3c5bb |
| Links / focus `--accent` | #096456 | #8ad6be |
| Dividers `--line` | #cbd6d0 | #3e5148 |
| Accent text `--on-accent` | #ffffff | #10251c |

- Golos Text 400–600, self-hosted WOFF2 Latin and Cyrillic subsets with SIL OFL.
- Hero display 48–88px, weight 500, tight tracking; body 18px / 1.65; metadata 14–15px.
- Content width 1200px, desktop gutters 40px, mobile gutters 20px.
- Spacing primitives: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px.
- Primary button: radius 6px, min-height 50px. Context rails and project rows are editorial layouts, not cards.
- Motion: 120ms color feedback, no entrance/scroll animation; reduced-motion disables transitions and smooth scroll.
- Print: neutral white canvas, dark text, 15mm page margins and visible contact details.

Existing token coverage: semantic color and spacing present; type/radius/motion mostly component declarations. Do not mechanically expand the system or add shadows to editorial rows just to satisfy a generic checklist.
