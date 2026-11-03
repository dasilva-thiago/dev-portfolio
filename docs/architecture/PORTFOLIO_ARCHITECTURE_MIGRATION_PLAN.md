# Portfolio Architecture Migration Plan

Vanilla JavaScript / HTML / CSS → React + TypeScript + Tailwind CSS v4

| Item | Value |
|---|---|
| Status | **Phase 6 complete — ready to commit; awaiting the Vercel Preview check and the legacy-file decision** |
| Audited commit | `43f5337da3183f128ab337a8d672f0514186ddc4` (`main`, clean, in sync with `origin/main`) |
| Audit date | 2026-11-03 |
| Production | `https://www.dasilva-thiago.dev` (Vercel; apex `dasilva-thiago.dev` → `307` → `www`) |
| Out of scope | `server/` (retired legacy mail server — not inspected, not migrated, not referenced) |

---

## 1. Executive recommendation

Migrate to **React Router (Framework Mode) on Vite, with `ssr: false` and build-time pre-rendering of every known route**, TypeScript `strict`, Tailwind CSS v4 via `@tailwindcss/vite`, `i18next` + `react-i18next`, GSAP through `@gsap/react`, Font Awesome through its React package, and Web3Forms kept as the client-side contact provider. Deploy the resulting static `build/client` output to the existing Vercel project.

Project articles become real pages at `/projects/:slug`, with Portuguese and Spanish at `/pt/...` and `/es/...`. Every page ships as pre-rendered HTML with its own title, description, canonical URL, `hreflang` alternates, Open Graph data and structured data. Legacy `/#projects/<slug>` links are redirected client-side.

Why this fits the site:

- The site is static content with client-side interactions only. Framework Mode with `ssr: false` + `prerender` produces plain HTML files that a static host can serve, so no runtime server is needed ([pre-rendering docs](https://reactrouter.com/how-to/pre-rendering)).
- Today, project articles are injected with `innerHTML` into a full-screen overlay (`src/js/ui/projectRouter.js:149`). They have no indexable HTML, no per-article metadata, and they can't be shared with a proper preview. Pre-rendered routes fix all three.
- Vite stays the build tool. `@react-router/dev@8.5.1` accepts `vite ^7 || ^8` (installed: `vite@8.1.4`), and `@tailwindcss/vite@4.3.4` accepts `vite ^8` (verified on the npm registry, 2026-11-03).

Rejected alternatives:

| Alternative | Why rejected |
|---|---|
| Client-only SPA (Vite + React Router Data/Declarative mode) | Project URLs would serve an empty shell to social crawlers and non-JS clients. Per-page metadata would exist only after JavaScript runs. Fails the SEO requirement. |
| Next.js / Astro | Both are viable static generators, but they replace Vite and the build pipeline and add framework concepts the site doesn't need. React Router Framework Mode keeps Vite and gives exactly the route + pre-render model required. |
| Runtime SSR on Vercel Functions | No per-request data exists. Adds functions, cold starts and cost for no benefit. |
| Keep the hash overlay and only port it to React | Keeps the SEO, sharing and accessibility problems that motivate the migration. |
| Redux / Zustand / a service layer / DDD | No shared mutable state beyond locale and appearance. React state + two small contexts are enough. |

---

## 2. Repository baseline

### 2.1 Actual stack (verified)

| Concern | Current implementation | Evidence |
|---|---|---|
| Build | Vite `8.1.4`, **no config file** (all defaults: root = repo root, `public/` copied, output `dist/`) | `package.json:8-11`, `git ls-files` (no `vite.config.*`) |
| Entry | `index.html` → `<script type="module" src="src/js/main.js">` | `index.html:900` |
| JS | 14 ES modules with side effects at import time (no exported init functions) | `src/js/main.js:1-17` |
| CSS | 13 partials imported by `src/css/styles.css` | `src/css/styles.css:1-13` |
| i18n | Custom: English from DOM text (`data-i18n`), PT/ES fetched from `/locales/*.json` | `src/js/core/i18n.js` |
| Icons | Font Awesome SVG core with `dom.watch()` (MutationObserver replaces `<i>` tags) | `src/js/core/icons.js:37-67` |
| Fonts | Fontsource: DM Sans (variable + italic), Syne (variable), DM Mono 400/500 | `src/css/base/fonts.css:1-8` |
| Animation | GSAP `3.15.0` + ScrollTrigger, AOS `2.3.4` | `src/js/ui/animations.js` |
| CDN CSS | `flag-icons` 7.2.3 (with SRI), `hamburgers` 1.2.1 (**no SRI**) | `index.html:145-151` |
| Analytics | GA4 `G-KGS2RCHEQ5` via `gtag.js` with an inline bootstrap script | `index.html:154-160` |
| Contact | Web3Forms `POST https://api.web3forms.com/submit` with a public access key | `src/js/ui/contact.js:3-4,97-111` |
| Tests | Vitest `4.1.5`, one suite; `jsdom` installed but not configured | `src/js/__tests__/i18n.test.js` |
| Hosting | Vercel (`Server: Vercel`, `X-Vercel-Id`); **no `vercel.json`**, so the build/output settings live in the Vercel dashboard | live `curl -I`, `git ls-files` |
| CI | None (no `.github/workflows`) | `git ls-files` |
| Runtime | Node `24.14.0`, npm `11.9.0`, lockfile v3 | local toolchain |

### 2.2 Verified directory map (excluding `node_modules`, `dist`, `server/`)

```
index.html                     single page + all English copy + CSP + JSON-LD + theme script
package.json / package-lock.json
public/locales/{en,pt,es}.json en.json holds ONLY projectArticles; pt/es hold everything
public/robots.txt, public/sitemap.xml (one URL: "/")
scripts/update-sitemap.js      prebuild: rewrites <lastmod> to today's date
src/assets/icons/favicon.ico
src/assets/img/*.webp|png      12 images
src/css/base/{fonts,reset,variables}.css
src/css/layout/{navbar,footer,mobile-nav,scrollbar}.css
src/css/sections/{hero,about,skills,projects,project-article,contact}.css
src/js/core/{i18n,darkMode,contrastMode,icons}.js
src/js/ui/{about,animations,contact,cv,langDropdown,mobileNav,navbarScroll,projectRouter,typewriter}.js
src/js/__tests__/i18n.test.js
```

### 2.3 Discrepancies and defects found

Production defects (verified against the live host):

1. **`og:image` and the JSON-LD person image return 404.** `index.html:135` points to `/src/assets/img/preview.png` and `index.html:57` to `/src/assets/img/profile_edit1.webp`. Vite hashes images into `/assets/`, so both URLs are 404 in production. Social previews currently have no image.
2. **All project-article hero images are 404 in production.** `projectRouter.js:8,16,23,30,37` use string paths (`'src/assets/img/…'`) that Vite never rewrites. `eduAssets_banner.webp` is not emitted into the build at all.
3. **The test suite fails.** `i18n.test.js:2` imports `./i18n.js`, which doesn't exist next to the test (the module is `../core/i18n.js`). There is also no `jsdom` environment config, and `i18n.js` touches `document` at import time.
4. **Article text loses content.** `renderParagraphs()` + `innerHTML` (`projectRouter.js:69-72,149`) parse locale text as HTML. The `dev-portfolio` article body in all three locales contains the literal text `<head>` (`public/locales/en.json:43`, `pt.json:198`, `es.json:198`), which the browser swallows as a tag.

Functional and accessibility defects:

5. `hero.title` is reverted to `i'm thiago,` in the HTML (`index.html:309`), while `pt.json`/`es.json` hold `thiago,` (no prefix). The English and translated hero copy now differ in structure. This is a content decision for the owner; the migration preserves whatever the locale files contain.
6. Seven `data-i18n` keys used in the HTML don't exist in `pt.json`/`es.json`: `nav.aria.projects`, `hero.typewriter-prefix`, `hero.description` (exists as an **array**, coerced to a string), `about.dedicated-curious`, `sections.about.education`, `sections.about.experience`, `sections.skills.evolving`. These elements stay in English when another language is selected.
7. `about.quote` contains a nested highlighted `<span>` (`index.html:379-386`). Translation sets `textContent` (`i18n.js:73`), which destroys the span. Switching back to English restores flat text, so the highlight only exists on the very first English render.
8. Duplicate `id="modal-title"` (`index.html:853,873`). The dialog's `aria-labelledby` always names the SEDUC title, even for the Tenaris modal.
9. The About modal doesn't lock background scroll and doesn't trap focus (`src/js/ui/about.js`). The mobile drawer locks scroll with inline `body.style.overflow` (`mobileNav.js:13`). The article overlay locks scroll with `body.article-open`.
10. Footer icon links have no accessible name (`index.html:829-837`).
11. Contact: the "Sending..." label is hard-coded English (`contact.js:93`). The post-success counter reset removes non-existent classes (`contact.js:119`, which removes `char-counter--near/--full` instead of `--1000/--1500/--1800/--2000`). Feedback isn't announced (no `aria-live`).
12. **Two different CV link sets.** `src/js/ui/cv.js:1-5` (used by the desktop nav, hero and contact) and `src/js/ui/mobileNav.js:37-41` (mobile drawer) point to different Google Drive files.
13. Duplicate `<meta name="viewport">` (`index.html:109,125`).
14. `--shadow-light-sm/md` are used in `projects.css:132,146` but defined only for high contrast (`variables.css:127-128`). In light and dark mode the whole `box-shadow` declaration is invalid, so project cards render **without** their intended shadow. The migration preserves the *current rendered* result unless the owner approves the fix.

Dead or stale code and configuration:

15. `animations.js` targets selectors that don't exist: `.hero-section .headshot`, `.hero-bullets li`, `.hero-section .text .links` (`:24-36`), `.about-section .person-details`, `.about-section .text`, `.timeline-item`, `.timeline`, `.timeline-initiative` (`:113-165`). The hero description, social links and buttons are therefore animated only by AOS, not GSAP.
16. AOS and GSAP animate the same subtrees: `data-aos` on hero, about, projects and contact sections (`index.html:306,364,603,783`) and GSAP on their children (`animations.js:98-110,168-192`). Neither the JavaScript animations nor AOS honor `prefers-reduced-motion`.
17. CSP: two of the four `script-src` hashes (`zWavnbwt…`, `NMEPv3lW…`) match no current inline script. `https://cdn.jsdelivr.net` (script/style/img/connect) and `https://fonts.gstatic.com` are allowed but not used. `form-action 'none'` is correct, since submission uses `fetch` (`index.html:6-36`).
18. `scripts/update-sitemap.js` sets `<lastmod>` to the **build date** on every build (`:8-14`), not the content change date.
19. The `hamburgers` CDN stylesheet is mostly overridden by `src/css/layout/mobile-nav.css:1-55,257-275`. Whether any rule from it is still visible must be checked against the visual baseline before it is dropped.
20. Unused locale keys: `projects-toggle-text`, `projects-toggle-back` (left over from the old carousel).
21. The HTML loads before the language is applied, so PT/ES visitors see an English flash plus a 150 ms fade (`i18n.js:55-57`).

README discrepancies (`README.md`, updated in `43f5337`):

- It claims an "aurora animated background" with `src/css/base/aurora.css`. **No aurora code exists anywhere in `src/`.**
- It lists `vite.config.js`. **There is none.**
- It says English text is stored in `data-i18n-default`. Those attributes are generated at runtime by `saveDefaults()` (`i18n.js:16-32`), not authored.
- It says "Vitest unit tests covering the i18n module". The suite currently fails (defect 3).

---

## 3. Behavior and requirements inventory

V = verified in code. L = requires a live/browser check (to be captured in the Phase 2 visual/behavior baseline).

### 3.1 Navigation

- V. Desktop pill nav (`index.html:174-229`): Home, About, Skills, Projects and Contact anchors, a dark toggle, a contrast toggle, a CV button and a language dropdown. Icon tooltips come from `::after { content: attr(aria-label) }` (`navbar.css:138-162`).
- V. The nav is sticky at `top: 25px`. Once the hero leaves the viewport (`IntersectionObserver`, `navbarScroll.js`), `body.scrolled-past-hero` hides it. A fixed 70 px `#nav-trigger` zone reveals it on hover (`navbar.css:195-218`). Hidden at ≤1024 px.
- V. Mobile (≤1024 px): fixed hamburger, right drawer (`min(300px, 85vw)`), backdrop click and Escape close it, links close it, body scroll is locked. The drawer contains links, CV, theme controls and language flags (`mobileNav.js`).
- V. Language dropdown: click toggles it, a click outside closes it, and `aria-expanded`/`aria-hidden` are synced. The active flag comes from `localStorage.lang` (`langDropdown.js`).
- V. Smooth scrolling via `html { scroll-behavior: smooth }`, `scroll-margin-top: 24px` on sections, and a skip link to `#main-content` (`reset.css`).
- L. Keyboard tab order, focus-visible rings and the dropdown's keyboard behavior (no arrow-key handling exists; Escape doesn't close the dropdown).

### 3.2 Projects

| Order | Slug | Card variant | Locale index (legacy) | External links |
|---|---|---|---|---|
| 01 | `eduassets` | featured | `projects.4` | live `https://eduassets.tech`, GitHub `edu-assets` |
| 02 | `buenos-aires-explorer` | secondary | `projects.0` | GitHub `BuenosAiresExp` |
| 03 | `dev-portfolio` | compact | `projects.1` | GitHub `dev-portfolio` |
| 04 | `aviation-safety` | compact | `projects.2` | GitHub `aviation_safety_project` |
| 05 | `travel-explorer` | compact | `projects.3` | GitHub `TravelExplorer` |

- V. Clicking a whole card opens its article, except clicks on inner links and buttons (`projectRouter.js:178-183`). Cards aren't keyboard-focusable as article links (they're `<article>` elements with a click handler). **This is an accessibility gap the migration fixes by using a real link.**
- V. Article = hero image, tag, title (Syne), live/GitHub buttons, intro, and sections of heading + paragraphs (`\n\n`-separated). The back link points to `#projects`. The article re-renders on `langchange`. Direct load of `/#projects/<slug>` works. Unknown slugs are silently ignored.
- V. Tech-chip lists are hard-coded English per card (`index.html:620-638,668-674,…`). Only the Travel Explorer chips carry `data-i18n`.
- V. The secondary card uses `object-fit: contain` on a hard-coded `#0d1420` background (`projects.css:281-294`).

