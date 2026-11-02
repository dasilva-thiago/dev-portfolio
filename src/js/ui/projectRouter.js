import { getCurrentLang, getNestedValue, translationCache } from '../core/i18n.js';

const PROJECTS = {
    'eduassets': {
        en: { title: 'eduAssets', tag: 'FULL STACK' },
        titleKey: 'projects.4.title',
        tagKey: 'projects.4.tag',
        image: 'src/assets/img/eduAssets_banner.webp',
        github: 'https://github.com/dasilva-thiago/edu-assets',
        live: 'https://eduassets.tech',
    },
    'buenos-aires-explorer': {
        en: { title: 'Buenos Aires Explorer', tag: 'Full Stack' },
        titleKey: 'projects.0.title',
        tagKey: 'projects.0.tag',
        image: 'src/assets/img/BAexp_screenshot.webp',
        github: 'https://github.com/dasilva-thiago/BuenosAiresExp',
    },
    'dev-portfolio': {
        en: { title: 'Developer Portfolio', tag: 'Frontend' },
        titleKey: 'projects.1.title',
        tagKey: 'projects.1.tag',
        image: 'src/assets/img/preview.png',
        github: 'https://github.com/dasilva-thiago/dev-portfolio',
    },
    'aviation-safety': {
        en: { title: 'Aviation Safety Project', tag: 'Backend' },
        titleKey: 'projects.2.title',
        tagKey: 'projects.2.tag',
        image: 'src/assets/img/Aviation_Safety_Project_screenshot.webp',
        github: 'https://github.com/dasilva-thiago/aviation_safety_project',
    },
    'travel-explorer': {
        en: { title: 'Travel Explorer', tag: 'FULL STACK' },
        titleKey: 'projects.3.title',
        tagKey: 'projects.3.tag',
        image: 'src/assets/img/Texp_logo.webp',
        github: 'https://github.com/dasilva-thiago/TravelExplorer',
    },
};

async function ensureLang(lang) {
    if (translationCache[lang]) return;
    try {
        const res = await fetch(`/locales/${lang}.json`);
        if (res.ok) translationCache[lang] = await res.json();
    } catch { /* silent */ }
}

function t(key) {
    const lang = getCurrentLang();
    return getNestedValue(translationCache[lang], key)
        ?? getNestedValue(translationCache['en'], key)
        ?? '';
}

function getProjectMeta(slug) {
    const meta = PROJECTS[slug];
    const lang = getCurrentLang();
    const title = lang === 'en'
        ? meta.en.title
        : (getNestedValue(translationCache[lang], meta.titleKey) || meta.en.title);
    const tag = lang === 'en'
        ? meta.en.tag
        : (getNestedValue(translationCache[lang], meta.tagKey) || meta.en.tag);
    return { ...meta, title, tag };
}

function renderParagraphs(text) {
    if (!text) return '';
    return text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
}

function buildArticleHTML(slug) {
    const meta = getProjectMeta(slug);
    const articleData = t(`projectArticles.${slug}`);
    const backLabel = t('projectArticles.back') || 'Projects';

    const intro = articleData?.intro || '';
    const sections = Array.isArray(articleData?.sections) ? articleData.sections : [];

    const sectionsHTML = sections.map(s => `
        <section class="project-article-section">
            <h2>${s.heading || ''}</h2>
            ${renderParagraphs(s.body || '')}
        </section>`).join('');

    const liveBtn = meta.live ? `
        <a href="${meta.live}" target="_blank" rel="noopener noreferrer" class="btn-access">
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            <span data-i18n="projectsAccessBtn">Acessar o sistema</span>
        </a>` : '';

    const githubLabel = t('projectsGithubBtn') || 'View on GitHub';

    return `
        <a href="#projects" class="project-article-back">
            <i class="fa-solid fa-arrow-left"></i>
            <span>${backLabel}</span>
        </a>
        <div class="project-article-inner">
            <article class="project-article-content">
                <div class="project-article-hero">
                    <img src="${meta.image}" alt="${meta.title}" loading="lazy">
                </div>
                <div class="project-article-body">
                    <header class="project-article-header">
                        <span class="project-tag">${meta.tag}</span>
                        <h1>${meta.title}</h1>
                    </header>
                    <div class="project-article-links">
                        ${liveBtn}
                        <a href="${meta.github}" target="_blank" rel="noopener noreferrer" class="btn-github">
                            <i class="fa-brands fa-github"></i>
                            <span>${githubLabel}</span>
                        </a>
                    </div>
                    ${intro ? `<div class="project-article-intro">${renderParagraphs(intro)}</div>` : ''}
                    ${sectionsHTML}
                </div>
            </article>
        </div>`;
}

let currentSlug = null;
let overlay = null;

function getOverlay() {
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'project-article-overlay';
        overlay.className = 'project-article-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('role', 'main');
        document.body.appendChild(overlay);
    }
    return overlay;
}

async function showArticle(slug) {
    if (!PROJECTS[slug]) return;
    currentSlug = slug;

    const lang = getCurrentLang();
    await ensureLang('en');
    if (lang !== 'en') await ensureLang(lang);

    const el = getOverlay();
    el.innerHTML = buildArticleHTML(slug);
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('is-visible');
    document.body.classList.add('article-open');
    el.scrollTop = 0;
}

function hideArticle() {
    currentSlug = null;
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    document.body.classList.remove('article-open');
}

document.addEventListener('langchange', async () => {
    if (!currentSlug) return;
    const lang = getCurrentLang();
    if (lang !== 'en') await ensureLang(lang);
    const el = getOverlay();
    el.innerHTML = buildArticleHTML(currentSlug);
});

window.addEventListener('hashchange', () => {
    const match = window.location.hash.match(/^#projects\/(.+)$/);
    match ? showArticle(match[1]) : hideArticle();
});

// Card click → open article (ignore clicks on links/buttons inside the card)
document.querySelectorAll('.project-card[data-slug]').forEach(card => {
    card.addEventListener('click', e => {
        if (e.target.closest('a, button')) return;
        window.location.hash = `#projects/${card.dataset.slug}`;
    });
});

// Handle initial load
const initialMatch = window.location.hash.match(/^#projects\/(.+)$/);
if (initialMatch) showArticle(initialMatch[1]);
