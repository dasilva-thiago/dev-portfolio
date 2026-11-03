import type { RefObject } from "react";
import { useMotion } from "./motion";

// Scroll-in fade-up for a whole section (replaces the old AOS `fade-up`).
export function useSectionFade(ref: RefObject<HTMLElement | null>): void {
  useMotion(ref, ({ gsap }) => {
    const section = ref.current;
    if (!section) return;
    gsap.from(section, {
      scrollTrigger: { trigger: section, start: "top bottom-=60", once: true },
      opacity: 0,
      y: 100,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "all",
    });
  });
}
