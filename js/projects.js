import { currentLang, translationCache, getNestedValue } from './i18n.js';

const carousel   = document.getElementById('projectsCarousel');
const grid       = document.getElementById('projects-grid');
const toggleBtn  = document.getElementById('projects-toggle-btn');
const toggleIcon = document.getElementById('projects-toggle-icon');
const toggleText = document.getElementById('projects-toggle-text');

let isGridMode = false;

function setToggleText(i18nKey, defaultEnText) {
    
    toggleText.setAttribute('data-i18n', i18nKey);
    toggleText.setAttribute('data-i18n-default', defaultEnText);

    if (currentLang === 'en' || !translationCache[currentLang]) {
        toggleText.textContent = defaultEnText;
    } else {
        toggleText.textContent = getNestedValue(translationCache[currentLang], i18nKey) || defaultEnText;
    }
}

function buildGrid() {
    if (grid.children.length > 0) return;

    carousel.querySelectorAll('.carousel-item').forEach(item => {
        const card = item.querySelector('.project-card');
        if (!card) return;
        grid.appendChild(card.cloneNode(true));
    });
}

function switchToGrid() {
    buildGrid();

    // stops the carousel cycle to prevent automatic sliding while in grid mode
    const bsCarousel = bootstrap.Carousel.getInstance(carousel);
    if (bsCarousel) bsCarousel.pause();

    carousel.classList.add('projects-carousel--hidden');
    grid.classList.add('projects-grid--visible');
    grid.removeAttribute('aria-hidden');

    toggleIcon.classList.replace('fa-grip', 'fa-chevron-left');
    setToggleText('projects-toggle-back', 'Back to Carousel');
    toggleBtn.setAttribute('aria-expanded', 'true');

    isGridMode = true;
}

function switchToCarousel() {
    carousel.classList.remove('projects-carousel--hidden');
    grid.classList.remove('projects-grid--visible');
    grid.setAttribute('aria-hidden', 'true');

    // resumes the carousel cycle
    const bsCarousel = bootstrap.Carousel.getInstance(carousel);
    if (bsCarousel) bsCarousel.cycle();

    toggleIcon.classList.replace('fa-chevron-left', 'fa-grip');
    setToggleText('projects-toggle-text', 'Show All Projects');
    toggleBtn.setAttribute('aria-expanded', 'false');

    isGridMode = false;
}

toggleBtn.addEventListener('click', () => {
    isGridMode ? switchToCarousel() : switchToGrid();
});