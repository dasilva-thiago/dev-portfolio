import { getCurrentLang, translationCache, getNestedValue } from '../core/i18n.js';
import { gsap } from 'gsap';

const carousel  = document.getElementById('projectsCarousel');
const grid      = document.getElementById('projects-grid');
const toggleBtn = document.getElementById('projects-toggle-btn');
const toggleIcon = document.getElementById('projects-toggle-icon');
const toggleText = document.getElementById('projects-toggle-text');

let isGridMode = false;

function getCarouselInstance() {
    if (typeof bootstrap === 'undefined') return null;
    return bootstrap.Carousel.getInstance(carousel);
}

function setToggleText(i18nKey, defaultEnText) {
    toggleText.setAttribute('data-i18n', i18nKey);
    toggleText.setAttribute('data-i18n-default', defaultEnText);

    const lang = getCurrentLang();
    if (lang === 'en' || !translationCache[lang]) {
        toggleText.textContent = defaultEnText;
    } else {
        toggleText.textContent = getNestedValue(translationCache[lang], i18nKey) || defaultEnText;
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
    toggleBtn.disabled = true;

    buildGrid();

    const bsCarousel = getCarouselInstance();
    if (bsCarousel) bsCarousel.pause();

    gsap.to(carousel, {
        opacity: 0,
        duration: 0.2,
        ease: 'power1.in',
        onComplete: () => {
            carousel.classList.add('projects-carousel--hidden');
            gsap.set(carousel, { opacity: 1 });

            grid.classList.add('projects-grid--visible');
            grid.removeAttribute('aria-hidden');

            gsap.from('.projects-grid .project-card', {
                opacity: 0,
                y: 24,
                duration: 0.4,
                stagger: 0.08,
                ease: 'power2.out',
                clearProps: 'all',
                onComplete: () => {
                    toggleBtn.disabled = false;
                }
            });
        }
    });

    toggleIcon.classList.replace('fa-grip', 'fa-chevron-left');
    setToggleText('projects-toggle-back', 'Back to Carousel');
    toggleBtn.setAttribute('aria-expanded', 'true');
    isGridMode = true;
}

function switchToCarousel() {
    toggleBtn.disabled = true;

    gsap.to('.projects-grid .project-card', {
        opacity: 0,
        y: 24,
        duration: 0.25,
        stagger: 0.04,
        ease: 'power1.in',
        onComplete: () => {
            grid.classList.remove('projects-grid--visible');
            grid.setAttribute('aria-hidden', 'true');

            carousel.classList.remove('projects-carousel--hidden');

            gsap.fromTo(carousel,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power1.out',
                    onComplete: () => {
                        toggleBtn.disabled = false;
                    }
                }
            );

            const bsCarousel = getCarouselInstance();
            if (bsCarousel) bsCarousel.cycle();
        }
    });

    toggleIcon.classList.replace('fa-chevron-left', 'fa-grip');
    setToggleText('projects-toggle-text', 'Show All Projects');
    toggleBtn.setAttribute('aria-expanded', 'false');
    isGridMode = false;
}

toggleBtn.addEventListener('click', () => {
    if (toggleBtn.disabled) return;
    isGridMode ? switchToCarousel() : switchToGrid();
});