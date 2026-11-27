import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useT } from "~/shared/i18n/useT";
import { useReducedMotion } from "~/shared/lib/useReducedMotion";
import { Icon } from "~/shared/ui/Icon";
import type { GalleryImage } from "../model/projects";

const INTERVAL_MS = 4500;

export interface CardSlide {
  readonly image: GalleryImage;
  readonly alt: string;
}

// Card image that cross-fades through a few photos on its own. Slides are mounted one step ahead of the one on
// screen, so the home page downloads the first two images, not all of them. It starts paused when the visitor
// prefers reduced motion, and the button (above the card's link overlay) pauses or resumes it.
export function CardCarousel({ slides }: { slides: readonly CardSlide[] }) {
  const { t } = useT();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(1);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const count = slides.length;

  useEffect(() => {
    setMounted((n) => Math.max(n, Math.min(index + 2, count)));
  }, [index, count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  return (
    <div className="relative size-full">
      {slides.slice(0, mounted).map((slide, i) => (
        <img
          key={slide.image.src}
          src={slide.image.src}
          alt={i === index ? slide.alt : ""}
          aria-hidden={i === index ? undefined : true}
          width={slide.image.width}
          height={slide.image.height}
          loading={i === 0 ? "lazy" : "eager"}
          decoding="async"
          className={
            `absolute inset-0 block size-full object-cover transition-opacity duration-700 motion-reduce:transition-none ` +
            `${slide.image.render ? "bg-[#1d2127]" : ""} ${slide.image.cardPosition ?? ""} ${i === index ? "opacity-100" : "opacity-0"}`
          }
        />
      ))}
      {count > 1 ? (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-4 left-4 flex gap-1.5">
            {slides.map((slide, i) => (
              <span
                key={slide.image.src}
                className={`h-1.5 rounded-full bg-white shadow-[0_0_2px_rgba(0,0,0,0.6)] transition-[width,opacity] duration-300 ${i === index ? "w-4 opacity-100" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-label={paused ? t("buttons.playSlides") : t("buttons.pauseSlides")}
            className="absolute bottom-3 right-3 z-[2] grid size-8 cursor-pointer place-items-center rounded-full bg-black/55 text-[12px] text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Icon icon={paused ? faPlay : faPause} />
          </button>
        </>
      ) : null}
    </div>
  );
}
