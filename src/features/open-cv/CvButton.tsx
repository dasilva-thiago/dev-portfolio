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

export function CvButton({ id, className, ariaLabel, onOpen, children }: CvButtonProps) {
  const { locale } = useT();
  return (
    <button
      type="button"
      id={id}
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        window.open(CV_LINKS[locale], "_blank", "noopener,noreferrer");
        onOpen?.();
      }}
    >
      {children}
    </button>
  );
}
