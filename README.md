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

The site is deployed to **GitHub Pages** by `.github/workflows/deploy.yml`:

| Event                    | What happens                         |
| ------------------------ | ------------------------------------ |
| Push to `main`           | Build, lint (report only), deploy    |
| Pull request into `main` | Build and lint only, no deploy       |
| Manual run (Actions tab) | Build and deploy, when run on `main` |
| Push to `dev` or others  | Nothing                              |

Only a **failed build** stops a deploy. Formatting, CSS and HTML lint failures appear as failed steps
in the run, but the site is still published. Run `npm run lint` locally to see them.

Live URL: `https://binasys.github.io/urban-pickle-website/` (until the custom domain is set up).
All links are relative, so the site works both in that subfolder and on its own domain.

`src/.nojekyll` is copied to `dist/` so GitHub serves the files as they are, without Jekyll.

### One-time GitHub setup

1. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
2. Push or merge to `main`. The run's `deploy` job shows the live URL.

### Custom domain checklist (`www.urbanpickle.com.my`, not bought yet)

The main address is **`www.urbanpickle.com.my`**. The bare domain `urbanpickle.com.my` redirects to
it.

Do **not** add a `CNAME` file before owning the domain; the site would redirect to a domain that
doesn't resolve.

1. Buy `urbanpickle.com.my`.
2. Optional but recommended: verify `urbanpickle.com.my` under your GitHub account (or the `binasys`
   organisation) **Settings → Pages → Verified domains**, so nobody else can claim it.
3. At the DNS provider, add:
   - `CNAME` record for `www` → `binasys.github.io` (this serves the main address)
   - `A` records for the bare domain `urbanpickle.com.my` (`@`) → `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (needed so it can redirect to `www`)
   - Optionally `AAAA` for `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`,
     `2606:50c0:8002::153`, `2606:50c0:8003::153`
4. Create `src/CNAME` containing the single line `www.urbanpickle.com.my`, and add
   `eleventyConfig.addPassthroughCopy("src/CNAME");` to `eleventy.config.js`.
5. In **Settings → Pages → Custom domain**, enter `www.urbanpickle.com.my` and save. With `www` as
   primary, GitHub redirects `urbanpickle.com.my` to it automatically, as long as the `A` records
   above exist.
6. Once the DNS check passes and the certificate is issued (can take up to 24 hours), tick
   **Enforce HTTPS**.

### Other hosts

To deploy elsewhere (Netlify, Cloudflare Pages, Vercel), use build command `npm run build`, publish
directory `dist` and Node 20 or later. To deploy by hand, run `npm run build` and upload the
contents of `dist/`.

External booking (Courtsite), WhatsApp, directions, social links and the embedded map need an
internet connection. The booking page only shows an estimate; reservations go through Courtsite.

## Fonts

Playfair Display, Work Sans and Barlow are self-hosted under the SIL Open Font License 1.1. The
licence texts are in `src/assets/fonts/*-OFL.txt` and must ship alongside the font files.