### 3.3 Language

- V. Supported languages: `en` (default), `pt`, `es`. Precedence on load: `localStorage.lang` → `navigator.language` (first two letters) → `en` (`i18n.js:109-128`).
- V. Every applied language is persisted to `localStorage.lang`, including auto-detected ones (`i18n.js:96`).
- V. Translated surfaces: text content, `placeholder` (inputs/textarea), `aria-label` via `data-i18n-aria`, `<html lang>`, contact feedback messages (`contact.js:27-45`), typewriter phrases (`typewriter.js:20-24`), article content and labels. Locales are cached in memory.
- V. The `langchange` CustomEvent is dispatched after every switch (`i18n.js:99`).
- V. CV links are chosen by `document.documentElement.lang` (`cv.js:7-11`).

### 3.4 Appearance

- V. The pre-paint inline script (`index.html:111-123`) adds `html.dark-mode` when `localStorage.darkMode === 'true'`, or when it is unset and `prefers-color-scheme: dark`. It adds `html.high-contrast` when `localStorage.highContrast === 'true'`.
- V. Dark and high contrast are independent toggles. Both classes are mirrored on `<body>` (`darkMode.js:26-39`, `contrastMode.js`) because CSS uses both `html.` and `body.` selectors.
- V. Live system-theme changes apply only when no stored preference exists (`darkMode.js:41-48`).
- V. `<meta name="theme-color">` switches between `#faf6ec` and `#16130d` (`darkMode.js:4-13`).
- V. The toggle icon is a moon when dark and a sun when light. The mobile icon follows through a `MutationObserver` on `body.class`.

### 3.5 Experience modal

- V. Two expandable cards (`seduc`, `tenaris`) open a shared overlay with `role="dialog" aria-modal="true"`. Focus moves to the close button, Escape and backdrop clicks close it, focus returns to the originating card, and `aria-expanded` is synced (`about.js`).
- V. Gaps: no focus trap, no scroll lock, and duplicate ids (defects 8 and 9).

### 3.6 Contact (Web3Forms — active provider)

- V. Fields: name (≤100), email (≤100), message (≤2000), hidden honeypot `_honey`. `novalidate` is set, with custom validation: empty fields, then an email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- V. A filled honeypot shows a fake success and resets the form without a request.
- V. Live counter `n / 2000` with color thresholds at 1000, 1500, 1800 and 2000.
- V. Loading state: a disabled button, a spinner and the "Sending..." label.
- V. Request JSON: `access_key`, `from_name: "Contato - Portfolio"`, `subject: "Nova mensagem de <name>"`, `name`, `email`, `message`. Success is `result.success === true`.
- V. Feedback is a `<p id="form-feedback" class="success|error">` with localized messages and English fallbacks.

### 3.7 Animation and motion

- V. GSAP hero timeline (only `h1` and `.hero-subtitle` have live targets), skills heading + description, skill-card stagger, runway bar fill to `--skill-pct`, projects heading + subtitle, contact heading + form. All of these are `once: true` ScrollTriggers.
- V. AOS `fade-up` (700 ms, `once`, offset 60) on the hero, about, projects and contact sections, plus the hero social links and buttons.
- V. Typewriter: 75 ms typing, 40 ms deleting, 1800 ms pause, endless loop.
- V. CSS transitions: card hovers, nav and drawer, the overlay. `prefers-reduced-motion` is handled only in `skills.css` and `project-article.css`.

### 3.8 Visual system

- V. Tokens are in `src/css/base/variables.css` for light (`:root`), `html.dark-mode` and `html.high-contrast`. Typography uses Syne for the hero H1 and article H1, DM Sans for the body, and DM Mono for labels, tags and chips.
- V. Layout: `body { max-width: 1400px; margin: 0 auto }`, while `html` carries the page background so ultrawide screens are fully covered. Section inline padding is `clamp(20px, 5vw, 50px)`.
- V. Breakpoints in use: max-width 360, 480, 600, 640, 740, 768, 850 and 1024; min-width 1200 and 1400.
- V. Hero H1 `clamp(52px, 6.5vw, 96px)`. The skills grid has 3 columns by default, 4 at ≥1200 px or ≤850 px, 5 at ≥1400 px, and 3 at ≤600 px.
- L. Pixel-level appearance in each theme × breakpoint × language. Captured as the Phase 2 baseline.

### 3.9 SEO, security and analytics

- V. Title `Thiago da Silva | Full Stack Developer`, a description, `robots: index, follow`, Open Graph title/description/image/url/type (no Twitter card tags), canonical `https://www.dasilva-thiago.dev`.
- V. JSON-LD `@graph` with ProfilePage → Person (`#person`) and a WebSite. `inLanguage` is `["en","pt-BR","es"]` and `dateModified` is `2026-05-07`.
- V. `robots.txt` allows everything and references the sitemap. The sitemap has a single `/` URL.
- V. CSP is delivered via `<meta http-equiv>` only. The live response headers carry no CSP, no `X-Content-Type-Options`, no `Referrer-Policy` and no frame protection; HSTS comes from Vercel.
- V. GA4 is loaded on every page view and does no client-side route tracking (there was only one page).

### 3.10 Non-functional requirements to preserve or improve

The site must:

- Have no flash of the wrong theme.
- Render content without JavaScript for crawlers.
- Remain Lighthouse-healthy: no layout shift from late fonts or images, and images with explicit `width`/`height`.
- Load fonts from the site itself, with no third-party font CDN.
- Keep the Font Awesome bundle tree-shaken.
- Make keyboard operation and visible focus work everywhere.
- Honor `prefers-reduced-motion` for every animation, including the JavaScript-driven ones.
- Pass strict TypeScript with zero `any` escapes in application code.

---

## 4. Target architecture

### 4.1 Stack

These are the latest registry versions on 2026-11-03. Phase 2 installs the latest versions within the stated major and records the exact ones.

