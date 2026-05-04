const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'pt', 'es'];
export const translationCache = {};

// slice (0,2) to get the language code without region (e.g., 'en-US' -> 'en')
function detectBrowserLang() {
    const browserLang = navigator.language?.slice(0,2);
    return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}
// priority: localStorage > browser settings > default (english)
export let currentLang = localStorage.getItem('lang') || detectBrowserLang();

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

// dinamic json loading
// cache translations to avoid multiple fetches
async function loadTranslations(lang) {
    if (translationCache[lang]) {
        return translationCache[lang];
    }

  const res = await fetch(`/locales/${lang}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`Arquivo i18n/${lang}.json não encontrado`);

    const data = await res.json();
    translationCache[lang] = data;
    return data;
}


// nested keys support (e.g., 'home.title' -> { home: { title: '...' } })
export function getNestedValue(obj, keyPath) {
    return keyPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

// apply language to the page - no reload
async function applyLanguage(lang) {
    try {
        let translations = null;
        if (lang !== DEFAULT_LANG) {
            translations = await loadTranslations(lang);
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
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

        document.documentElement.lang = lang;
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        localStorage.setItem('lang', lang);
        currentLang = lang;

    } catch (err) {
        console.error('[i18n] Erro ao aplicar idioma:', err);
    }
}

// button event listener
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (lang !== currentLang) applyLanguage(lang);
    });
});

// initialize
saveDefaults();
applyLanguage(currentLang); 