import { useEffect, type RefObject } from "react";

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export interface Motion {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
}

let loading: Promise<Motion> | undefined;

// GSAP and ScrollTrigger are loaded after hydration: they only drive below-the-fold reveals, so they
// stay out of the initial bundle.
export function loadMotion(): Promise<Motion> {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([core, trigger]) => {
    core.gsap.registerPlugin(trigger.ScrollTrigger);
    return { gsap: core.gsap, ScrollTrigger: trigger.ScrollTrigger };
  });
  return loading;
}

// Runs `setup` once, scoped to `scope`, only while the user allows motion; everything is reverted on unmount.
export function useMotion(scope: RefObject<HTMLElement | null>, setup: (motion: Motion) => void): void {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    const start = () => {
      if (cancelled) return;
      loadMotion()
        .then((motion) => {
          if (cancelled) return;
          const mm = motion.gsap.matchMedia(root);
          mm.add(MOTION_OK, () => setup(motion));
          revert = () => mm.revert();
        })
        .catch(() => {
          // Motion is decoration: if the chunk cannot load, the content is simply shown as is.
        });
    };

    // Wait for an idle moment so the animation code never competes with hydration or first paint.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 3000 })
      : window.setTimeout(start, 1500);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      revert?.();
    };
    // Intentionally once per mount: `setup` is read on mount only.
  }, []);
}
