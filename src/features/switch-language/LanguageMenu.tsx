import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "~/shared/i18n/locales";
import { useT } from "~/shared/i18n/useT";
import { Flag } from "~/shared/ui/Flag";
import { NAV_ICON } from "~/shared/ui/nav";
import { useSeen } from "~/shared/lib/useSeen";
import { useSwitchLanguage } from "./useSwitchLanguage";

const OPTION =
  "flex cursor-pointer items-center justify-center rounded-full bg-transparent p-0 opacity-50 " +
  "transition-[background-color,opacity] duration-150 hover:bg-text/10 hover:opacity-100";

export function LanguageMenu() {
  const { t, locale } = useT();
  const switchLanguage = useSwitchLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const seen = useSeen(open);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("click", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={NAV_ICON}
        id="lang-trigger"
        aria-label={t("nav.aria.language")}
        aria-expanded={open}
        aria-controls="lang-dropdown"
        onClick={() => setOpen((value) => !value)}
      >
        <Flag locale={locale} />
      </button>
      <div
        className={
          "absolute left-1/2 top-[calc(100%+10px)] z-[101] flex -translate-x-1/2 flex-col items-center gap-1 rounded-[20px] border border-line bg-[color-mix(in_srgb,var(--white-color)_90%,transparent)] p-1.5 backdrop-blur-[8px] " +
          "shadow-[0_4px_12px_var(--shadow-dark-sm)] transition-[opacity,transform] duration-150 " +
          (open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0")
        }
        id="lang-dropdown"
        inert={!open}
      >
        {LOCALES.map((option) => (
          <button
            key={option}
            type="button"
            className={`${OPTION} size-[34px] ${option === locale ? "!opacity-100" : ""}`}
            aria-label={LOCALE_LABELS[option]}
            aria-current={option === locale ? "true" : undefined}
            onClick={() => {
              setOpen(false);
              if (option !== locale) switchLanguage(option);
            }}
          >
            <Flag locale={option} deferred={!seen && option !== locale} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileLanguageOptions({ onSelect, revealed }: { onSelect?: () => void; revealed: boolean }) {
  const { locale } = useT();
  const seen = useSeen(revealed);
  const switchLanguage = useSwitchLanguage();
  return (
    <div className="flex gap-1.5">
      {LOCALES.map((option: Locale) => (
        <button
          key={option}
          type="button"
          className={
            `${OPTION} size-[38px] border border-line ` +
            (option === locale ? "!border-link !opacity-100 shadow-[0_0_0_2px_color-mix(in_srgb,var(--link-color)_30%,transparent)]" : "")
          }
          aria-label={LOCALE_LABELS[option]}
          aria-current={option === locale ? "true" : undefined}
          onClick={() => {
            if (option !== locale) switchLanguage(option);
            onSelect?.();
          }}
        >
          <Flag locale={option} deferred={!seen && option !== locale} />
        </button>
      ))}
    </div>
  );
}
