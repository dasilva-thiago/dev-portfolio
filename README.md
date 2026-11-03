# Thiago da Silva — Developer Portfolio

A multilingual, accessible developer portfolio built with React, TypeScript and Tailwind CSS, pre-rendered to static HTML for every route.

**Live:** [dasilva-thiago.dev](https://www.dasilva-thiago.dev)

---

## Highlights

- **Static output, real routes.** Every page is pre-rendered at build time with React Router (`ssr: false` + `prerender`): the home page and the five project pages, each in English, Portuguese and Spanish, plus a real `404.html`. No runtime server, no client-only shell for crawlers.
- **Clean, localized URLs.** `/`, `/pt`, `/es` and `/projects/<slug>` under each locale. Language is part of the URL; switching language is a navigation that keeps the page and the scroll position.
- **Per-page SEO.** Title, description, canonical URL, `hreflang` alternates, Open Graph and Twitter cards, JSON-LD (`ProfilePage` / `Person` / `WebSite` on the home page, `SoftwareSourceCode` / `BreadcrumbList` on project pages), and a `sitemap.xml` generated from the same route data.
- **Strict Content-Security-Policy.** Delivered per page as a `<meta>` tag; every inline script is allow-listed by SHA-256 hash computed at build time. No `'unsafe-inline'` or `'unsafe-eval'` for scripts.
- **No flash of the wrong theme or language.** A tiny synchronous script in `<head>` applies the stored/system theme and sends a first-time visitor at `/` to `/pt` or `/es` before anything paints.
- **Accessibility.** Dark mode and high-contrast mode (independent), native `<dialog>` for the experience details, keyboard-operable navigation, `prefers-reduced-motion` respected by every animation, automated axe checks on every theme and locale.
- **Small by design.** About 139 kB of JavaScript (gzip) on first load; animation code is loaded on idle time; icons are tree-shaken data rendered as inline SVG; images are WebP.

---

## Tech stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript (strict) | UI and types |
| React Router (Framework Mode, `ssr: false`) | Routing and build-time pre-rendering |
| Vite | Build tool and dev server |
| Tailwind CSS v4 | Styling, mapped to the design tokens in `src/shared/styles/tokens.css` |
| GSAP + ScrollTrigger | Scroll reveals (lazy-loaded, reduced-motion aware) |
| Font Awesome (icon data only) | Icons rendered as inline SVG |
| Fontsource (DM Sans, DM Mono, Syne) | Self-hosted fonts |
| Web3Forms | Contact form delivery (client-side, public access key) |
| Vitest + Testing Library | Unit and component tests |
| Playwright + axe-core | End-to-end, SEO, security and accessibility tests |

---

## Project structure

A lightweight, feature-oriented layout inspired by Feature-Sliced Design. Higher layers may import lower ones, never the reverse, and slices on the same layer do not import each other. `src/architecture.test.ts` enforces this.

```
src/
├── app/         root document, routes, SEO metadata, analytics, pre-paint script
├── pages/       route-level compositions (home, project, not-found)
├── widgets/     page sections: site-nav, hero, about, skills, projects, contact, footer
├── features/    user capabilities: switch-language, toggle-appearance, contact-form,
│                experience-details (dialog), open-cv, locale-entry (first-visit redirect)
├── entities/    domain data and UI: project, experience, skill
└── shared/      i18n, config, UI primitives, helpers, styles, assets
scripts/         build post-processing (CSP hashes, 404 page, sitemap) and its tests
static/          files copied as-is: robots.txt and the stable share images (og/, images/)
tests/           Playwright specs (e2e/), static host used by the tests, visual baseline tools
```

---

## Internationalization

- Supported locales: English (default), Portuguese, Spanish.
- Copy lives in `src/shared/i18n/resources/{en,pt,es}.json` with identical key shapes, keyed by project slug or experience id. Tests enforce key parity, equal array lengths, no empty strings and balanced inline markers.
- Keys are typed from `en.json`, so a misspelled key fails `tsc`.
- Each route loads only its own locale's JSON. Rich text (the highlighted phrase in the About quote) is rendered from `<em>` markers as elements, never as HTML.
- **First visit to `/`:** stored preference, then browser language, then English. Prefixed URLs and project URLs are never redirected. The preference is stored only when the user switches language explicitly.
- **Legacy links:** `/#projects/<slug>` redirects to the real project route.

---

## SEO, security and analytics

- Per-route `meta` exports build title, description, canonical, alternates, social tags and JSON-LD from the locale resources and typed project data (`src/app/seo/`).
- After the build, `scripts/postbuild.ts` writes `sitemap.xml` (18 URLs with reciprocal `hreflang` alternates), turns the prerendered 404 route into `404.html`, removes the SPA fallback, and injects the Content-Security-Policy meta tag into every HTML file.
- `vercel.json` adds security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`), long-lived caching for hashed assets, and `trailingSlash: false`.
- Google Analytics only activates on the production hostname (so previews and local runs send nothing) and sends one `page_view` per route change.

---

## Contact form

Powered by [Web3Forms](https://web3forms.com) directly from the browser, with a public access key (not a secret). The client validates empty fields and email format, uses a honeypot field, shows a live character counter, and reports success, provider failure and network error in the active language. Client-side validation is a UX aid; spam control relies on the honeypot and the provider.

---

## Scripts

```bash
npm install
npm run dev          # React Router dev server
npm run build        # pre-render all routes + post-process (CSP, sitemap, 404)
npm run preview      # static host that mirrors the production routing, on :4173
npm run typecheck    # react-router typegen && tsc (strict)
npm test             # Vitest unit and component tests
npm run test:e2e     # Playwright (builds are served from build/client; run `npm run build` first)
npm run og:images    # regenerate the 1200x630 share images in static/og (needs `npm run preview` running)
```

Node 20.19+ is required (see `engines`).

---

## Deployment (Vercel)

Static deployment of `build/client`, configured in `vercel.json` (`framework: null`, `buildCommand`, `outputDirectory`, headers, `trailingSlash: false`). No environment variables are needed. Unknown URLs return the real `404.html` with a 404 status; under `/pt` and `/es` the page switches to that language in the browser. Node.js 20.19+ must be selected in the Vercel project settings.

---

## Testing

- **Unit/component:** locale parity, typed keys, project data, layer boundaries, contact validation and submission, pre-paint script, CSP builder, sitemap and metadata.
- **End-to-end:** every route, language switching and redirects, legacy links, theme and contrast, navigation and the mobile drawer, the experience dialog, the contact form with a mocked provider, CV links, reduced motion, hydration without console warnings, per-page head contents, CSP hashes and zero violations, analytics, 404 behavior, and axe (WCAG 2.0/2.1 A and AA) on home and project pages in light, dark and high-contrast themes for three locales. The same checks run in GitHub Actions on every push and pull request (`.github/workflows/ci.yml`).
- **Visual and layout tools:** `tests/visual-baseline/` can capture screenshots, compare them against a reference, and measure element geometry.

---

## Contact

- **Website:** [dasilva-thiago.dev](https://www.dasilva-thiago.dev)
- **LinkedIn:** [linkedin.com/in/dasilva-thiago](https://www.linkedin.com/in/dasilva-thiago/)
- **GitHub:** [github.com/dasilva-thiago](https://github.com/dasilva-thiago)
- **Email:** thiagosilva785@gmail.com

---

<p align="center">Made by Thiago da Silva • Pindamonhangaba, SP, Brazil</p>
