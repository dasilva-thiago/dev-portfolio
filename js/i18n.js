const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'pt', 'es'];
export const translationCache = {};

function detectBrowserLang() {
    const browserLang = navigator.language?.slice(0, 2);
    return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}

let currentLang = DEFAULT_LANG;

export function getCurrentLang() {
    return currentLang;
}

function saveDefaults() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (!el.hasAttribute('data-i18n-default')) {
            const defaultValue = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
                ? el.getAttribute('placeholder')
                : el.textContent.trim();
            el.setAttribute('data-i18n-default', defaultValue);
        }
    });
}

async function loadTranslations(lang) {
    if (translationCache[lang]) return translationCache[lang];

    const res = await fetch(`/locales/${lang}.json`);
    if (!res.ok) throw new Error(`i18n: falha ao carregar ${lang}.json`);

    const data = await res.json();
    translationCache[lang] = data;
    return data;
}

export function getNestedValue(obj, keyPath) {
    return keyPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

async function applyLanguage(lang) {
    try {
        let translations = null;
        if (lang !== DEFAULT_LANG) {
            translations = await loadTranslations(lang);
        }
        const targets = document.querySelectorAll('[data-i18n]');
        targets.forEach(el => el.classList.add('lang-fade'));
        await new Promise(resolve => setTimeout(resolve, 150));

        targets.forEach(el => {
            const key = el.getAttribute('data-i18n');
            let value;

            if (lang === DEFAULT_LANG) {
                value = el.getAttribute('data-i18n-default');
            } else {
                value = getNestedValue(translations, key);
            }

            if (value) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.setAttribute('placeholder', value);
                } else {
                    el.textContent = value;
                }
            }
        });

        requestAnimationFrame(() => {
            targets.forEach(el => el.classList.remove('lang-fade'));
        });

        document.documentElement.lang = lang;
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        localStorage.setItem('lang', lang);
        currentLang = lang;

    } catch (err) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.classList.remove('lang-fade');
        });
        console.error('[i18n] Erro ao aplicar idioma:', err);
    }
}

saveDefaults();

const savedLang = localStorage.getItem('lang');

if (savedLang && savedLang !== DEFAULT_LANG && SUPPORTED_LANGS.includes(savedLang)) {
    applyLanguage(savedLang);
} else {

    const initialLang = savedLang || detectBrowserLang();

    if (initialLang !== DEFAULT_LANG) {
        applyLanguage(initialLang);
    } else {
        currentLang = initialLang;
        document.documentElement.lang = initialLang;
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === initialLang);
        });
    }
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang !== currentLang) applyLanguage(lang);
    });
});