const menuBtn = document.getElementById('mobile-menu-btn');
const overlay = document.getElementById('mobile-nav');
const mobileCvBtn = document.getElementById('mobile-cv-btn');
const mobileDarkToggle = document.getElementById('mobile-dark-toggle');
const mobileContrastToggle = document.getElementById('mobile-contrast-toggle');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function openMenu() {
    menuBtn.classList.add('is-active');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    menuBtn.classList.remove('is-active');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

menuBtn.addEventListener('click', () => {
    overlay.classList.contains('is-open') ? closeMenu() : openMenu();
});

overlay.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-nav-drawer')) closeMenu();
});

mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

mobileCvBtn.addEventListener('click', () => {
    const CV_LINKS = {
        en: 'https://drive.google.com/file/d/1UOhK4xDzmFq4bRrPBnx3FFA-qJAHE_NO/view?usp=drive_link',
        pt: 'https://drive.google.com/file/d/1a__rsk0Nmi1t7kQWMrKVzzs_W0ysLR26/view?usp=drive_link',
        es: 'https://drive.google.com/file/d/1tMGwzcvhm7dEnYzg5O_BZVcG1K23xDCc/view?usp=drive_link',
    };
    const lang = document.documentElement.lang || 'en';
    window.open(CV_LINKS[lang] ?? CV_LINKS['en'], '_blank', 'noopener,noreferrer');
    closeMenu();
});

function updateMobileDarkIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    const existing = mobileDarkToggle.querySelector('svg') || mobileDarkToggle.querySelector('i');
    
    const newIcon = document.createElement('i');
    newIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    
    if (existing) {
        mobileDarkToggle.replaceChild(newIcon, existing);
    } else {
        mobileDarkToggle.appendChild(newIcon);
    }
}

const darkObserver = new MutationObserver(() => {
    updateMobileDarkIcon();
});

darkObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
});

updateMobileDarkIcon();

mobileDarkToggle.addEventListener('click', () => {
    document.getElementById('dark-toggle').click();
});

mobileContrastToggle.addEventListener('click', () => {
    document.getElementById('contrast-toggle').click();
});

document.querySelectorAll('.mobile-lang-opt').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        document.querySelectorAll('.lang-opt:not(.mobile-lang-opt)').forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) opt.click();
        });
        closeMenu();
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
});

updateMobileDarkIcon();