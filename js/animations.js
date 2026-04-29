import AOS from 'aos';
import { gsap } from 'gsap';
// Footer — current year
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// AOS — scroll animations
AOS.init({
    duration: 600,
    once: true,
    offset: 80
});

gsap.set([
    '.hero-section .headshot',
    '.hero-section .text h1',
    '.hero-section .text .hero-subtitle',
    '.hero-bullets li',
    '.hero-section .text .links'
], {
    opacity: 0,
    y: 24
});

gsap.to('.hero-section .headshot', {
    opacity: 1, y: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.1
});

gsap.to('.hero-section .text h1', {
    opacity: 1, y: 0,
    duration: 0.7,
    ease: 'power3.out',
    delay: 0.25
});

gsap.to('.hero-section .text .hero-subtitle', {
    opacity: 1, y: 0,
    duration: 0.6,
    ease: 'power3.out',
    delay: 0.4
});

gsap.to('.hero-bullets li', {
    opacity: 1, y: 0,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.1,
    delay: 0.55
});

gsap.to('.hero-section .text .links', {
    opacity: 1, y: 0,
    duration: 0.5,
    ease: 'power2.out',
    delay: 1.05
});