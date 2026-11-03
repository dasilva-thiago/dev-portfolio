import { useEffect } from "react";

// Marks <body> once the hero has left the viewport so the pill navbar can hide.
// Pages without a hero (project pages) keep the navbar permanently visible.
export function useScrolledPastHero(): void {
  useEffect(() => {
    const hero = document.querySelector(".hero-section");
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
  }, []);
}
