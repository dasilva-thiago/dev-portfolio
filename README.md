# Thiago da Silva — Developer Portfolio

A modern, responsive, and accessible developer portfolio built from scratch with vanilla JavaScript, showcasing real-world projects, technical skills, and professional experience.

**Live:** [dasilva-thiago.dev](https://www.dasilva-thiago.dev)

---

## Motivation

This portfolio was built to solve a concrete problem: presenting technical skills, projects, and contact information in a clear, professional, and accessible way to recruiters and collaborators.

The project has gone through several iterations — starting as a Bootstrap-based static site and evolving into a custom design system with modular CSS, GSAP-driven animations, and a fully custom i18n implementation. Every architectural decision was made to strengthen my understanding of frontend structure, accessibility, and build tooling, without relying on frontend frameworks.

---

## UI Overview

### Desktop

<p align="center">
  <img src="src/assets/img/preview.png" alt="Portfolio Preview — Desktop" width="800">
</p>

### Mobile

<p align="center">
  <img src="src/assets/img/preview_mobile.png" alt="Portfolio Preview — Mobile" width="300">
</p>

---

## Features

- **Custom design system** — aurora animated background, glassmorphism surfaces, CSS custom properties throughout, no utility-class framework
- **Dark mode & high contrast mode** — both toggle independently, persist via `localStorage`, and use a synchronous inline script in `<head>` to prevent FOUC before first paint
- **Multilingual (i18n)** — English, Portuguese, and Spanish, built with a custom system (no external library). English lives in the HTML via `data-i18n` attributes and in `locales/en.json` for dynamic content; Portuguese and Spanish are lazy-loaded from JSON only on explicit language selection and cached in memory
- **Project article pages** — each project card navigates to a dedicated article overlay at `/#projects/<slug>` (e.g. `/#projects/eduassets`). The overlay uses hash-based routing via `projectRouter.js`, renders translated content from the locale JSON files, and re-renders on language change without a reload
- **Responsive navigation** — desktop pill navbar that hides on scroll past the hero and reveals via a hover trigger zone; a separate right-sliding drawer with overlay/blur for mobile
- **Unified About + Experience section** — split-screen layout (identity/bio on the left, education/experience cards on the right), with expandable modal cards for detailed entries using `data-modal` + `aria-expanded`
- **Skills section** — a consolidated icon grid for core technologies (scales from 3 to 5 columns across breakpoints) and an animated "runway" progress-bar group for technologies currently being learned, with GSAP-driven fill animation triggered on scroll
- **Project showcase** — a curated grid (featured, secondary, and compact cards), with every card clickable to open its article overlay
- **Contact form** — Web3Forms integration with client-side validation, honeypot spam protection, a live character counter, and localized success/error feedback
- **Scroll animations** — GSAP + ScrollTrigger for entrance and reveal animations, AOS for lightweight section fade-ins; the two are kept on separate elements to avoid conflicts
- **Aurora background** — animated radial-gradient orbs with GPU-accelerated motion and parallax on scroll, respects `prefers-reduced-motion`
- **Ultrawide responsiveness** — `html` element carries the background color so the full viewport is covered beyond the 1400px body; skills grid and hero typography scale up at wide breakpoints
- **SEO & structured data** — JSON-LD (`ProfilePage`, `Person`, `WebSite`), `sitemap.xml` with an automated `lastmod` update script, and `robots.txt`
- **Security** — strict Content-Security-Policy defined in `index.html`
- **Analytics** — Google Analytics via `gtag.js`
- **Testing** — Vitest unit tests covering the i18n module

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Structure and styling |
| JavaScript (vanilla, ES modules) | All application logic — no frontend framework |
| Vite 8 | Build tool and local dev server |
| GSAP 3 + ScrollTrigger | Hero entrance, scroll-triggered reveals, skills bar animation |
| AOS 2 | Lightweight scroll fade-ins on select sections |
| Font Awesome (`@fortawesome/fontawesome-svg-core`) | Icons, tree-shaken as an npm subset rather than the full CDN package |
| Fontsource (DM Sans, DM Mono, Syne) | Self-hosted typography — Syne for the hero h1, DM Sans for body, DM Mono for labels and code |
| flag-icons (CDN) | Flag icons for the language switcher |
| Web3Forms | Contact form email delivery |
| Vitest | Unit testing |

---

## Project Structure

```
dev-portfolio/
├── index.html
├── vite.config.js
├── package.json
├── robots.txt
├── sitemap.xml
├── scripts/
│   └── update-sitemap.js        # Updates sitemap lastmod on build
├── public/
│   └── locales/
│       ├── en.json              # English content for dynamic/article sections
│       ├── pt.json
│       └── es.json
└── src/
    ├── assets/
    │   └── img/
    ├── css/
    │   ├── styles.css           # Root import — assembles all partials
    │   ├── base/
    │   │   ├── fonts.css        # Fontsource imports
    │   │   ├── variables.css    # CSS custom properties (light, dark, high-contrast)
    │   │   ├── reset.css        # Global reset, base typography, ultrawide html background
    │   │   └── aurora.css       # Animated background orbs
    │   ├── layout/
    │   │   ├── navbar.css       # Desktop pill navbar + hide/reveal behavior
    │   │   ├── footer.css
    │   │   ├── mobile-nav.css   # Mobile hamburger drawer
    │   │   └── scrollbar.css
    │   └── sections/
    │       ├── hero.css
    │       ├── about.css        # About + Experience (unified)
    │       ├── skills.css       # Icon grid + runway progress bars
    │       ├── projects.css
    │       ├── project-article.css  # Article overlay for project pages
    │       └── contact.css
    └── js/
        ├── main.js              # Entry point — imports CSS and all JS modules
        ├── core/
        │   ├── icons.js         # Font Awesome subset registration
        │   ├── darkMode.js
        │   ├── contrastMode.js
        │   └── i18n.js          # Custom i18n system + langchange event
        ├── ui/
        │   ├── animations.js    # GSAP + ScrollTrigger + AOS init
        │   ├── contact.js       # Form validation and Web3Forms submission
        │   ├── cv.js            # CV download links per language
        │   ├── langDropdown.js
        │   ├── typewriter.js
        │   ├── mobileNav.js
        │   ├── about.js         # Expandable modal cards
        │   ├── navbarScroll.js  # Hide-on-scroll trigger
        │   └── projectRouter.js # Hash-based routing for project article pages
        └── __tests__/
            └── i18n.test.js
```

---

## Project Article Pages

Each project card opens a full-page article overlay routed by URL hash:

```
/#projects/eduassets
/#projects/buenos-aires-explorer
/#projects/dev-portfolio
/#projects/aviation-safety
/#projects/travel-explorer
```

The overlay is rendered by `projectRouter.js`, which:

1. Listens to `hashchange` and the initial page load hash
2. Lazily fetches the locale JSON for the active language (cached in memory after first fetch)
3. Renders the article with intro, sections, and project links
4. Re-renders in place when the user switches language (listens to the `langchange` custom event dispatched by `i18n.js`)
5. Navigates back to `/#projects` when the back button is clicked or the hash changes

Article content is stored under `projectArticles.<slug>` in each locale JSON file.

---

## Contact Form — How It Works

The contact form is powered by [Web3Forms](https://web3forms.com), a serverless email delivery service with a public access key — no backend required.

**Client-side flow:**

1. Honeypot field check to silently discard spam bot submissions
2. Input validation — empty fields and email format
3. Submits JSON to `https://api.web3forms.com/submit`
4. Displays localized feedback — success or error, in the active language, with a live character counter for the message field

Localized feedback messages are defined in `locales/pt.json` and `locales/es.json` under `contact.feedback`, and fall back to English defaults if a translation is missing.

---

## i18n — How Translations Work

Language priority on load: `localStorage` → browser language → English (default).

- English text lives in the HTML via `data-i18n` attributes for static content, and in `public/locales/en.json` for dynamic content (project articles)
- Portuguese and Spanish are fetched from `public/locales/` only when explicitly selected, and cached in memory for the rest of the session
- Switching language updates the page instantly with no reload, including form placeholders and `aria-label` attributes
- `i18n.js` dispatches a `langchange` custom event after each language switch, which modules like `projectRouter.js` listen to for re-rendering

---

## Projects Featured

| Project | Stack | Description |
|---|---|---|
| [eduAssets](https://github.com/dasilva-thiago/edu-assets) | TypeScript, Vite, Node.js, Express 5, Prisma, PostgreSQL (Neon), Zod | Full-stack system for managing school hardware assets, with optional RFID support and a feature-first frontend architecture |
| [Buenos Aires Explorer](https://github.com/dasilva-thiago/BuenosAiresExp) | C#, .NET, SQLite, Windows Forms | Desktop app for organizing points of interest with geocoding API integration, distance calculation, and route planning |
| [Developer Portfolio](https://github.com/dasilva-thiago/dev-portfolio) | HTML, CSS, JS, Vite | This website — custom i18n system, FOUC-safe dark mode, hash-based project article pages, modular CSS architecture |
| [Aviation Safety Project](https://github.com/dasilva-thiago/aviation_safety_project) | Python, Pandas, NumPy, OpenPyXL, Power BI | Data pipeline with layered architecture: generation → transformation → export → visualization |
| [Travel Explorer](https://github.com/dasilva-thiago/TravelExplorer) | HTML, CSS, JavaScript, TypeScript, React | In development — evolution of Buenos Aires Explorer with global scope, optimized routing, and business integration |

---

## Running Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

---

## Contact

- **Website:** [dasilva-thiago.dev](https://www.dasilva-thiago.dev)
- **LinkedIn:** [linkedin.com/in/dasilva-thiago](https://www.linkedin.com/in/dasilva-thiago/)
- **GitHub:** [github.com/dasilva-thiago](https://github.com/dasilva-thiago)
- **Email:** thiagosilva785@gmail.com

---

<p align="center">Made by Thiago da Silva • Pindamonhangaba, SP, Brazil</p>
