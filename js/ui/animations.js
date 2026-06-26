import 'aos/dist/aos.css';
import AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Footer year ──────────────────────────────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── AOS ──────────────────────────────────────────────────────────────────────
AOS.init({
    duration: 700,
    once: true,
    offset: 60,
    easing: 'ease-out-cubic',
});

// ─── HERO — Animation ────────────────────────────────────────────
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

gsap.set([
    '.hero-section .headshot',
    '.hero-section .text h1',
    '.hero-section .text .hero-subtitle',
    '.hero-bullets li',
    '.hero-section .text .links',
], { opacity: 0, y: 32 });

heroTl
    .to('.hero-section .headshot', { opacity: 1, y: 0, duration: 0.9, delay: 0.1 })
    .to('.hero-section .text h1', { opacity: 1, y: 0, duration: 0.75 }, '-=0.6')
    .to('.hero-section .text .hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
    .to('.hero-bullets li', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.35')
    .to('.hero-section .text .links', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

// ─── PARALLAX (desktop only) ───────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && window.innerWidth > 740) {
    gsap.to('.aurora-orb--1', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
        },
    });
    gsap.to('.aurora-orb--2', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2,
        },
    });
}

// ─── SKILLS — heading + description reveal ────────────────────────
gsap.from('.skills-section h2, .skills-description', {
    scrollTrigger: {
        trigger: '.skills-section',
        start: 'top 85%',
        once: true,
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.12,
    ease: 'power2.out',
    clearProps: 'all',
});

// ─── SKILLS — icon cards stagger ─────────────────────────────────
gsap.from('.skill-icon-card', {
    scrollTrigger: {
        trigger: '.skills-icon-grid',
        start: 'top 82%',
        once: true,
    },
    opacity: 0,
    y: 24,
    scale: 0.92,
    duration: 0.5,
    stagger: {
        amount: 0.4,
        from: 'start',
    },
    ease: 'power2.out',
    clearProps: 'all',
});

// ─── SKILLS — runway bars (fill animation on scroll) ─────────────
ScrollTrigger.create({
    trigger: '.skills-runway-stack',
    start: 'top 82%',
    once: true,
    onEnter: () => {
        document.querySelectorAll('.skill-runway-fill').forEach((fill, i) => {
            const target = fill.style.getPropertyValue('--skill-pct') || '50%';
            gsap.fromTo(fill,
                { width: '0%' },
                {
                    width: target,
                    duration: 1.2,
                    delay: i * 0.18,
                    ease: 'power3.out',
                    onComplete: () => {
                        fill.classList.add('is-animated');
                    }
                }
            );
        });
    }
});

// ─── PROJECTS — section reveal  ───────────────────────────────────────────────
gsap.from('.projects-section h2, .projects-section .section-subtitle', {
    scrollTrigger: {
        trigger: '.projects-section',
        start: 'top 82%',
        once: true,
    },
    opacity: 0,
    y: 24,
    duration: 0.65,
    stagger: 0.14,
    ease: 'power2.out',
    clearProps: 'all',
});

// ─── ABOUT — Reveal  ──────────────────────────────────────
gsap.from('.about-section .person-details', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 78%',
        once: true,
    },
    opacity: 0,
    x: -32,
    duration: 0.75,
    ease: 'power3.out',
    clearProps: 'all',
});

gsap.from('.about-section .text', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 78%',
        once: true,
    },
    opacity: 0,
    x: 32,
    duration: 0.75,
    ease: 'power3.out',
    clearProps: 'all',
});

// ─── EXPERIENCE — Timeline items ───────────────────────────────────
gsap.from('.timeline-item', {
    scrollTrigger: {
        trigger: '.timeline',
        start: 'top 80%',
        once: true,
    },
    opacity: 0,
    x: -24,
    duration: 0.6,
    stagger: 0.14,
    ease: 'power2.out',
    clearProps: 'all',
});

gsap.from('.timeline-initiative', {
    scrollTrigger: {
        trigger: '.timeline-initiative',
        start: 'top 85%',
        once: true,
    },
    opacity: 0,
    y: 20,
    duration: 0.65,
    ease: 'power2.out',
    clearProps: 'all',
});

// ─── CONTACT — Reveal split ───────────────────────────────────────────────────
gsap.from('.contact-section h2', {
    scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 82%',
        once: true,
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power2.out',
    clearProps: 'all',
});

gsap.from('.contact-form-wrapper', {
    scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 82%',
        once: true,
    },
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: 'power3.out',
    clearProps: 'all',
});