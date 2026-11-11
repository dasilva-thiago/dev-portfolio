import type { ReactNode } from "react";
import { useT } from "~/shared/i18n/useT";
import { CV_LINKS } from "./cvLinks";

interface CvButtonProps {
  id?: string;
  className: string;
  ariaLabel?: string;
  onOpen?: () => void;
  children: ReactNode;
}

// A real link, not a button with window.open: crawlers, screen readers and middle-click all see the target.
export function CvButton({ id, className, ariaLabel, onOpen, children }: CvButtonProps) {
  const { locale } = useT();
  return (
    <a
      id={id}
      className={className}
      aria-label={ariaLabel}
      href={CV_LINKS[locale]}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onOpen?.()}
    >
      {children}
    </a>
  );
}
