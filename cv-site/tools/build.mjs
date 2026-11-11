// Builds the static pages of cv.dasilva-thiago.dev into public/:
//   public/index.html          short "about" landing with links and the three resumes
//   public/{pt,en,es}.html     each resume, rendered from src/data/cv-{lang}.json
// Run `node tools/build.mjs` after changing a resume JSON, a text below or the template, and commit
// public/. Vercel serves public/ as-is (no build step on deploy).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://cv.dasilva-thiago.dev";
const LANGS = ["pt", "en", "es"];
const HTML_LANG = { pt: "pt-BR", en: "en", es: "es" };
const LANG_NAME = { pt: "Português", en: "English", es: "Español" };
const FLAG = { pt: "br", en: "us", es: "es" };
const PORTFOLIO = { pt: "https://www.dasilva-thiago.dev/pt", en: "https://www.dasilva-thiago.dev", es: "https://www.dasilva-thiago.dev/es" };

const ICONS = JSON.parse(readFileSync(join(ROOT, "src/icons.json"), "utf8"));
const cvs = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(join(ROOT, `src/data/cv-${l}.json`), "utf8"))]));

// Landing texts come from the portfolio hero (src/shared/i18n/resources/*.json) so both sites say the same.
const T = {
  pt: {
    availability: "disponível para estágio e vaga júnior",
    role: "Desenvolvedor Full Stack Júnior",
    about: "Criei o eduAssets, sistema em uso em uma escola estadual, com 192 equipamentos controlados e mais de 66 chamados atendidos.",
    location: "Remoto no Brasil",
    resumes: "Currículos",
    view: "Ver online",
    download: "Baixar PDF",
    downloadShort: "PDF",
    portfolio: "Portfólio",
    dark: "Temas",
    contrast: "Alto contraste",
    language: "Idioma",
    home: "Início",
    skip: "Pular para o conteúdo principal",
    pageTitle: "Currículo",
    description: "Currículo de Thiago da Silva, desenvolvedor de software.",
  },
  en: {
    availability: "open to internships and junior roles",
    role: "Junior Full Stack Developer",
    about: "I built eduAssets, a system in use at a public school in Brazil, with 192 devices tracked and over 66 tickets handled.",
    location: "Remote in Brazil",
    resumes: "Resumes",
    view: "View online",
    download: "Download PDF",
    downloadShort: "PDF",
    portfolio: "Portfolio",
    dark: "Themes",
    contrast: "High contrast",
    language: "Language",
    home: "Home",
    skip: "Skip to main content",
    pageTitle: "Resume",
    description: "Resume of Thiago da Silva, software developer.",
  },
  es: {
    availability: "disponible para prácticas y puestos junior",
    role: "Desarrollador Full Stack Junior",
    about: "Creé eduAssets, un sistema en uso en una escuela estatal de Brasil, con 192 equipos controlados y más de 66 solicitudes atendidas.",
    location: "Remoto en Brasil",
    resumes: "Currículums",
    view: "Ver en línea",
    download: "Descargar PDF",
    downloadShort: "PDF",
    portfolio: "Portafolio",
    dark: "Temas",
    contrast: "Alto contraste",
    language: "Idioma",
    home: "Inicio",
    skip: "Saltar al contenido principal",
    pageTitle: "Currículum",
    description: "Currículum de Thiago da Silva, desarrollador de software.",
  },
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const icon = (name, cls = "") => {
  const i = ICONS[name];
  if (!i) throw new Error(`unknown icon ${name}`);
  return `<svg class="icon${cls ? " " + cls : ""}" viewBox="0 0 ${i.w} ${i.h}" aria-hidden="true" focusable="false"><path fill="currentColor" d="${i.d}"/></svg>`;
};

const flag = (lang) => `<img class="flag" src="/assets/flags/${FLAG[lang]}.svg" alt="" width="20" height="15">`;
const pdfHref = (lang) => `/thiago-da-silva-cv-${lang}.pdf`;
const pdfName = (lang) => `thiago-da-silva-cv-${lang}.pdf`;

// Text that changes with the landing page language: one copy per language, CSS shows the active one.
const tri = (key, tag = "span", attrs = "") => LANGS.map((l) => `<${tag}${attrs ? " " + attrs : ""} data-l="${l}">${esc(T[l][key])}</${tag}>`).join("");
// aria-label that follows the landing page language (site.js swaps it; the default is Portuguese).
const triAria = (key) => `aria-label="${esc(T.pt[key])}" ${LANGS.map((l) => `data-aria-${l}="${esc(T[l][key])}"`).join(" ")}`;

function head({ lang, title, description, canonical, landing = false }) {
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${SITE}/${l}">`).join("\n    ");
  return `<!doctype html>
<html lang="${HTML_LANG[lang]}"${landing ? " data-landing" : ""}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta name="color-scheme" content="light dark">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${canonical}">
    ${alternates}
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="preload" href="/assets/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/syne-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
    <script src="/assets/theme.js"></script>
    <link rel="stylesheet" href="/assets/site.css">
    <script src="/assets/site.js" defer></script>
  </head>`;
}

const themeButtons = (labels) => `
          <button type="button" class="nav-icon theme-toggle" data-toggle="dark" aria-pressed="false" ${labels.dark}>${icon("sun", "icon-sun")}${icon("moon", "icon-moon")}</button>
          <button type="button" class="nav-icon" data-toggle="contrast" aria-pressed="false" ${labels.contrast}>${icon("contrast")}</button>`;

// ---------- landing ----------
function landing() {
  const c = cvs.pt.candidate;
  const cards = LANGS.map(
    (l) => `
            <li class="cv-card" lang="${HTML_LANG[l]}">
              <span class="cv-card-lang">${flag(l)} ${LANG_NAME[l]}</span>
              <span class="cv-card-actions">
                <a class="btn btn-fill" href="/${l}" data-remember-lang="${l}">${icon("eye")} ${esc(T[l].view)}</a>
                <a class="btn" href="${pdfHref(l)}" download="${pdfName(l)}">${icon("download")} PDF</a>
              </span>
            </li>`,
  ).join("");

  const langButtons = LANGS.map(
    (l) => `<button type="button" class="nav-icon" data-set-lang="${l}" aria-label="${LANG_NAME[l]}">${flag(l)}</button>`,
  ).join("\n          ");

  return `${head({ lang: "pt", title: "Thiago da Silva · CV", description: T.pt.description, canonical: `${SITE}/`, landing: true })}
  <body>
    <a class="skip-link" href="#main">${tri("skip")}</a>
    <header class="nav">
      <nav class="nav-pill" ${triAria("language")}>
          <a class="nav-icon" href="${PORTFOLIO.pt}" ${triAria("portfolio")}>${icon("house")}</a>
          <span class="nav-divider" aria-hidden="true"></span>${themeButtons({ dark: triAria("dark"), contrast: triAria("contrast") })}
          <span class="nav-divider" aria-hidden="true"></span>
          ${langButtons}
      </nav>
    </header>
    <main id="main" class="home">
      <p class="chip">${tri("availability")}</p>
      <h1 class="hero-name">${esc(c.name)}</h1>
      <p class="hero-role">${tri("role")}</p>
      <p class="hero-stack">TypeScript · Node.js · PostgreSQL</p>
      <ul class="social">
        <li><a href="${c.github.url}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icon("github")}</a></li>
        <li><a href="${c.linkedin.url}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${icon("linkedin")}</a></li>
        <li><a href="mailto:${c.email}" aria-label="Email">${icon("envelope")}</a></li>
        <li><a href="${PORTFOLIO.pt}" target="_blank" rel="noopener noreferrer" ${triAria("portfolio")}>${icon("globe")}</a></li>
      </ul>
      ${tri("about", "p", 'class="hero-about"')}
      ${tri("location", "p", 'class="hero-location"')}
      <section class="cv-list" aria-labelledby="resumes">
        <h2 class="section-label" id="resumes">${tri("resumes")}</h2>
        <ul class="cv-cards">${cards}
        </ul>
      </section>
    </main>
  </body>
</html>
`;
}

// ---------- resume page ----------
function section(title, body) {
  return `
        <section class="cv-section">
          <h2 class="section-label">${esc(title)}</h2>
          ${body}
        </section>`;
}

function resume(lang) {
  const cv = cvs[lang];
  const c = cv.candidate;
  const s = cv.sections;
  const t = T[lang];

  const langLinks = LANGS.map(
    (l) =>
      `<a class="nav-icon" href="/${l}" hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}" aria-label="${LANG_NAME[l]}"${l === lang ? ' aria-current="true"' : ""}>${flag(l)}</a>`,
  ).join("");

  const contact = [
    c.location && `<li>${icon("location")}<span>${esc(c.location)}</span></li>`,
    c.email && `<li>${icon("envelope")}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`,
    c.linkedin && `<li>${icon("linkedin")}<a href="${esc(c.linkedin.url)}" target="_blank" rel="noopener noreferrer">${esc(c.linkedin.display)}</a></li>`,
    c.github && `<li>${icon("github")}<a href="${esc(c.github.url)}" target="_blank" rel="noopener noreferrer">${esc(c.github.display)}</a></li>`,
    c.portfolio && `<li>${icon("globe")}<a href="${esc(PORTFOLIO[lang])}" target="_blank" rel="noopener noreferrer">${esc(c.portfolio.display)}</a></li>`,
  ]
    .filter(Boolean)
    .join("\n            ");

  const experience = cv.experience
    .map(
      (e) => `
          <article class="entry">
            <div class="entry-head"><h3 class="entry-org">${esc(e.company)}</h3><span class="entry-dates">${esc(e.dates)}</span></div>
            <p class="entry-role">${esc(e.role)}</p>
            ${e.location ? `<p class="entry-meta">${esc(e.location)}</p>` : ""}
            <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          </article>`,
    )
    .join("");

  const projects = (cv.projects ?? [])
    .map(
      (p) => `
          <article class="entry">
            <h3 class="entry-org">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)} ${icon("arrowUpRight")}</a>` : esc(p.name)}</h3>
            <p class="entry-desc">${esc(p.description)}</p>
            ${p.tech ? `<p class="entry-tech">${esc(p.tech)}</p>` : ""}
          </article>`,
    )
    .join("");

  const education = (cv.education ?? [])
    .map(
      (e) => `
          <article class="entry">
            <div class="entry-head"><h3 class="entry-org">${esc(e.title)}</h3><span class="entry-dates">${esc(e.year)}</span></div>
            <p class="entry-meta">${esc([e.org, e.location].filter(Boolean).join(" · "))}</p>
            ${e.description ? `<p class="entry-desc">${esc(e.description)}</p>` : ""}
          </article>`,
    )
    .join("");

  const certs = (cv.certifications ?? []).length
    ? `<ul class="courses">${cv.certifications
        .map((x) => `<li><strong>${esc(x.title)}</strong> <span>· ${esc([x.org, x.year].filter(Boolean).join(" · "))}</span></li>`)
        .join("")}</ul>`
    : "";

  const skills = `<dl class="skills">${(cv.skills ?? [])
    .map((k) => `<div><dt>${esc(k.category)}</dt><dd>${esc(k.items)}</dd></div>`)
    .join("")}</dl>`;

  return `${head({ lang, title: `${c.name} · ${t.pageTitle}`, description: t.description, canonical: `${SITE}/${lang}` })}
  <body>
    <a class="skip-link" href="#main">${esc(t.skip)}</a>
    <header class="toolbar">
      <div class="toolbar-inner">
        <a class="toolbar-home" href="/" aria-label="${esc(t.home)}">${icon("arrowLeft")}<span class="label">${esc(c.name)}</span></a>
        <nav class="toolbar-group" aria-label="${esc(t.language)}">${langLinks}</nav>
        <span class="nav-divider" aria-hidden="true"></span>
        <div class="toolbar-group">${themeButtons({ dark: `aria-label="${esc(t.dark)}"`, contrast: `aria-label="${esc(t.contrast)}"` })}
        </div>
        <a class="btn btn-fill" href="${pdfHref(lang)}" download="${pdfName(lang)}">${icon("download")}<span class="label-long">${esc(t.download)}</span><span class="label-short">${esc(t.downloadShort)}</span></a>
      </div>
    </header>
    <main id="main" class="paper">
      <header class="cv-head">
        <h1 class="cv-name">${esc(c.name)}</h1>
        <p class="cv-title">${esc(c.title)}</p>
        <ul class="cv-contact">
            ${contact}
        </ul>
      </header>${section(s.summary, `<p class="cv-summary">${esc(cv.summary)}</p>`)}${section(s.experience, experience)}${
        projects ? section(s.projects, projects) : ""
      }${section(s.education, education)}${certs ? section(s.certifications, certs) : ""}${section(s.skills, skills)}
    </main>
    <footer class="foot"><a href="${PORTFOLIO[lang]}">dasilva-thiago.dev</a></footer>
  </body>
</html>
`;
}

writeFileSync(join(ROOT, "public/index.html"), landing());
for (const l of LANGS) writeFileSync(join(ROOT, `public/${l}.html`), resume(l));
console.log("built public/index.html, " + LANGS.map((l) => `public/${l}.html`).join(", "));
