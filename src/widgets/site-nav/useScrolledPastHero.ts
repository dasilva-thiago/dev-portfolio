import { useEffect } from "react";
import { useLocation } from "react-router";

// The element whose visibility keeps the pill navbar shown: the hero on the home page, and the top of the page
// (cover image or header, marked with `data-nav-hero`) on the project and experience pages.
const HERO_SELECTOR = ".hero-section, [data-nav-hero]";

// Marks <body> once that element has left the viewport so the pill navbar can hide; a hover zone at the top of
// the window brings it back. Pages without one (the 404) keep the navbar permanently visible.
export function useScrolledPastHero(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const hero = document.querySelector(HERO_SELECTOR);
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle("scrolled-past-hero", entry ? !entry.isIntersecting : false);
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => {
      observer.disconnect();
      document.body.classList.remove("scrolled-past-hero");
    };
  }, [pathname]);
}
