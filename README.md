# Urban Pickle website

Marketing site for Urban Pickle, a pickleball club on Jalan Tun Razak, Kuala Lumpur.

The site is **plain static HTML, CSS and JavaScript**. [Eleventy](https://www.11ty.dev/) runs only
at build time to stitch a shared layout (head, header, footer, scripts) around each page's content.
The output in `dist/` has no server code, framework or runtime dependency and can be hosted anywhere
that serves files.

## Quick start

Requires Node.js 20 or later.

```sh
npm install
npm start        # dev server with live reload at http://localhost:8080
npm run build    # writes the finished site to dist/
```

## Project structure

```
src/                         Everything that ends up on the site
  index.html, about.html …   One file per page: front matter + the page's <main> content
  src.11tydata.json          Defaults for all pages (layout, output file name)
  _data/site.json            Shared data: navigation, phone number, booking URL, brand options
  _includes/
    layouts/base.njk         The page shell: <head>, CSS/JS includes, header, footer
    partials/header.njk      Brand switcher, concept bar, site header, desktop + mobile nav
    partials/footer.njk      Footer, mobile "Book a court" bar, <noscript> fallback
    partials/logo.njk        Logo block (used by header and footer)
  assets/                    Copied to dist/assets/ unchanged
    css/site.css             All styles, one file (see "CSS" below)
    js/                      Scripts (see "JavaScript" below)
    images/                  Photos, illustrations, logos (WebP + SVG)
    fonts/                   Self-hosted WOFF2 fonts and their OFL licences
    favicon.svg
eleventy.config.js           Build configuration
dist/                        Build output (git-ignored, never edit by hand)
```

## Editing

### Change a page's content

Edit the page in `src/`, e.g. `src/pricing.html`. Everything below the front matter is the page's
`<main>` content. The page is plain HTML, and you can also use
[Nunjucks](https://mozilla.github.io/nunjucks/) tags such as `{{ site.phone }}`.

### Front matter fields

```yaml
---
title: "Pricing — Urban Pickle" # <title>
description: "…" # <meta name="description">
pageId: "pricing" # <body data-page>, used by CSS and to highlight the nav item
headerHeight: 77 # initial --header-height (JS updates it at runtime)
bodyClass: "on-home" # optional extra <body> class (home page only)
courtScene: true # optional: load the homepage court animation scripts
---
```

### Add a page

1. Create `src/<name>.html` with the front matter above and its content. It is built to
   `dist/<name>.html`.
2. To show it in the main navigation, add `{ "id": "<name>", "label": "…" }` to `mainNav` in
   `src/_data/site.json`. Footer links are in `src/_includes/partials/footer.njk`.

### Change the header, footer or `<head>`

Edit the files in `src/_includes/`. The change applies to every page on the next build.

### Links and asset paths

All pages are at the site root, so links are relative: `href="pricing.html"`,
`src="assets/images/entrance.webp"`. Keep that convention; it lets `dist/` work from any folder,
including opened straight from disk.

## CSS

`src/assets/css/site.css` combines eight stylesheets that used to load one after another. The
sections are kept **in their original order** and marked with `/* ==== … ==== */` headers. Later
sections deliberately override earlier ones, so the order matters:

1. base: fonts, tokens, layout
2. motion: sticky header, reveal and scroll effects
3. brand: 2025 green/beige palette and type
4. customer-facing layout system
5. home: illustrated homepage and court cinema
6. desktop page layouts
7. shared white / forest / lime UI palette
8. full-width page spacing

Use `var(--display)` and `var(--body)` for fonts rather than font names.

## JavaScript

| File                       | Loaded on  | Purpose                                                  |
| -------------------------- | ---------- | -------------------------------------------------------- |
| `js/brand-query.js`        | every page | Reads `?brand=` / `?compare=` before first paint         |
| `js/site.js`               | every page | Mobile menu, footer year, booking-page price estimator   |
| `js/motion.js`             | every page | Header scroll state, reveal animations                   |
| `js/brand-options.js`      | every page | Brand switcher links, shown with `?compare=1`            |
| `js/court-scene.js`        | home only  | Court illustration renderer (`window.UPCourt`), minified |
| `js/court-scene-config.js` | home only  | Image URLs used by the court scene                       |
| `js/home-cinema.js`        | home only  | Scroll-driven homepage court sequence and its fallback   |

## Images

- Use **WebP** for photos and raster art, and **SVG** for diagrams and icons.
- Name files by what they show (`courts-detail-wide.webp`), not by version, date or pixel size.
- Convert with `cwebp -q 85 photo.jpg -o photo.webp`, or `cwebp -lossless` for logos and flat art.

## Quality checks

```sh
npm run format        # Prettier: format src/, configs and docs
npm run lint          # Prettier check, Stylelint (CSS), build, HTMLHint on dist/
```

Stylelint uses `stylelint-config-recommended` with two rules turned off,
`no-descending-specificity` and `no-duplicate-selectors`. The layered override structure of
`site.css` breaks both by design. Prettier skips `*.njk` (unsupported) and `src/assets/images/`.

## Deploying

The host has to run the build and publish `dist/`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20 or later

This works as is on Netlify, Cloudflare Pages and Vercel. On GitHub Pages, use a GitHub Actions
workflow that runs the build and uploads `dist/`. To deploy by hand, run `npm run build` and upload
the contents of `dist/`.

External booking (Courtsite), WhatsApp, directions, social links and the embedded map need an
internet connection. The booking page only shows an estimate; reservations go through Courtsite.

## Fonts

Playfair Display, Work Sans and Barlow are self-hosted under the SIL Open Font License 1.1. The
licence texts are in `src/assets/fonts/*-OFL.txt` and must ship alongside the font files.