| Layer | Choice |
|---|---|
| Framework / router | `react-router` + `@react-router/dev` 8.x, Framework Mode, `ssr: false`, `prerender` |
| UI | `react` / `react-dom` 19.x |
| Language | `typescript`, using the newest major accepted by `@react-router/dev` (peer `^5.1 ‖ ^6 ‖ ^7`). Phase 2 must confirm `react-router typegen && tsc` passes on 7.x, or pin 6.x. `strict: true`, `noUncheckedIndexedAccess: true`, `verbatimModuleSyntax: true` |
| Build | Vite 8.x (already installed) |
| Styling | `tailwindcss` + `@tailwindcss/vite` 4.x ([Vite install guide](https://tailwindcss.com/docs/installation/using-vite)), plus existing tokens and deliberate CSS |
| i18n | `i18next` 26.x + `react-i18next` 17.x |
| Animation | `gsap` 3.x (existing) + `@gsap/react` 2.x (`useGSAP`, scoped contexts with automatic cleanup) |
| Icons | `@fortawesome/fontawesome-svg-core` (existing) + `@fortawesome/react-fontawesome` 3.x, importing icons per use (tree-shaken) |
| Fonts | Fontsource (existing packages) |
| Tests | Vitest (existing) + `@testing-library/react` + `jsdom` (existing), and `@playwright/test` + `@axe-core/playwright` for E2E and accessibility |
| Retired | `aos`, `dom.watch()`, `scripts/update-sitemap.js`, the `hamburgers` CDN stylesheet (after the baseline check), the `flag-icons` CDN stylesheet (replaced by local SVG flags) |

### 4.2 Responsibility boundaries

The structure is a lightweight Feature-Sliced layout. React Router's `appDirectory` is `src/app`; route modules are thin adapters that delegate to `pages/`.

```
react-router.config.ts        ssr:false, prerender(), appDirectory:"src/app"
vite.config.ts                tailwindcss(), reactRouter()
vercel.json                   output dir, headers, trailingSlash (Phase 5)
public/
  og/portfolio-preview.png    stable, unhashed social image (was src/assets/img/preview.png)
  images/profile.webp         stable JSON-LD person image
  favicon.ico, robots.txt
scripts/
  generate-sitemap.ts         post-build, from the route manifest (Phase 5)
  csp-hashes.ts               post-build, per-page CSP meta injection (Phase 5)
src/
  app/
    root.tsx                  <html>/<head>, Meta/Links/Scripts, pre-paint script, providers, ErrorBoundary
    routes.ts                 route table (4.4)
    routes/
      home.tsx                loader (locale), meta, legacy-hash redirect -> <HomePage/>
      project.tsx             loader (locale + slug, throws 404), meta -> <ProjectPage/>
      not-found.tsx
    providers/
      AppearanceProvider.tsx  single owner of dark/contrast state
      I18nProvider.tsx        i18next instance per render, resources from loader
    analytics.ts              GA page_view on route change
    styles/
      app.css                 @import "tailwindcss"; @theme mapping; @layer order; imports below
  pages/
    home/HomePage.tsx         composes widgets
    project/ProjectPage.tsx   article layout
    not-found/NotFoundPage.tsx
  widgets/
    site-nav/                 DesktopNav, MobileDrawer, NavRevealZone, useScrolledPastHero
    hero/                     Hero, Typewriter
    about/                    AboutSection (identity, bio, experience list)
    skills/                   SkillsSection (icon grid, runway bars)
    projects/                 ProjectsShowcase
    contact/                  ContactSection (copy + ContactForm + CV button)
    footer/                   Footer
  features/
    switch-language/          LanguageMenu, useSwitchLanguage (navigates to localized path)
    toggle-appearance/        DarkModeToggle, ContrastToggle
    contact-form/             ContactForm, validate.ts, submitWeb3Forms.ts, config.ts
    experience-details/       ExperienceDialog (native <dialog>)
    open-cv/                  CvButton, cvLinks.ts
  entities/
    project/                  model/projects.ts (typed metadata), ui/ProjectCard.tsx, lib/paths.ts
    experience/               model/experience.ts, ui/ExperienceCard.tsx
    skill/                    model/skills.ts, ui/SkillIconCard.tsx, ui/SkillRunway.tsx, icons/*.tsx
  shared/
    config/site.ts            origin, locales, GA id, social URLs
    i18n/
      locales.ts              Locale type, default, labels, hreflang codes
      resources/{en,pt,es}.json   moved from public/locales, full parity
      i18next.d.ts            typed resources
      path.ts                 localizePath(), stripLocale()
    ui/                       Button, IconLink, SectionHeading, TechChip, Flag (inline SVG)
    lib/                      useReducedMotion, scrollLock
    assets/                   images imported from TS (hashed)
    styles/                   tokens.css, effects.css (keyframes, theme/high-contrast overrides)
tests/
  e2e/*.spec.ts               Playwright
  visual-baseline/            screenshots of the current production site (Phase 2)
```

**Import direction:** `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A layer may import only from layers to its right. Slices on the same layer don't import each other; they're composed one layer up.

- Allowed: `widgets/contact/ContactSection.tsx` imports `features/contact-form` and `features/open-cv`.
- Allowed: `features/switch-language` imports `shared/i18n/path.ts`.
- **Forbidden:** `entities/project` importing `features/switch-language`. Use `shared/i18n/path.ts` instead.
- **Forbidden:** `widgets/hero` importing `widgets/site-nav`. Both are composed by `pages/home`.
- Enforcement: Phase 3 adds an ESLint `import/no-restricted-paths` (or equivalent) rule. Rules beyond these boundaries aren't needed.

### 4.3 What not to build

The following are out of scope:

- No per-component folders with `index.ts` barrels.
- No repositories, use-case classes, DI containers or a global store.
- No CMS.
- No runtime server, server actions or Vercel Functions.
- The retired mail server is not reconnected.

### 4.4 Route table

| Path | Route module | Pre-rendered | Notes |
|---|---|---|---|
| `/` | `routes/home.tsx` (id `home-en`) | yes | English home; legacy hash redirect runs here |
| `/pt`, `/es` | `routes/home.tsx` (ids `home-pt`, `home-es`) | yes | |
| `/projects/:slug` | `routes/project.tsx` (id `project-en`) | yes, 5 slugs | Unknown slug → loader throws `404` → route ErrorBoundary |
| `/pt/projects/:slug`, `/es/projects/:slug` | `routes/project.tsx` (ids `project-pt`, `project-es`) | yes, 5 slugs each | |
| `/404` | `routes/not-found.tsx` | yes | copied to `build/client/404.html` post-build so Vercel serves a real 404 status |
| `*` | `routes/not-found.tsx` | — | client-side fallback |

That is 18 pre-rendered documents plus the 404. Routes are declared explicitly per locale (with `prefix()` / `route()` and distinct `id`s) rather than through an optional `:lang?` segment, so `/projects` can never be parsed as a language code.

The `prerender()` function derives every path from `entities/project/model/projects.ts` and `shared/i18n/locales.ts`. The path list therefore can't drift from the data.

There is **no** catch-all SPA rewrite. Unknown URLs get the static 404, not a soft-200 shell.

### 4.5 State and data flow

```
URL ─► route loader (build time) ─► { locale, resources, project? }
                                     │
root.tsx ─► I18nProvider(locale, resources) ─► useTranslation() in widgets
         └► AppearanceProvider(initial from <html> classes) ─► toggles, theme-color meta
features/contact-form: local useState/useReducer (idle | submitting | success | error)
features/experience-details: local open-id state + <dialog>
widgets/site-nav: local drawer/dropdown state; useScrolledPastHero (IntersectionObserver)
```

- Locale is **derived from the URL**, never stored in React state. Switching language is a navigation.
- Loaders run at build time for pre-rendered paths and emit `.data` files for client navigation. Locale resources therefore arrive per locale without bundling all three. This replaces the `/locales/*.json` fetches.
- Appearance is the only client-persisted shared state (`localStorage` keys unchanged: `darkMode`, `highContrast`, `lang`).

---

## 5. Decision register

| # | Decision | Recommendation | Alternatives | Rationale / trade-offs | Owner confirmation |
|---|---|---|---|---|---|
| D1 | Rendering | RR Framework Mode, `ssr:false`, explicit `prerender()` | client-only SPA; Next.js; Astro; runtime SSR | Static HTML per route, Vite kept, no server. Cost: Framework Mode conventions (`root.tsx`, route modules) and a major-version-8 router. | No |
| D2 | Locale in URL | `/` = English, `/pt/…`, `/es/…` | client-only switch (today) | Makes PT/ES indexable and shareable with the correct `og:locale`. Cost: 3× routes and `hreflang` upkeep. Today's PT/ES content is invisible to crawlers. | **Yes** (URL scheme is public) |
| D3 | First-visit language precedence | On `/` only: stored `lang` ∈ {pt,es} → `replace` to `/pt` or `/es`. Otherwise, if no stored value and the browser language is pt/es → `replace` to `/pt` or `/es`. Prefixed URLs are always authoritative. | redirect from every page; no redirect | Preserves today's precedence (stored → browser → en) while letting shared links and crawlers stay on the requested locale. | No |
| D4 | When to persist `lang` | Only on explicit switch | persist on every visit (today) | Visiting a shared `/es/...` link no longer silently changes a PT user's preference. A small behavior change. | **Yes** |
| D5 | Legacy `/#projects/<slug>` | Client-side `navigate(localizedProjectPath(slug), {replace:true})` in the home route, running after hydration. Unknown slugs fall back to `/#projects`. | server redirect | Fragments never reach the server, so Vercel redirects can't match them. Must be covered by E2E. | No |
| D6 | Project page chrome | Article layout keeps the back link and **also** renders the site nav, so language and theme can be switched on directly-entered pages | overlay without nav (today) | Direct entry is now possible. Without the nav, users can't switch language on a project page. The visual style stays the same. | **Yes** |
| D7 | i18n library | `i18next` + `react-i18next`, a per-render instance created from loader resources, typed resources | custom hook over JSON; FormatJS | Plurals/interpolation/`returnObjects` for arrays, mature React bindings, typed keys. Cost: about 15 kB gzipped. | No |
| D8 | English source of truth | `shared/i18n/resources/en.json` holds **all** English copy; JSX contains keys only | English in JSX (today's HTML) | Removes duplication and the `saveDefaults` mechanism, and enables a parity test. | No |
| D9 | Rich text in copy | Use `<Trans>` with named components for inline emphasis (`about.quote` highlight) and string arrays for paragraphs. Never `dangerouslySetInnerHTML`. | HTML strings | Fixes defects 4 and 7 and removes the XSS surface. | No |
| D10 | Animation | GSAP + `@gsap/react` only, with `gsap.matchMedia()` gating on `prefers-reduced-motion`. **Remove AOS.** CSS for hovers and transitions. | keep AOS | One library per element (fixes defect 16). Reduced motion gets instant final states. | No |
| D11 | Dead animation targets | Don't port them. Animate only the elements that exist. Hero entrance = h1, subtitle, description, social links, buttons (today's combined GSAP + AOS visual result). | re-create removed elements | Preserves the visible behavior and drops the noise. | No |
| D12 | Appearance model | Keep `darkMode`/`highContrast` booleans and `localStorage` keys. A pre-paint inline script in `root.tsx` sets classes on `<html>` only. `AppearanceProvider` reads the initial state from `<html>` after hydration. CSS migrates `body.dark-mode`/`body.high-contrast` selectors to `html.` (`:root`). `<html suppressHydrationWarning>`. | `data-theme` attribute; tri-state theme | Zero-flash behavior and stored preferences survive the deploy. Removing body mirroring removes the `MutationObserver`. | No |
| D13 | Styling strategy | Phase 3: port existing CSS partials into `@layer components` **unchanged** to reach visual parity first, then convert layout, spacing and responsive rules to Tailwind utilities per widget behind the visual-diff gate. Keep effects, keyframes and theme/high-contrast overrides as CSS. | big-bang conversion to utilities | Separates "framework migration" from "style rewrite" and makes visual regressions attributable. | No |
| D14 | Tailwind tokens | `@theme inline` maps semantic vars, e.g. `--color-text: var(--text-color)`, `--color-muted`, `--color-link`, `--color-fill`, `--color-surface: var(--white-color)`, `--font-hero/body/mono`. Custom breakpoints for the existing widths. `@custom-variant dark (&:where(.dark-mode, .dark-mode *))` and `@custom-variant hc (&:where(.high-contrast, .high-contrast *))`. | Tailwind default palette | Utilities stay theme-reactive at runtime, and no hex values appear in components. | No |
| D15 | Preflight | Enable Tailwind Preflight and delete the overlapping parts of `reset.css`. Keep `body` max-width, focus styles, skip link and `scroll-margin`. Confirm parity on the baseline. | disable Preflight | Preflight ≈ the current reset (margin/padding 0, border-box). Differences in headings, lists, `img { display:block }` and button styles must be checked visually. | No |
| D16 | Icons | `@fortawesome/react-fontawesome` with per-icon imports. Skill logos stay as inline SVG components. Flags become 3 inline SVG components (drops the cdnjs CSS). | keep CDN `flag-icons` | Removes two third-party stylesheet origins from the CSP and works offline. | No |
| D17 | Hamburger | A pure CSS/React component reproducing today's look (`mobile-nav.css` already defines it) | keep the `hamburgers` CDN (no SRI) | Removes an unpinned-integrity CDN dependency. | No |
| D18 | Contact provider | Keep Web3Forms from the client. Access key as a **typed public constant** in `features/contact-form/config.ts`, documented as provider-issued and public. Fix defect 11. Add `aria-live="polite"`. | env var; backend | A public key needs no secret handling. An env var would add a Vercel dependency without security benefit. Client validation is UX only; spam control relies on the honeypot plus Web3Forms' provider-side filtering and domain restriction. | Confirm domain restriction is enabled in the Web3Forms dashboard |
| D19 | Modal | Native `<dialog>` + `showModal()` (built-in focus containment, Escape, `inert` background), body scroll lock while open, focus restored to the trigger, unique `aria-labelledby` per entry | custom focus trap | Fixes defects 8 and 9 with less code. | No |
| D20 | Images | Content images imported from TS (hashed, with explicit width/height). Social and structured-data images moved to `public/` with stable absolute URLs. | keep string paths | Fixes defects 1 and 2. | No |
| D21 | Per-project `og:image` | Use the project's hero image copied to `public/og/<slug>.webp`, falling back to the portfolio preview | single global image | Better share previews. Cost: 5 extra static files. | No |
| D22 | CSP delivery | Per-page `<meta http-equiv="Content-Security-Policy">` injected **post-build**, with SHA-256 hashes of every inline script in that HTML file (pre-paint, gtag bootstrap, React Router hydration/context scripts). Static security headers in `vercel.json`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy`. | `'unsafe-inline'`; nonces | React Router emits per-page inline scripts, and nonces need a server. Per-page hashes keep `script-src` strict on static hosting. `style-src 'unsafe-inline'` is kept as today, because pre-rendered `style=""` attributes (e.g. `--skill-pct`) need it. | No |
| D23 | Analytics | Keep GA4 `G-KGS2RCHEQ5`, `send_page_view:false`, and send `page_view` on every location change from `app/analytics.ts` | Vercel Analytics | Client navigation would otherwise under-count. Consent banners are out of scope (unchanged from today). | No |
| D24 | Sitemap | Generated post-build from the route manifest: all 18 URLs with `xhtml:link` alternates. `lastmod` = per-entry `updatedAt` from typed data (home: max of all), not the build date. | keep the build-date script | Accurate `lastmod` semantics (fixes defect 18). | No |
| D25 | Trailing slash | `vercel.json` `"trailingSlash": false` | undefined (both served) | Avoids duplicate URLs ([Vercel docs](https://vercel.com/docs/project-configuration/vercel-json#trailingslash)). Must verify that pre-rendered `projects/<slug>/index.html` is served at `/projects/<slug>` on a Preview deployment. | No |
| D26 | CV links | Single source `features/open-cv/cvLinks.ts`, per locale | — | Fixes defect 12. Which link set is current is owner-only knowledge (see Open questions). | **Yes** |
| D27 | Tests | Vitest + RTL for logic and components; Playwright for routes, legacy redirect, language, theme/no-flash, contact (Web3Forms mocked via route interception), mobile nav, dialog, reduced motion and visual parity; axe for accessibility | Cypress | Playwright covers multiple engines and the static build. | No |
| D28 | Card interaction | Each card's title becomes a `<Link>` with a stretched click area (`::after` overlay). Inner GitHub/live links stay independently clickable via `z-index`. | `<article onClick>` (today) | Same "click anywhere" behavior, plus keyboard and middle-click/open-in-new-tab support. | No |

---

## 6. Migration mapping

| Existing | Target | Action |
|---|---|---|
| `index.html` `<head>` (CSP, JSON-LD, metas, theme script, gtag, CDN links) | `src/app/root.tsx` (`Layout`, pre-paint script, gtag), route `meta` exports, `shared/config/site.ts`, `scripts/csp-hashes.ts` | **Split.** Fix the duplicate viewport. Drop the stale CSP hashes and unused origins. Drop the CDN links (D16, D17). |
| `index.html` body sections | `widgets/{site-nav,hero,about,skills,projects,contact,footer}` composed by `pages/home/HomePage.tsx` | **Split.** English copy moves to `en.json`. |
| `index.html` About modal markup | `features/experience-details/ExperienceDialog.tsx` + `entities/experience` | **Split / fix** (D19) |
| `src/js/main.js` | `src/app/root.tsx` + `app/styles/app.css` | **Retire** |
| `src/js/core/i18n.js` | `shared/i18n/*`, `app/providers/I18nProvider.tsx`, `features/switch-language` | **Replace** with i18next. Drop `saveDefaults`, `translationCache`, `langchange` (the URL drives re-render) and the fade hack. Preserve the precedence (D3). |
| `src/js/core/darkMode.js`, `contrastMode.js` | `app/providers/AppearanceProvider.tsx`, `features/toggle-appearance`, inline pre-paint in `root.tsx` | **Merge** into one provider. `<html>`-only classes. |
| `src/js/core/icons.js` | per-component `FontAwesomeIcon` imports | **Retire** the `library.add` + `dom.watch` |
| `src/js/ui/projectRouter.js` | `app/routes.ts`, `routes/project.tsx`, `pages/project/ProjectPage.tsx`, `entities/project/*`, legacy hash redirect in `routes/home.tsx` | **Replace.** Remove `innerHTML`. Fix the image paths. |
| `src/js/ui/animations.js` | `useGSAP` hooks inside the `hero`, `skills`, `projects` and `contact` widgets; footer year in `widgets/footer` | **Split.** Remove AOS and the dead selectors (D10, D11). |
| `src/js/ui/typewriter.js` | `widgets/hero/Typewriter.tsx` (phrases via `t('hero.typewriter', {returnObjects:true})`, a static phrase under reduced motion, timers cleaned up on unmount and locale change) | **Port** |
| `src/js/ui/contact.js` | `features/contact-form/{ContactForm.tsx,validate.ts,submitWeb3Forms.ts,config.ts}` | **Port + fix** (D18) |
| `src/js/ui/about.js` | `features/experience-details` | **Port + fix** |
| `src/js/ui/mobileNav.js` | `widgets/site-nav/MobileDrawer.tsx` | **Port.** Reuse the appearance/language features directly instead of `.click()` proxying. Scroll lock via `shared/lib/scrollLock`. |
| `src/js/ui/navbarScroll.js` | `widgets/site-nav/useScrolledPastHero.ts` | **Port** (home only; nav always visible on project pages, see D6) |
| `src/js/ui/langDropdown.js` | `features/switch-language/LanguageMenu.tsx` | **Port.** Add Escape-to-close. |
| `src/js/ui/cv.js` + `mobileNav.js:36-45` | `features/open-cv` | **Merge** (D26) |
| `src/js/__tests__/i18n.test.js` | `src/shared/i18n/*.test.ts` (resource parity, `localizePath`) | **Replace** (the current file is broken) |
| `src/css/base/variables.css` | `src/shared/styles/tokens.css` (unchanged values) + `@theme inline` in `app.css` | **Keep / map** (D14) |
| `src/css/base/reset.css` | Preflight + `app.css` base layer (body max-width, html bg, focus, skip link, `scroll-margin`) | **Reduce** (D15) |
| `src/css/base/fonts.css` | `app.css` imports (unchanged) | **Keep** |
| `src/css/layout/navbar.css`, `mobile-nav.css` | `widgets/site-nav` utilities + `site-nav.css` for tooltips, backdrop blur and the hamburger morph | **Convert** (D13) |
| `src/css/layout/footer.css`, `scrollbar.css` | utilities / `shared/styles/effects.css` (scrollbar) | **Convert / keep** |
| `src/css/sections/hero.css` | `widgets/hero` utilities. Keep the cursor keyframes and the high-contrast H1 override as CSS. | **Convert** |
| `src/css/sections/about.css` | `widgets/about` + `features/experience-details` (dialog backdrop CSS) | **Convert** |
| `src/css/sections/skills.css` | `entities/skill/ui` + CSS for the shine gradient, runway track stripes and keyframes | **Convert** |
| `src/css/sections/projects.css` | `entities/project/ui/ProjectCard.tsx` with a `variant` prop, `shared/ui/Button` (github/access variants), `TechChip` | **Convert.** Preserve the defect-14 appearance unless approved. |
| `src/css/sections/project-article.css` | `pages/project` utilities + CSS for the hero gradient overlay | **Convert.** The overlay/transform rules are dropped (real page). |
| `public/locales/{en,pt,es}.json` | `src/shared/i18n/resources/{en,pt,es}.json` | **Move + restructure** (7.2). `/locales/*.json` stops being public. |
| `public/sitemap.xml`, `scripts/update-sitemap.js` | `scripts/generate-sitemap.ts` (post-build) | **Replace** (D24) |
| `public/robots.txt` | `public/robots.txt` | **Keep** |
| `src/assets/img/*` | `src/shared/assets/img/*` (imported); `preview.png`, `profile_edit1.webp` and project heroes copied to `public/og` and `public/images` | **Move** (D20, D21) |
| `src/assets/img/evelyn_website.webp`, `about_picture1.webp`, `profile_edit1.webp` (in-page) | — | **Unreferenced** by the current UI. Keep untouched until the Phase 6 audit; delete only with owner approval. |

---

## 7. Content and localization strategy

### 7.1 Typed data (non-translatable)

```ts
// entities/project/model/projects.ts
export const PROJECT_SLUGS = ['eduassets','buenos-aires-explorer','dev-portfolio','aviation-safety','travel-explorer'] as const;
export type ProjectSlug = typeof PROJECT_SLUGS[number];
export interface Project {
  slug: ProjectSlug;
  order: number;                       // 1..5 → "01".."05"
  variant: 'featured' | 'secondary' | 'compact';
  cardImage: ImageAsset;               // imported module + width/height + alt key
  heroImage: ImageAsset;
  ogImage: `/og/${string}`;            // public, stable
  tech: readonly string[];             // proper nouns, not translated (today only TE chips use data-i18n — those values are identical across locales)
  links: { github: string; live?: string };
  updatedAt: `${number}-${number}-${number}`;   // sitemap lastmod
}
```

- `entities/experience/model/experience.ts`: id (`univesp`, `senac`, `seduc`, `tenaris`), group (education/experience), icon, `expandable`, tags, optional image.
- `entities/skill/model/skills.ts`: consolidated list (10 items with SVG component) and evolving list (`PHP`, `pct: 25`).

### 7.2 Locale resources

One JSON file per locale with identical key shapes, **keyed by slug or id, never by array index**:

```
nav.*, hero.{greeting,title,typewriter[],description}, sections.*,
about.{role,quote (with <em> placeholder),bio,seeMore},
experience.{univesp|senac|seduc|tenaris}.{date,title,place,description?,tags?[]},
initiative.industrialSafety.{title,description,tags[]},
skills.{consolidatedLabel,evolvingLabel},
projects.{<slug>}.{tag,title,description,alt,article.{intro[],sections[{heading,paragraphs[]}]}},
projectArticles.back, buttons.{github,access,cv}, contact.{…,feedback.*,sending},
meta.{home.{title,description}, project.{titleSuffix}}, a11y.{skipLink,menu,close,footerGithub,…}
```

- Missing keys from defect 6 are added for PT and ES. The owner reviews the generated translations.
- Removed: `projects-toggle-*` (unused).
- **Parity test** (Vitest): every locale has exactly the key set of `en.json`, with matching array lengths for `projects.*.article.sections`.
- **Typing:** `declare module 'i18next' { interface CustomTypeOptions { resources: { translation: typeof en } } }`, so a misspelled key fails `tsc`.
- **Fallback:** `fallbackLng: 'en'` keeps today's per-string fallback semantics.
- **Loading:** each route loader dynamically imports only the active locale's JSON (`import(\`…/${locale}.json\`)`). Pre-rendering serializes it into that page's HTML and `.data`, so language is correct on first paint with no English flash (fixes defect 21).
- **Persistence:** `localStorage.lang` (same key), written on explicit switch (D4).

---

## 8. SEO, security and deployment plan

### 8.1 Pre-rendering and output

`react-router build` with `ssr:false` and `prerender()` writes `build/client/{index.html, pt/index.html, es/index.html, projects/<slug>/index.html, pt/projects/<slug>/index.html, es/projects/<slug>/index.html, 404/index.html}` plus `.data` files. A post-build step:

1. copies `404/index.html` → `404.html`,
2. generates `sitemap.xml`, and
3. injects per-page CSP meta tags.

### 8.2 Vercel

- Add `vercel.json` with `outputDirectory: "build/client"`, `buildCommand: "npm run build"`, `trailingSlash: false` and the `headers` from D22.
- The Vercel dashboard's current Framework Preset and Output Directory are unknown, since they aren't in the repo. `vercel.json` values override them.
- If Vercel auto-detects React Router and tries to create functions, set `"framework": null` (static output) or adopt `@vercel/react-router`'s `vercelPreset()`. [Vercel's docs](https://vercel.com/docs/frameworks/frontend/react-router) describe SPA-mode deployments as zero-config.
- **Validation happens on a Preview deployment before promotion:**
  - direct load of all 18 URLs returns `200` with route-specific `<title>`;
  - `/projects/unknown` returns `404` with the 404 page;
  - `/projects/eduassets/` returns `308` → no slash;
  - `/#projects/eduassets` lands on `/projects/eduassets`;
  - the response headers are present.
- **Rollback:** Vercel "Instant Rollback" to the last vanilla production deployment (built from `43f5337` or later). No DNS changes are involved.

### 8.3 Metadata per route (route `meta` exports)

| Field | Home (`/`, `/pt`, `/es`) | Project |
|---|---|---|
| `<title>` | `meta.home.title` (EN today: "Thiago da Silva \| Full Stack Developer") | `<project title> — Thiago da Silva` |
| description | `meta.home.description` | the project's `description` |
| canonical | self, absolute, no trailing slash | self |
| alternates | `hreflang` `en`, `pt-BR`, `es`, `x-default`→`/` | the same for the slug |
| `og:*` | title, description, `og:image` = `https://www.dasilva-thiago.dev/og/portfolio-preview.png`, `og:url`, `og:type=website`, `og:locale` (`en_US`/`pt_BR`/`es_ES`) + `og:locale:alternate` | `og:type=article`, `og:image=/og/<slug>.webp` |
| Twitter | `twitter:card=summary_large_image` + title/description/image | same |
| JSON-LD | ProfilePage + Person (`#person`) + WebSite, kept as today. Image → `/images/profile.webp`. `inLanguage` = page locale. `dateModified` = max `updatedAt`. | `SoftwareSourceCode` (name, description, `codeRepository`, `programmingLanguage`, `url`, `inLanguage`, `author: {"@id": ".../#person"}`) + `BreadcrumbList` (Home → Projects → Project). **No** duplicate Person/ProfilePage on project pages. |
| `<html lang>` | `en` / `pt-BR` / `es` | same |

### 8.4 CSP (per-page meta, generated)

```
default-src 'none';
script-src 'self' 'sha256-<per inline script>…' https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com;
connect-src 'self' https://api.web3forms.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com;
frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none';
```

- Removed versus today: `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `fonts.gstatic.com`, the stale hashes, and `https://www.google-analytics.com` in `script-src`.
- The GA origins follow Google's published CSP guidance for GA4. Phase 5 must confirm them against live network traffic.
- `frame-ancestors` is ignored in meta CSP, so frame protection goes in the `X-Frame-Options` header (D22).
- **Acceptance:** zero CSP violations in the browser console across all E2E flows.

### 8.5 Legacy URL compatibility

| Legacy | Behavior |
|---|---|
| `/#projects/<known slug>` | home loads → `navigate('/projects/<slug>', {replace:true})`, or the locale-prefixed path if D3 resolves to pt/es |
| `/#projects/<unknown>` | stays on home, scrolls to `#projects` |
| `/#about`, `/#skills`, `/#projects`, `/#contact`, `/#main-content` | unchanged in-page anchors |
| `/locales/*.json` | 404 after migration (no known external consumers; internal only) |

### 8.6 Contact provider

- Endpoint, payload, honeypot and messages are unchanged (3.6).
- The key stays public by design (D18). Client validation is UX, not a security boundary.
- Spam controls: the honeypot, Web3Forms' provider-side filtering, and the optional domain allow-list in the Web3Forms dashboard (owner action).
- CSP: `connect-src https://api.web3forms.com`. `form-action 'none'` stays, because submission uses `fetch`.

---

## 9. Phased migration sequence

Each phase ends with acceptance checks, an update to this document's status table (section 13), and a **stop for owner confirmation of the next model and effort**.

Work happens on a branch (suggested: `migration/react`). The owner decides when to commit, push and merge. Production keeps serving the vanilla site until Phase 5's Preview validation passes.

### Phase 2 — Foundation (Claude Sonnet, effort `medium`)

**Scope:**

- Capture the **behavior and visual baseline** from production (`https://www.dasilva-thiago.dev`, which equals commit `43f5337`) with Playwright. Screenshots cover:
  - widths: 360, 768, 1024, 1440 and 2560;
  - appearance: light, dark and high contrast;
  - language: EN, plus PT at 1440;
  - views: home sections and one article overlay.
  Store them under `tests/visual-baseline/`.
- Install React, React Router Framework Mode, TypeScript, Tailwind v4, `@tailwindcss/vite`, `@types/*`, Playwright and Testing Library.
- Add `vite.config.ts`, `react-router.config.ts` (`ssr:false`, `appDirectory:"src/app"`, `prerender: ["/"]` for now), `tsconfig.json` (strict) and `src/app/{root.tsx,routes.ts,routes/home.tsx}` rendering a placeholder.
- Add `app.css` with `@import "tailwindcss"`, the tokens copied unchanged, `@theme inline` and the custom variants, plus the pre-paint script in `root.tsx`.
- Scripts: `dev` (`react-router dev`), `build` (`react-router build`), `typecheck` (`react-router typegen && tsc`), `test` (vitest), `test:e2e` (playwright), `preview`. Remove the `prebuild` hook.
- Vitest config with `jsdom`. Delete the broken legacy test only after its replacement parity test exists.
- Legacy `src/js`, `src/css` and `index.html` stay in the tree, untouched, as reference. (`index.html` is ignored by Framework Mode; if it conflicts, move it to `legacy/` and note that here.)

**Expected files:** `package.json`, `package-lock.json`, `vite.config.ts`, `react-router.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `src/app/**`, `src/shared/styles/tokens.css`, `tests/visual-baseline/**`, `.gitignore` (`build/`, `.react-router/`, `test-results/`).

**Acceptance:**

- `npm run typecheck`, `npm test` and `npm run build` pass.
- `build/client/index.html` exists with pre-rendered placeholder content.
- Pre-paint theme classes are present before hydration, with no hydration warnings.
- Tailwind utilities and token-based utilities (`bg-surface`, `text-muted`, the `dark:` and `hc:` variants) compile.
- The baseline screenshots are committed to the working tree.

### Phase 3 — Componentization (Claude Sonnet, effort `high`)

**Scope:**

- Build the `pages/widgets/features/entities/shared` structure from 4.2.
- Move locale resources to `shared/i18n/resources` with the restructured keys (7.2), full English copy and parity.
- Move images.
- Implement static composition of every section and of the project page in **English and static state**: no interactivity beyond links.
- Port CSS per D13 (parity first, then utilities).
- Add the project routes for EN and prerender the 5 slugs. Add the import-boundary lint rule.

**Acceptance:**

- Every section and all 5 project pages render from typed data.
- No `innerHTML` or `dangerouslySetInnerHTML` in components (the pre-paint script and JSON-LD are the only exceptions).
- Visual diff against the baseline at each width × theme is within an agreed per-pixel threshold (default 0.1 %), with each intentional difference listed.
- Image dimensions are set (no CLS).
- Typecheck, unit tests and build pass.

**Stop before behavior migration.**

### Phase 4 — Functionality (Claude Sonnet, effort `high`)

**Scope:**

- i18next integration, the locale routes (`/pt`, `/es`) and the language switcher (desktop and mobile) with precedence (D3, D4).
- AppearanceProvider with toggles, `theme-color` updates and system-change behavior.
- Desktop nav reveal logic, mobile drawer and scroll lock.
- Experience `<dialog>`, CV links and the contact form with all states.
- Typewriter, GSAP via `useGSAP` with reduced-motion gating, AOS removal.
- The legacy hash redirect.
- Defects 5–12 and 20 fixed or explicitly deferred.

**Acceptance:** Playwright suite green for:

- language switch and persistence;
- the PT first visit (browser `pt-BR`) redirect;
- theme and contrast persistence with no flash on reload;
- the mobile drawer (open, close, Escape, backdrop);
- the dialog (focus in, Escape, focus restore, scroll locked);
- contact (empty, invalid email, honeypot, success, provider failure, network error; Web3Forms mocked);
- legacy `/#projects/eduassets`;
- reduced motion (no transforms pending, typewriter static).

axe reports no serious or critical violations. Visual parity is maintained.

**Stop before SEO/production work.**

### Phase 5 — SEO and production (Claude Sonnet, effort `high`)

**Scope:**

- Final `prerender()` (18 paths + 404) and the route `meta` exports (8.3).
- JSON-LD, the `public/og` and `public/images` assets, and the GA route tracking.
- `scripts/generate-sitemap.ts` and `scripts/csp-hashes.ts` wired as a `postbuild`.
- `vercel.json` (8.2).
- Delete the legacy `src/js`, `src/css`, `public/locales` and `scripts/update-sitemap.js`, root `index.html`, and the `aos` dependency. Update the README.
- Deploy a **Vercel Preview** and run the validation list in 8.2 against it.

**Acceptance:**

- Every route's HTML contains the correct `<title>`, canonical, `hreflang`, OG and JSON-LD without JavaScript (`curl`).
- Rich Results Test and OG debugger checks pass (manual, owner-run if accounts are required).
- Zero CSP violations.
- Lighthouse on Preview: Performance ≥ 90, Accessibility ≥ 95, SEO = 100, Best Practices ≥ 95, measured on home and one project.

**Stop before the final audit.**

### Phase 6 — Final audit (Claude Opus, effort `high`)

**Scope:** An independent review of the full diff covering:

- architecture boundaries;
- accessibility (keyboard pass, screen-reader labels, contrast in the three themes);
- SEO output;
- the CSP and headers;
- bundle size (target: initial JS ≤ 150 kB gzipped on home);
- the test and build results;
- the visual parity report;
- the handling of unreferenced assets.

Only fixes the owner approves within this phase are applied. The phase produces a commit-readiness report. No commit or push unless separately requested.

---

## 10. Validation matrix

| Area | Check | Tool | Phase | Expected |
|---|---|---|---|---|
| Types | strict typecheck incl. route types | `react-router typegen && tsc` | 2+ | 0 errors |
| i18n | key parity, array lengths, no empty strings | Vitest | 3+ | pass |
| i18n | `localizePath`/`stripLocale` round-trip for all routes | Vitest | 3+ | pass |
| Data | every slug has metadata, locale copy, images and a pre-render path | Vitest | 3+ | pass |
| Contact | `validate()` cases; submit mapping; honeypot short-circuit | Vitest + RTL | 4 | pass |
| Appearance | precedence: stored > system; independence of contrast | Vitest + RTL | 4 | pass |
| Routes | direct load of 18 paths + `/404` + unknown slug | Playwright on `build/client` (static server) and the Vercel Preview | 3–5 | 200 / 404 as specified |
| Legacy | `/#projects/<slug>` → clean URL; section anchors scroll | Playwright | 4 | pass |
| Language | switch EN↔PT↔ES on home and project; `lang` persisted; `<html lang>` | Playwright | 4 | pass |
| Theme | toggle, reload with no flash (screenshot at first paint, `prefers-color-scheme` emulation) | Playwright | 4 | pass |
| Responsive / visual | widths 360/768/1024/1440/2560 × light/dark/HC versus baseline | Playwright screenshots | 3–6 | within threshold |
| Accessibility | axe on home + project in 3 themes; keyboard-only path through nav, cards, dialog, form | `@axe-core/playwright` + manual | 4–6 | no serious/critical |
| Motion | `prefers-reduced-motion: reduce` → no GSAP tweens, static typewriter | Playwright | 4 | pass |
| SEO | per-page head contents without JS; sitemap URLs = route list; `hreflang` reciprocity | `curl` + Vitest on build output | 5 | pass |
| Security | CSP violations = 0; headers present; no inline script without a hash | Playwright console listener, `curl -I` | 5–6 | pass |
| Performance | Lighthouse budgets (Phase 5); initial JS budget | Lighthouse, build stats | 5–6 | meets targets |

---

## 11. Risks and rollback

| Risk | Severity | Likelihood | Mitigation | Detection | Rollback boundary |
|---|---|---|---|---|---|
| Visual regressions from Preflight and the CSS → utility conversion | High | High | D13 parity-first port, per-widget conversion, baseline diffs | Playwright visual diffs | revert the widget's CSS conversion |
| Vercel builds the RR app as functions or serves the wrong output dir | High | Medium | explicit `vercel.json`, Preview validation before promotion | Preview checks in 8.2 | do not promote; production unaffected |
| CSP blocks React Router hydration scripts | High | Medium | post-build hashing of every inline script per file, a console-violation E2E | Playwright console listener | add the missing hash (never `'unsafe-inline'`) |
| Hydration mismatch on `<html class>` / theme icons | Medium | High | `suppressHydrationWarning` on `<html>`, appearance-dependent icons rendered after mount | console warnings in E2E | — |
| Locale URL scheme changes how existing PT/ES visitors land | Medium | Medium | D3 redirect on `/` preserves precedence; stored key reused | E2E with `pt-BR` locale | revert to client-only switching (D2 alternative) |
| Legacy hash links shared on LinkedIn or résumés break | Medium | Low | D5 redirect with E2E coverage | E2E | — |
| React Router 8 / TypeScript 7 ecosystem churn | Medium | Medium | pin exact versions in Phase 2; TS 6 fallback | typecheck/build | pin previous minor |
| i18n bundle or locale `.data` size inflates first load | Low | Medium | per-locale dynamic import in the loader | build stats | — |
| GA under- or over-counting after the switch to client navigation | Low | Medium | explicit `page_view` per location change, `send_page_view:false` | GA DebugView (owner) | — |
| Accidental loss of unreferenced assets | Low | Low | assets untouched until Phase 6 owner decision | git diff | `git checkout` the file |

**Global rollback:** production stays on the vanilla deployment until Phase 5 is validated on a Preview. After promotion, Vercel Instant Rollback restores the previous deployment in seconds. Repository rollback is reverting the merge commit.

---

## 12. Open questions

None of these block the recommendation.

1. **CV links (D26):** which Google Drive files are current? `cv.js` (desktop, hero, contact) or `mobileNav.js` (mobile drawer)? Default if unanswered: the `cv.js` set.
2. **Locale URLs (D2), persistence change (D4), nav on project pages (D6):** owner approval of these public or UX-visible changes.
3. **Vercel dashboard settings:** the current Framework Preset, Build Command, Output Directory and Node version. They aren't in the repo; `vercel.json` will override them.
4. **Web3Forms dashboard:** is the domain allow-list enabled for `www.dasilva-thiago.dev`? Is there a monthly quota concern?
5. **Hero title copy:** `i'm thiago,` (EN, current HTML) versus `thiago,` (PT/ES, current locale files). Keep as-is, or align?
6. **Project-card shadow (defect 14):** keep today's (shadow-less) rendering, or restore the intended shadow?
7. **Unreferenced images:** `evelyn_website.webp`, `about_picture1.webp` and `profile_edit1.webp` (used only by the broken JSON-LD URL). Keep or delete?
8. **Project `updatedAt` dates** for sitemap `lastmod`. Default: the last git commit date touching each project's content, filled in during Phase 5.

---

## 13. Phase status

| Phase | Model / effort | Status | Notes |
|---|---|---|---|
| 1. Planning | Claude Opus / `high` | ✅ Complete (2026-11-03) | This document. No code, config or dependency changes. Read-only checks run: `git`, live `curl` against production, `vitest run` (fails — defect 3), npm registry queries. |
| 2. Foundation | Claude Sonnet / `medium` | ✅ Complete (2026-11-03) | Branch `migration/react`. See "Phase 2 results" below. |
| 3. Componentization | Claude Sonnet / `high` | ✅ Complete (2026-11-03) | See "Phase 3 results" below. |
| 4. Functionality | Claude Sonnet / `high` | ✅ Complete (2026-11-03) | See "Phase 4 results" below. Includes the owner-requested Tailwind conversion and DM Sans. |
| 5. SEO and production | Claude Sonnet / `high` | ✅ Complete locally (2026-11-03); Vercel Preview validation pending | See "Phase 5 results" below. |
| 6. Final audit | Claude Opus / `high` | ✅ Complete (2026-11-03) | Audit + approved fixes; see the two Phase 6 sections below. |

### Phase 1 quality gate

| Check | Result |
|---|---|
| Plan reflects the checked-out branch, not the README snapshot | Yes. It is based on `43f5337`; README discrepancies are listed in 2.3. |
| Every user-visible feature has a preservation or retirement decision | Yes. See sections 3 and 6, and D1–D28. |
| No route, locale, theme preference, Web3Forms behavior or SEO asset silently dropped | Yes. `/locales/*.json` retirement and AOS removal are explicit. |
| `server/` not inspected, migrated or referenced as active architecture | Yes. It was excluded from every listing and search. |
| Structure not overengineered; each layer has a concrete responsibility | Yes. See 4.2 and 4.3. |
| Static pre-rendering and URL compatibility feasible on the verified host | Yes, on Vercel static output. It is validated on a Preview deployment in Phase 5; the fallback is the `framework`/output override in 8.2. |
| No implementation disguised as planning | Yes. Only this file was created. |

References:

- React Router: [pre-rendering](https://reactrouter.com/how-to/pre-rendering), [rendering strategies](https://reactrouter.com/start/framework/rendering), [official default template](https://github.com/remix-run/react-router-templates/tree/main/default)
- Tailwind CSS: [Vite installation](https://tailwindcss.com/docs/installation/using-vite)
- React: [TypeScript](https://react.dev/learn/typescript)
- Vercel: [React Router](https://vercel.com/docs/frameworks/frontend/react-router), [`vercel.json` `trailingSlash`](https://vercel.com/docs/project-configuration/vercel-json#trailingslash)

### Phase 2 results

Installed (resolved from the registry on 2026-11-03; see `package-lock.json`): react / react-dom 19.3.1, react-router + @react-router/dev 8.5.1, typescript 7.0.2, tailwindcss + @tailwindcss/vite 4.3.4, @playwright/test 1.64.1, @testing-library/react 16.3.3, @testing-library/jest-dom 7.0.1, @types/react(-dom) 19.3.0, @types/node 26.6.6. Vite stays at 8.1.4.

Added: `vite.config.ts`, `react-router.config.ts` (`appDirectory: "src/app"`, `ssr: false`, `prerender: ["/"]`), `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`; legacy `src/js` excluded), `vitest.config.ts` (jsdom), `playwright.config.ts`, `src/app/{root.tsx,routes.ts,routes/home.tsx,pre-paint.ts,styles/app.css}`, `src/shared/styles/tokens.css` (a verbatim copy of `variables.css`), `tests/e2e/foundation.spec.ts`, `tests/visual-baseline/capture.mjs`.

Scripts: `dev`, `build`, `preview`, `typecheck`, `test`, `test:watch`, `test:e2e`, `baseline:capture`. The `prebuild` sitemap hook was removed (`public/sitemap.xml` is now static until Phase 5).

Validation: `npm run typecheck` (TypeScript 7.0.2) passes with 0 errors; `npm test` passes (3 tests: pre-paint precedence); `npm run build` pre-renders `/` and the SPA fallback; `npm run test:e2e` passes (3 tests: pre-paint classes before first paint with dark + high contrast, no console warnings or errors on hydration, Tailwind utilities resolve to the design tokens); `react-router dev` serves the route.

Baseline: 17 screenshots of production (`43f5337`) — widths 360/768/1024/1440/2560 × light/dark/high-contrast (EN), plus PT at 1440 and the eduassets article overlay at 1440 — are generated by `npm run baseline:capture` into `tests/visual-baseline/shots/` (git-ignored, regenerable; ~8 MB). Animations are disabled and the page is scrolled fully so ScrollTrigger content is visible.

Notes and deviations:
- The legacy `index.html`, `src/js`, `src/css`, `public/locales`, `public/sitemap.xml` and `scripts/update-sitemap.js` are untouched. Framework Mode ignores the root `index.html`; no move to `legacy/` was needed. Leftover `public/*` files are still copied to `build/client` until Phase 5.
- The legacy `src/js/__tests__/i18n.test.js` is still broken and excluded by the Vitest `include`. It is replaced by the locale parity test in Phase 3.
- `npm audit` (root lockfile) reports 7 findings (2 moderate, 5 high), all in dev tooling: `vite` 8.1.4 (affected range 8.0.0–8.1.5), `vitest`/`@vitest/mocker`, `postcss`, `nanoid`, `source-map-js` and `undici`. `npm audit --omit=dev` reports 0 (nothing ships to production). Upgrading `vite` and `vitest` is a Phase 6 audit item, or earlier if the owner approves.
- The Tailwind breakpoint tokens `xs` (30rem) and `3xl` (87.5rem) are placeholders. The real breakpoint mapping lands with the CSS port in Phase 3.

### Phase 3 results

**Structure built** (`src/`): `app` (root, routes, pre-paint, `app.css`), `pages` (home, project), `widgets` (site-nav, hero, about, skills, projects, contact, footer), `features` (open-cv, toggle-appearance, switch-language, contact-form), `entities` (project, experience, skill), `shared` (config, i18n, lib, ui, styles, assets). Routes: `/` and `/projects/:slug`, with all 5 slugs pre-rendered (`react-router.config.ts` derives the paths from `entities/project/model/slugs.ts`).

**Locale resources** moved to `src/shared/i18n/resources/{en,pt,es}.json` with the restructured, slug/id-keyed shape (127 keys each, identical key sets and array lengths). English holds all copy that used to live in `index.html`; article text is stored as paragraph arrays. The `projects-toggle-*` keys were dropped. `t()`/`tList()` in `shared/i18n/t.ts` are typed against `en.json` (a misspelled key fails `tsc`) and are an English-only, static stand-in until Phase 4 swaps in react-i18next behind the same signatures.

**Validation**
- `npm run typecheck`: 0 errors (TypeScript 7.0.2, strict).
- `npm test`: 24 tests pass (locale parity, no empty strings, balanced `<em>`, project data completeness, `Rich` never injects markup, architecture boundaries incl. "no innerHTML outside the root pre-paint script").
- `npm run build`: pre-renders `/` and the 5 project pages.
- `npm run test:e2e`: 21 tests pass (every route 200, unknown slug 404, hydration with zero console errors/warnings on all 6 pages, card click → project page → Back link → `/#projects`, hero image actually loads, literal `<head>` text preserved, all images have dimensions and alt).
- **Visual parity vs production (`43f5337`)**: 15 home screenshots (360/768/1024/1440/2560 × light/dark/high-contrast) differ by 0.01–0.03 % of pixels (threshold 0.1 %); element geometry matches to the pixel (`tests/visual-baseline/measure.mjs`). Measured differences are the intentional ones below.

**Intentional differences**
- Project article hero images now load (they were a 404 in production — defect 2). The article screenshot diff (38.6 %) is that image.
- English "Acessar o sistema" (Portuguese text in the English page) is now "Access the system".
- Icon-only controls and footer links have accessible names; the closed mobile drawer is `inert`; project cards are real links (title link stretched over the card; inner GitHub/live links stay independent).
- The theme toggle renders both icons and CSS picks one from `html.dark-mode`, so there is no flash or hydration mismatch.
- The `es.json` aviation description had a half-Portuguese sentence; it is now Spanish.
- New PT/ES copy that did not exist before (owner to review): `nav.aria.projects`, `sections.about.{education,experience}`, `sections.skills.{consolidated,evolving}`, `a11y.*`, SEDUC tags, image alt texts, `contact.form.sending`, and the `<em>` highlight in `about.quote`.

**New findings (add to section 2.3)**
- **22.** `--font-body: 'DM Sans', system-ui` never matches the Fontsource family `DM Sans Variable`, so body text falls back to `system-ui` in production. Parity was kept (tokens copied verbatim). Open question: keep, or apply DM Sans for real.
- **23.** The English page showed the Portuguese button label "Acessar o sistema" (fixed above).
- **24.** `es.json` aviation description contained Portuguese (fixed above).
- **25.** `vite preview` serves `/index.html` for `/projects/<slug>` (no trailing slash), which breaks hydration. `npm run preview` and the Playwright server now use `tests/serve-static.mjs`, which maps `/path` → `path/index.html` and returns 404 otherwise. The same mapping must be verified on the Vercel Preview in Phase 5 (D25).

**Deviations from the plan**
- **D13 step 2 is not done.** The legacy partials were ported unchanged into `@layer components` next to their widgets (`@import … layer(components)`, original order), and that is what achieved parity. No widget has been converted to Tailwind utilities yet. Recommendation: convert per widget behind the visual-diff gate (`npm run baseline:capture` + `node tests/visual-baseline/compare.mjs`), starting with footer, contact and about. Owner to decide whether that happens at the start of Phase 4 or as a separate follow-up.
- **Import boundaries are enforced by a Vitest test** (`src/architecture.test.ts`: upward imports and cross-slice imports fail) instead of an ESLint rule; no lint tooling was added.
- **Preflight interactions found and handled:** global `line-height: 1.5` (reset to `normal`), legacy `* { margin: 0 }` beating layered `body { margin: auto }` (html/body rules are now unlayered), Font Awesome CSS placed in `layer(base)`, and the UA default `<button>` font size (13.33 px) preserved on the expandable About cards.
- `html`/`body` selectors that used `body.high-contrast` now use `html.high-contrast` (D12). `body.scrolled-past-hero` is left for Phase 4.
- **D6 deferred:** the site navigation is not yet rendered on project pages (it needs the Phase 4 behavior). Owner approval for D6 is still pending.
- The CDN stylesheets for flag-icons and hamburgers were replaced by local code (`flag-icons` npm SVGs; `hamburger.css`). Legacy `index.html`, `src/js`, `src/css`, `public/locales`, `public/sitemap.xml`, `scripts/update-sitemap.js` and the original `src/assets` copies are still in the tree (assets were copied, not moved); the broken legacy `i18n.test.js` was deleted now that its replacement exists.
- Still static (Phase 4): language switching, theme/contrast toggles, nav reveal and drawer, experience dialog, CV links, contact form logic, typewriter, GSAP animations, legacy hash redirect, footer year hydration.

### Phase 4 results

Scope extended by the owner during the phase: **(a)** convert every widget to Tailwind in this phase (D13 step 2), **(b)** apply DM Sans for real, **(c)** decide what to do with the legacy files at the end (not decided yet, see below).

**Functionality delivered**
- **i18n:** `i18next` + `react-i18next` behind typed `useT()` / `useResources()` / `useLocalizedPath()` (`src/shared/i18n/`). The root loader derives the locale from the URL and dynamically imports only that locale's JSON; `shouldRevalidate` re-runs it when the locale prefix changes. Routes: `/`, `/pt`, `/es` and `projects/:slug` under each (18 pre-rendered documents plus their `.data` files). `<html lang>` is `en` / `pt-BR` / `es`.
- **Locale precedence (D3/D4):** the first visit to the unprefixed root follows stored `lang`, then `navigator.language`, then English; `/pt` and `/es` are never redirected; project URLs opened directly are never redirected; the preference is persisted only when the user switches language explicitly. The switch is a `replace` navigation that keeps the hash and the scroll position.
- **Legacy links (D5):** `/#projects/<slug>` redirects to the real (localized) project route; an unknown slug falls back to `/#projects`; plain section anchors are untouched.
- **Appearance:** `AppearanceProvider` (in `features/toggle-appearance`, not `app/providers`, so features can import it without breaking the layer rule) reads `<html>` classes through \`useSyncExternalStore\`, writes them on toggle, persists \`darkMode\`/\`highContrast\`, follows live system changes only while nothing is stored, and updates \`theme-color\`. Toggle buttons expose \`aria-pressed\`.
- **Navigation:** reveal-on-scroll logic and the 70 px hover zone, mobile drawer (scroll lock, Escape, backdrop, link click, focus in/out, \`inert\` while closed), language dropdown (outside click, Escape, focus return). D6 is done: project pages show the navigation floating over the hero.
- **Experience dialog:** native \`<dialog>\` (focus containment, Escape, focus restoration, \`aria-labelledby\` per entry, scroll lock while open). Fixes defects 8 and 9.
- **Contact:** validation, honeypot, live counter with tiers, loading/success/error states, localized messages, \`aria-live\`, same Web3Forms payload. Fixes defect 11 (the "Sending…" label is localized; the counter reset is a state, not leftover classes).
- **CV links:** one source (\`features/open-cv/cvLinks.ts\`, the \`cv.js\` set) for every button, including the mobile drawer. Defect 12 resolved with that default; **the owner still has to confirm which Drive files are current** (open question 1).
- **Motion:** GSAP through \`@gsap/react\` (\`useGSAP\`, scoped, cleaned up) gated by \`gsap.matchMedia('(prefers-reduced-motion: no-preference)')\`; the typewriter (first phrase is rendered in full, then deleted and cycled; static under reduced motion); AOS removed (dependency uninstalled). Only elements that exist are animated (D11).

**Tailwind conversion (D13 step 2)**: every widget, entity, feature and page is now styled with utilities. Named breakpoints in \`@theme\` (\`max-bpN\` = legacy \`max-width: Npx\`, \`min-bpN\` = \`min-width\`) replaced arbitrary \`max-[…px]\` variants, which Tailwind does not order by value. CSS that remains by design: \`tokens.css\` (design tokens, light/dark/high-contrast), \`hamburger.css\` (three-bar morph), \`dialog.css\` (\`@starting-style\` entry transition), \`scrollbar.css\` (WebKit pseudo-elements), and the \`@layer base\` rules in \`app.css\` (headings, links, focus ring). Tailwind named font sizes (\`text-sm\`, \`text-base\`) are avoided on purpose because they inject a line-height the legacy design did not have.

**DM Sans:** the token now names the real family (\`'DM Sans Variable'\`), body text renders in DM Sans, and an E2E test asserts the three families are loaded and applied. This is an intentional, site-wide visual change, so the production screenshots are no longer a typographic reference. The hero description uses \`text-balance\` because the wider font left a one-word second line.

**Validation**
- \`npm run typecheck\`: 0 errors. \`npm test\`: 68 pass (adds path helpers, contact validation/submit/counter tiers). \`npm run build\`: 18 documents + data files.
- \`npm run test:e2e\`: **79 pass**, covering language switch/persistence/redirects/legacy hashes, theme and contrast (including no flash on reload and live system changes), navigation reveal, mobile drawer, dialog, contact (mocked provider: empty, invalid, honeypot, success, provider failure, network error, payload), CV links per locale, reduced motion, typewriter, scroll reveals, hydration without warnings in every locale, flag rendering, typography, and axe (WCAG 2.0/2.1 A+AA) on home and project pages in light, dark and high contrast, in three locales, plus the open dialog: **0 serious or critical violations**.
- **Visual parity of the Tailwind conversion, measured before DM Sans** (still \`system-ui\`): all 15 English home screenshots differ from production by 0.01–0.04 % of pixels (PT at 1440: 0.03 %). The project article differs only by the hero image that was broken in production, the corrected "Access the system" label, and the floating navigation (D6).
- Lesson recorded: a pixel threshold of 0.1 % can hide a 20×15 px element. The English flag was not rendering (Vite inlines \`us.svg\` as a \`data:\` URI and an unquoted \`url(…)\` was invalid) and the diff did not notice; geometry measurement (\`tests/visual-baseline/measure.mjs\`) and explicit E2E assertions are part of the gate for that reason.

**Intentional differences from production (cumulative)**: project index numbers ("01"…) are at full opacity (the legacy 0.6 failed WCAG contrast); the contrast and dark toggles expose \`aria-pressed\`; the navigation has an accessible name; the typewriter starts from a full phrase; the hero greeting also fades in; DM Sans.

**Open items and risks carried to Phase 5/6**
- **Bundle size is over the plan's budget.** The home page loads about 218 kB gzip of JavaScript (entry 67, home 57, jsx-runtime 40, SiteNav 34, path 20) against the ≤150 kB target; CSS is 14 kB gzip. Likely contributors: GSAP + ScrollTrigger, the Font Awesome icon sets, inlined flag SVGs, and i18next. Phase 5 should split the animation code (load ScrollTrigger only on the home page), prune icons, and re-measure; Phase 6 audits the result.
- The cursor hover zone (\`#nav-trigger\`, top 70 px) still intercepts clicks in that strip while the navbar is hidden, exactly as in the legacy site.
- \`npm audit\` dev-tooling findings (see Phase 2) are untouched.
- Hero title copy is aligned again in the locale files (\`i'm thiago,\` / \`sou thiago,\` / \`soy thiago,\`), which settles open question 5 as "keep".
- The CSP, per-route metadata, sitemap, \`vercel.json\`, GA route tracking, README and the removal of the legacy tree are Phase 5.

**Legacy files (decision deferred to the owner, per the request).** Still in the tree and unused by the build: \`index.html\`, \`src/js/\`, \`src/css/\`, \`public/locales/\`, \`public/sitemap.xml\`, \`scripts/update-sitemap.js\`, and the original copies in \`src/assets/\`. The \`server/\` directory remains out of scope. The React app does not read any of them.

### Phase 5 results

**Delivered**
- **Routes and output:** 18 pre-rendered documents (home + 5 projects × 3 locales), their `.data` files, and a real `404.html` (the prerendered `/404` route is moved to `404.html`; its directory and data file are removed so it is never reachable with a 200). The SPA fallback is deleted. `public/` is no longer published: `vite.config.ts` sets `publicDir: "static"`, which holds `robots.txt`, `og/*` (stable share images) and `images/profile.webp`. `/locales/*.json` is therefore gone from production.
- **Metadata (`src/app/seo/`):** per-route `meta` for title, description, `robots`, canonical (no trailing slash except the root), four `hreflang` alternates including `x-default`, Open Graph (type, title, description, url, image with dimensions, `og:locale` plus alternates) and Twitter cards. JSON-LD: home = `ProfilePage` + `Person` + `WebSite` (image now a real URL, `inLanguage` by locale); projects = `SoftwareSourceCode` + `BreadcrumbList` referencing the Person by `@id` (no duplication). New locale keys: `meta.*` and `notFound.*` (new PT/ES copy for the owner to review).
- **Sitemap:** `scripts/postbuild.ts` writes `sitemap.xml` with the 18 URLs and reciprocal `xhtml:link` alternates. `lastmod` comes from typed content dates (`PROJECT_UPDATED_AT`), not from the build date. The old `scripts/update-sitemap.js` is no longer used.
- **CSP:** `scripts/csp.ts` hashes every executable inline script of each HTML file (pre-paint, analytics bootstrap, the React Router hydration scripts) and injects one `<meta http-equiv="Content-Security-Policy">` right after the charset declaration (kept inside the first 1024 bytes). No `'unsafe-inline'`/`'unsafe-eval'` for scripts; third-party origins are limited to Google Analytics/Tag Manager and Web3Forms. Removed versus the legacy policy: `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `fonts.gstatic.com` and the four stale hashes. `style-src` keeps `'unsafe-inline'` for inline `style=""` attributes.
- **`vercel.json`:** `framework: null`, `buildCommand`, `outputDirectory: "build/client"`, `trailingSlash: false`, security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`), immutable caching for `/assets/*`, one-day caching for `/og/*` and `/images/*`. `package.json` gained `engines.node >= 20.19.0`.
- **Analytics:** the bootstrap script only activates on `dasilva-thiago.dev` (previews and local runs send nothing) and `usePageViews` sends one `page_view` per pathname change (`send_page_view: false`).
- **404:** real `NotFoundPage` (also used as the project route's error boundary), `noindex`, localized, with a link home.
- **First-visit language redirect moved into the pre-paint script.** The React hook caused an English render, a hydration and a `.data` fetch before landing on `/pt`; the inline script now redirects before anything paints (the hook remains for legacy `#projects/<slug>` links). The script is unit-tested with fake `location`/`localStorage`/`navigator`.

**Bundle and performance work**
- First-load JavaScript for the home page: **218 kB → 139 kB gzip** (budget ≤150 kB met). Changes: GSAP and ScrollTrigger load on idle time through `useMotion` (never before first paint); the hero entrance is pure CSS (`animate-fade-up`, no JS, no flash, off under reduced motion); Font Awesome's React runtime replaced by a 20-line `Icon` that renders the same icon data as inline SVG; `i18next` and `react-i18next` replaced by a typed ~50-line `I18nProvider` with the same `useT()` API.
- **Deviation from decision D7:** i18next was dropped. The measured cost was about 25 kB gzip and the site uses neither plurals nor interpolation, so a small typed context is enough. If plurals or formatting are ever needed, adding a library back is a contained change inside `src/shared/i18n/`.
- Asset weight: the About photo (an 816 kB PNG saved as `.webp`, shown at 175 px) is now a 30 kB WebP; the dev-portfolio screenshot went from 236 kB PNG to 17 kB WebP (the PNG is kept only for the Open Graph image); the Spanish flag (81 kB SVG with a coat of arms) is a minimal stripes-only SVG; menu flags are requested only when the language menu or drawer is first opened; the three critical fonts are preloaded.
- Lighthouse (Chromium via Playwright, built output served with brotli/gzip like the CDN): **desktop** 98 (home) / 100 (project); **mobile, simulated slow 4G + 4x CPU** 85–86 (home) / 93 (project). Accessibility, Best Practices and SEO are **100** on every run. CLS ≤ 0.004, TBT ≈ 0. The mobile home score is below the plan's 90 target; the remaining cost is first-load JavaScript execution and the LCP text being repainted when web fonts arrive. Candidate follow-ups for Phase 6: trim React Router/React DOM entry code, subset the italic font, evaluate `font-display: optional`.

**Validation**
- `npm run typecheck`: 0 errors. `npm test`: **98 pass** (adds pre-paint redirect, CSP builder, sitemap reciprocity and canonical match, metadata and JSON-LD shape, path helpers). `npm run build`: 18 documents + 404 + sitemap.
- `npm run test:e2e`: **129 pass** (in multiple full runs; two intermittent failures seen along the way were traced and fixed: the axe dialog check ran while a section fade was in progress, and a test read styles before the render-blocking stylesheet loaded). A third intermittent failure of the "unknown URLs return 404" check occurred once in 4 full runs and did not reproduce in 75 repetitions.
- New E2E coverage: every route's title, description, canonical, `hreflang`, language attribute, Open Graph and JSON-LD; every page's CSP contains the hash of every inline script that is actually on it, and the policy loads with **zero CSP violations** on home, PT, a localized project and the 404 page, including while exercising theme, language, dialog, contact form and navigation; analytics inactive on other hosts and sending one `page_view` per route change on the production hostname (exercised by serving the build under that name); 404 with `noindex` for unknown URLs; trailing-slash redirect; retired files (`/locales/*`, `/__spa-fallback.html`, `/404/index.html`) return 404; the sitemap lists 18 URLs and each returns 200; share images exist.

**What was NOT done (cannot be done from this machine)**
- **No Vercel Preview deployment was created or inspected.** Everything above was verified on a local static host (`tests/serve-static.mjs`) that mirrors the behavior this site relies on (directory index for `/path`, `308` for a trailing slash, real 404 page, compression). The checklist to run on the Preview is in "Vercel configuration" below.
- Rich Results Test, Facebook/LinkedIn share debuggers and a Search Console sitemap submission need accounts and a public URL; the owner should run them after the Preview exists.

**Vercel configuration — what may need to change in the dashboard**
`vercel.json` takes precedence over the Project Settings for the framework preset, build command and output directory, so most settings need no change. Check these:
1. **Node.js Version** (Settings → General): must be 20.19+ (22.x or 24.x recommended). Vite 8 and React Router 8 do not build on Node 18/20.0–20.18, and an old pinned value there would fail the build.
2. **Framework Preset / Build & Output settings:** will show as overridden by `vercel.json` (`Other`, `npm run build`, `build/client`). No action; just do not re-enable the old `dist` output in the UI.
3. **Install command:** default (`npm install`) is fine. No environment variables are required.
4. **Root Directory:** keep the repository root (the `server/` folder is not built or deployed).
5. **Domains:** unchanged (apex → `www` redirect stays in Settings → Domains).
6. **After the first Preview deployment, verify:** `/`, `/pt`, `/es` and a project page load directly with their own `<title>`; `/projects/eduassets/` redirects to `/projects/eduassets`; `/projects/does-not-exist` shows the 404 page with a real 404 status; `/locales/pt.json` is 404; response headers include the four security headers; `/sitemap.xml` and `/robots.txt` load; client navigation between languages works (the `/pt.data` and `/projects/<slug>.data` requests return 200); the browser console shows no CSP violations.
7. If a clean URL (`/projects/<slug>`) does not resolve to its `index.html` on Vercel, the fallback is to add `"cleanUrls": true` to `vercel.json`; rollback is Instant Rollback to the last vanilla deployment.

**Legacy files (still in the tree, unused by the React build; deletion waits for the owner's go-ahead after the Preview is validated).** Proposed list:
- `index.html`, `src/js/` (including the removed i18n test), `src/css/`, `src/assets/` (the React app uses its own copies in `src/shared/assets/` and `static/`), `public/` (legacy `locales/`, `sitemap.xml`, `robots.txt`), `scripts/update-sitemap.js`, `dist/` (already git-ignored).
- `server/` is retired and was never touched; whether to remove it from the repository is a separate owner decision.
- `src/shared/assets/img` also holds three images no page references (`about_picture1.webp`, `evelyn_website.webp`, `preview_mobile.png`) and the original unoptimized `profile_edit2.webp` and `preview.png`; they can go with the legacy cleanup.

### Phase 6 — final audit report (Claude Opus, 2026-11-03)

Scope: the full working-tree diff on `migration/react` (base `43f5337`, nothing committed yet), the production build, the test suites, and the deployment configuration. `server/` was not inspected.

**Verified as sound**
- **Architecture:** layer direction and slice isolation are enforced by `src/architecture.test.ts` and pass. `dangerouslySetInnerHTML` appears only for the two build-time constants in `root.tsx` (pre-paint and analytics bootstrap). External links use `rel="noopener noreferrer"`; `window.open` uses `noopener,noreferrer`.
- **Build and tests:** `typecheck` clean; 98 unit tests; 129 E2E tests (repeated full runs green after two test-timing fixes); 20 HTML documents (18 routes + `index`-style root + `404.html`).
- **Security:** per-page CSP hashes cover every inline script (tested on every route) with zero violations while exercising the main flows; production dependencies have **0** known vulnerabilities; the Web3Forms key is a public client key by design.
- **Accessibility:** axe reports 0 serious/critical issues on home and project pages in all three themes and three locales and on the open dialog; desktop keyboard order is logical and every focusable element shows a focus ring.
- **SEO:** unique titles, canonical, reciprocal `hreflang`, Open Graph/Twitter, JSON-LD shapes and the sitemap match each other (unit + E2E).
- **Performance:** first-load JS 139 kB gzip (budget met); desktop Lighthouse 98/100.

**Findings** (severity, evidence, proposed fix — nothing below has been changed yet)

| # | Severity | Finding | Evidence | Proposed fix |
|---|---|---|---|---|
| A1 | Medium | CSP is narrower than Google's documented policy for GA4, so analytics hits may be blocked in production (cannot be observed locally because analytics only runs on the production host). | Google tag CSP guide (GA without Ads): `img-src https://www.googletagmanager.com https://*.google-analytics.com`; `connect-src https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com`. Ours lacks `*.google-analytics.com` in `img-src` and `*.google.com` in `connect-src`. | Align `scripts/csp.ts` with the guide; add a unit assertion. |
| A2 | Medium | The open mobile drawer does not contain keyboard focus: Tab leaves it and reaches page content behind the overlay. | Scripted check at 390 px: focus escaped the drawer on 15 of 25 Tab presses (first targets: hero GitHub/LinkedIn/Email links). | While the drawer is open, mark everything outside it `inert` (same pattern as the dialog); add an E2E assertion. |
| A3 | Medium | Dev-tooling vulnerabilities. | `npm audit`: 7 (5 high) in `vite` 8.1.4 (affected 8.0.0–8.1.5), `vitest`/`@vitest/mocker`, `postcss`, `nanoid`, `source-map-js`, `undici`. `--omit=dev`: 0. | `npm audit fix` within the declared ranges, then rerun the full suite. |
| A4 | Medium (content) | The "Developer Portfolio" project still describes the old site: card and article say vanilla JS with no framework; tech chips are HTML/CSS/JavaScript/Vite; the card, hero and share image are a screenshot of the previous design. | `src/shared/i18n/resources/*.json` → `projects.dev-portfolio`; `entities/project/model/projects.ts`; `static/og/dev-portfolio.png`. | Owner-approved new copy in EN/PT/ES (draft can be provided), tech list React · TypeScript · Tailwind CSS · React Router · Vite, and a fresh screenshot generated from the new site. |
| A5 | Low | The JSON-LD person image is a JPEG saved as `.webp` and its declared size is wrong (231×300 declared, 400×400 actual). Two legacy images have the same extension mismatch. | Byte signatures: `static/images/profile.webp` = JFIF 400×400; `about_picture1.webp` = JPEG; `profile_edit2.webp` = PNG. | Rename to `profile.jpg`, fix `width`/`height` in `src/app/seo/jsonld.ts`; the other two go away with the legacy cleanup. |
| A6 | Low | Project share images are WebP with non-standard aspect ratios (e.g. 1277×488), which some platforms crop or may not render. | `PROJECT_OG_IMAGE` in `entities/project/model/slugs.ts`. | Generate 1200×630 JPEG share cards (letterboxed on the theme background) at build or once into `static/og/`. |
| A7 | Low | Mobile Lighthouse for the home page is 85–86 (target 90); project page 93. | Simulated slow 4G + 4× CPU; LCP is the hero text repainted after web fonts and hydration. | Optional optimization pass (font subsetting / `font-display: optional` for the italic face, trimming the entry chunk). Not a correctness issue. |
| A8 | Low | The first-visit language logic now exists twice: the pre-paint script (effective) and `useEntryRedirect` (unreachable in practice for that case). | `src/app/pre-paint.ts`, `features/locale-entry/useEntryRedirect.ts`, `shared/i18n/preference.ts` (`resolveEntryLocale`, `detectBrowserLocale`). | Reduce the hook to the legacy `#projects/<slug>` redirect (honoring the current locale) and drop the unused helpers. |
| A9 | Low | Small hygiene items. | `eslint-disable` comment in `shared/lib/motion.ts` (no ESLint in the project); README says "CI-style tests" but there is no CI; `playwright.config.ts` reuses any server already on :4173 (`reuseExistingServer: true`), a plausible cause of the single unreproduced 404-test failure. | Remove the comment, fix the README wording, use `reuseExistingServer: !process.env.CI`; optionally add a GitHub Actions workflow (typecheck, unit, build, E2E). |
| A10 | Info | The 404 page is English for unknown URLs under `/pt` and `/es`. | Static hosting serves a single `404.html`. | Accept, or prerender localized 404s and add Vercel routing rules per prefix. |

**Commit readiness:** not ready yet. Blocking items: owner decision on A1–A9, a Vercel Preview validation (checklist in the Phase 5 results), and the legacy-file decision. Everything is uncommitted on `migration/react`; the suggested history is one commit for the migration and a separate commit for the legacy removal, so the removal can be reverted independently.

### Phase 6 — approved fixes applied (2026-11-03)

The owner approved A1–A6, A8–A9 and A10, and accepted A7 as is ("performance is fine and above average").

| # | Status | What changed |
|---|---|---|
| A1 | ✅ Fixed | `scripts/csp.ts` now matches Google's GA4 guidance: `img-src` adds `https://*.google-analytics.com`, `connect-src` adds `https://*.google.com` (plus the existing hosts). Unit test asserts every documented source. |
| A2 | ✅ Fixed | While the mobile drawer is open, every other top-level element is `inert` (`shared/lib/inertOutside.ts`), so Tab and screen readers stay inside it; restored on close. E2E: 25 Tab presses never leave the drawer; the page is inert while open and interactive again after Escape. |
| A3 | ✅ Fixed | `npm audit fix` within declared ranges: vite 8.3.5, vitest 4.1.12, postcss 8.5.32, nanoid 3.3.20, undici 7.30.1. `npm audit`: 0 vulnerabilities. |
| A4 | ✅ Fixed (copy for owner review) | New "Developer Portfolio" description and article in EN/PT/ES describing the React/TypeScript/Tailwind/React Router site; tech chips React · TypeScript · Tailwind CSS · React Router · Vite; new card/hero screenshot of the current site. |
| A5 | ✅ Fixed | `static/images/profile.jpg` (real JPEG, 400×400) and matching JSON-LD dimensions. |
| A6 | ✅ Fixed | New 1200×630 JPEG share images for the home page and all five projects in `static/og/`, generated by `scripts/generate-share-images.mjs` (`npm run og:images`); old WebP/PNG share files removed; metadata updated. |
| A7 | Accepted | Mobile Lighthouse (simulated) on the home page varies between 74 and 89 across identical runs on this machine; project page 93; desktop 99. Accessibility, Best Practices and SEO are 100. |
| A8 | ✅ Fixed | `useEntryRedirect` now only handles legacy `#projects/<slug>` links; the duplicated first-visit logic and its helpers were removed from `shared/i18n/preference.ts`. |
| A9 | ✅ Fixed | Stray `eslint-disable` comment removed; README wording corrected; Playwright reuses a running server only outside CI; `.github/workflows/ci.yml` added (typecheck, unit, build, Playwright with Chromium). |
| A10 | ✅ Fixed | Unknown URLs under `/pt` and `/es` show the 404 in that language (the page loads the locale after hydration and sets `lang` and the title). |

**Defects found while fixing (also fixed)**
- **Unknown project slugs rendered the 404 page twice.** With `projects/:slug`, the browser matched the project route while the static `404.html` came from the splat route, so React Router rendered both trees. Routes are now declared per known slug (`routes.ts`), so unknown slugs fall through to the splat route on the client as well; verified with one `<main>`, the right language and no console errors.
- **Race between the first-visit redirect and the app.** After the pre-paint script calls `location.replace`, the old document keeps running until the new one loads; the app could hydrate it and act on legacy links or send analytics. The script now marks the document (`data-redirecting`), the body stays hidden, and the legacy-link hook and page-view tracking skip it. Unit-tested.
- **Test-infrastructure bottleneck.** The local static host compressed every response with Brotli at maximum quality, synchronously, which stalled under parallel workers and caused intermittent timeouts. Compressed bodies are now cached at a moderate level: the E2E suite went from 3.6–5.6 min to 1.1 min, and a 30-run parallel stress of the redirect passes 30/30 (median 1.2 s).
- **Test-order leak.** The analytics test left network interceptions in flight, and their failure was reported on the next test in the same worker (the "unknown URLs" flake). The test now calls `unrouteAll` before ending.

**Validation after the fixes:** `typecheck` clean; **100** unit tests; build = 18 routes + `404.html` + sitemap; **133** E2E tests passing in two consecutive full runs; `npm audit` 0.

**Commit readiness:** the code is ready to commit on `migration/react`. Still owner-side before merging to `main`: review the new PT/ES copy (A4 and earlier additions), set Node.js ≥ 20.19 in the Vercel project, validate a Preview deployment with the Phase 5 checklist, and decide on the legacy files.
