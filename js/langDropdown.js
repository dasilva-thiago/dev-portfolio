const trigger = document.getElementById('lang-trigger');
const dropdown = document.getElementById('lang-dropdown');
const activeFlag = document.getElementById('active-flag');

const flagMap = {
    en: 'fi-us',
    pt: 'fi-br',
    es: 'fi-es',
};

trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen);
    dropdown.setAttribute('aria-hidden', !isOpen);
});

dropdown.querySelectorAll('.lang-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        activeFlag.className = `fi ${flagMap[lang]}`;
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
    });
});

document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');
});