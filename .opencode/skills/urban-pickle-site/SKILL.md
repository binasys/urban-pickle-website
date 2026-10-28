---
name: urban-pickle-site
description: Use when editing, adding or restyling pages, navigation, header/footer, CSS, JavaScript, images or deployment of the Urban Pickle website (Eleventy static site in src/ built to dist/). Covers src/*.html pages, src/_includes/*.njk, src/_data/site.json, src/assets/css/site.css and src/assets/js/.
---

# Urban Pickle website: how to work on it

A plain static HTML/CSS/JS site. Eleventy runs **only at build time** to wrap each page in a shared
layout. Visitors get static files from `dist/`. Never add a runtime framework, server code, bundler
or client-side router.

## Golden rules

1. **Edit `src/`, never `dist/`.** `dist/` is generated and git-ignored.
2. **One page = one file** in `src/<name>.html`, containing front matter + the `<main>` content only.
   No `<html>`, `<head>`, header or footer in page files; those come from
   `src/_includes/layouts/base.njk`.
3. **Relative, root-level paths.** Pages are at the site root: `href="pricing.html"`,
   `src="assets/images/x.webp"`. No leading `/` and no pretty URLs (`/pricing/`). JS that builds
   URLs to assets uses the same `assets/...` form.
4. **CSS order is the cascade.** `src/assets/css/site.css` is eight former stylesheets in their
   original load order, and later sections override earlier ones. Add new rules to the end of the
   most specific relevant section. Do not reorder sections or "dedupe" rules without a visual check.
5. **Fonts via variables:** `font-family: var(--display)` / `var(--body)`, never literal names.
6. **Images:** WebP for raster, SVG for diagrams. Descriptive names with no versions, dates or pixel
   sizes. Put them in `src/assets/images/` (feature illustrations in `images/feature-art/`).
7. **No git commands** unless the user explicitly asks.

## Page front matter

```yaml
---
title: "Pricing — Urban Pickle"
description: "…"
pageId: "pricing" # body[data-page]; CSS targets it; matches mainNav id for aria-current
headerHeight: 77 # 85 on home
bodyClass: "on-home" # home only
courtScene: true # home only: loads court-scene.js, court-scene-config.js, home-cinema.js
---
```

Defaults (`layout`, `permalink: {{ page.filePathStem }}.html`) live in `src/src.11tydata.json`.
Page bodies are rendered with Nunjucks, so a literal `{{` or `{%` in content must be wrapped in
`{% raw %}…{% endraw %}`.

## Common tasks

| Task                       | Where                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Change page copy           | `src/<page>.html`                                                                         |
| Add a page                 | New `src/<name>.html`; add to `mainNav` in `src/_data/site.json` if it belongs in the nav |
| Footer links               | `src/_includes/partials/footer.njk`                                                       |
| Phone, booking URL, nav    | `src/_data/site.json` (use `{{ site.phone }}` etc. in templates)                          |
| `<head>`, global CSS/JS    | `src/_includes/layouts/base.njk`                                                          |
| Logo markup                | `src/_includes/partials/logo.njk`                                                         |
| Prices in booking estimate | `RATES` in `src/assets/js/site.js`. Keep in sync with `src/pricing.html`                  |

## Scripts (`src/assets/js/`)

- `brand-query.js`: runs first in `<body>`; sets `data-brand`/`data-compare` from the query string.
- `site.js`: mobile menu, Escape to close, footer year, booking estimator (only when `data-page="book"`).
- `motion.js`: header `is-scrolled`, reveal/scroll effects; respects `prefers-reduced-motion`.
- `brand-options.js`: brand switcher links in `.brand-comparison`.
- Home only: `court-scene.js` (minified renderer, exposes `window.UPCourt`; do not hand-edit),
  `court-scene-config.js` (`window.__UP_LOGO_URL__`, `__UP_TEXTURE_URL__`), `home-cinema.js`
  (scroll-driven sequence; falls back to a static image if the scene fails).

## Verify every change

```sh
npm run format   # Prettier (skips *.njk and images)
npm run lint     # Prettier check + Stylelint + build + HTMLHint on dist/
npm start        # http://localhost:8080. Check affected pages at desktop and ~390px mobile
```

Before finishing, check that:

- The browser console has no errors and the network tab has no 404s.
- When renaming or moving an asset, a search of `src/` finds no remaining references to the old
  path.
- The homepage court animation still runs, and the reduced-motion and static fallbacks still work.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys `dist/` to GitHub Pages on every
push to `main`. Pull requests into `main` only build and lint. Only a build failure blocks deployment;
lint is reported but non-blocking, so still run `npm run lint` locally. Keep all paths relative: the
site is served from `/urban-pickle-website/` until the custom domain `www.urbanpickle.com.my` (primary; bare domain redirects to it) is set up.
Do not add `src/CNAME` until the user confirms the domain is bought (see README.md, "Deploying").
