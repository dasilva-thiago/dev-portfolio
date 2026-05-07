import 'aos/dist/aos.css';
import AOS from 'aos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Footer 
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

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
], { opacity: 0, y: 24 });

gsap.to('.hero-section .headshot',           { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 });
gsap.to('.hero-section .text h1',            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.25 });
gsap.to('.hero-section .text .hero-subtitle',{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.4 });
gsap.to('.hero-bullets li',                  { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.55 });
gsap.to('.hero-section .text .links',        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 1.05 });

// Skills — ScrollTrigger
gsap.from('.skills-section .cell', {
    scrollTrigger: {
        trigger: '.skills-section',
        start: 'top 85%',
        once: true,
    },
    opacity: 0,
    y: 30,
    duration: 0.5,
    stagger: {
        amount: 0.4,
        from: 'start',
    },
    ease: 'power2.out',
    clearProps: 'all',
});