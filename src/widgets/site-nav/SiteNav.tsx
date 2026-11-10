import {
  faBriefcase,
  faCode,
  faEnvelope,
  faFileLines,
  faHouse,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CvButton } from "~/features/open-cv/CvButton";
import { LanguageMenu, MobileLanguageOptions } from "~/features/switch-language/LanguageMenu";
import { ContrastToggle, DarkModeToggle } from "~/features/toggle-appearance/Toggles";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { inertOutside } from "~/shared/lib/inertOutside";
import { lockScroll, unlockScroll } from "~/shared/lib/scrollLock";
import { Icon } from "~/shared/ui/Icon";
import { NAV_ICON } from "~/shared/ui/nav";
import { useScrolledPastHero } from "./useScrolledPastHero";

const SECTION_LINKS = [
  { hash: "", icon: faHouse, labelKey: "nav.aria.home" },
  { hash: "#projects", icon: faBriefcase, labelKey: "nav.aria.projects" },
  { hash: "#skills", icon: faCode, labelKey: "nav.aria.skills" },
  { hash: "#about", icon: faPen, labelKey: "nav.aria.about" },
  { hash: "#contact", icon: faEnvelope, labelKey: "nav.aria.contact" },
] as const;

const DESKTOP_TOGGLE =
  "!size-[34px] !text-[16px] !text-link !opacity-100 shadow-[0_0_0_1.5px_var(--border-color)] !bg-transparent " +
  "hover:!bg-link/8 hover:shadow-[0_0_0_1.5px_var(--link-color)]";

// The contrast toggle only takes the "active" look while high contrast is on.
const DESKTOP_CONTRAST_ACTIVE =
  "hc:!size-[34px] hc:!text-[16px] hc:!text-link hc:!opacity-100 hc:shadow-[0_0_0_1.5px_var(--border-color)] hc:!bg-transparent " +
  "hc:hover:!bg-link/8 hc:hover:shadow-[0_0_0_1.5px_var(--link-color)]";

const SEPARATOR = "mx-1 h-[22px] w-px shrink-0 bg-line";

const MOBILE_ICON =
  "flex size-[38px] cursor-pointer items-center justify-center rounded-full border border-line bg-transparent text-[15px] text-text " +
  "transition-[background-color,color] duration-150 hover:bg-text/10 hover:text-link";

const MOBILE_ROW =
  "flex w-full items-center gap-3.5 rounded-[10px] px-4 py-3 text-[16px] text-text transition-[background-color,color] duration-150 " +
  "hover:bg-link/8 hover:text-link";

const DIVIDER = "my-2 h-px bg-line";

export function SiteNav({ floating = false }: { floating?: boolean }) {
  const { t } = useT();
  const localize = useLocalizedPath();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useScrolledPastHero();

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) menuButton.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    lockScroll();
    // Keep keyboard and screen-reader focus inside the drawer (and its toggle) while it is open.
    const restore = inertOutside([drawer.current, menuButton.current]);
    firstLink.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restore();
      unlockScroll();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div
        id="nav-trigger"
        className="peer fixed left-0 top-0 z-[99] hidden h-[70px] w-full in-[.scrolled-past-hero]:block max-bp1024:!hidden"
      />
      <nav
        aria-label={t("a11y.mainNavigation")}
        className={
          "z-[100] flex justify-center transition-opacity duration-300 max-bp1024:hidden " +
          "in-[.scrolled-past-hero]:pointer-events-none in-[.scrolled-past-hero]:opacity-0 " +
          "peer-hover:pointer-events-auto peer-hover:opacity-100 in-[.scrolled-past-hero]:hover:pointer-events-auto in-[.scrolled-past-hero]:hover:opacity-100 " +
          (floating ? "pointer-events-none fixed inset-x-0 top-[25px]" : "sticky top-[25px] mb-[15px]")
        }
      >
        <div
          className={
            "inline-flex items-center gap-1.5 rounded-full border border-line bg-[color-mix(in_srgb,var(--white-color)_85%,transparent)] px-3.5 py-2 backdrop-blur-[8px] " +
            "shadow-[0_4px_12px_var(--shadow-dark-sm)] max-bp1024:hidden " +
            (floating ? "pointer-events-auto" : "")
          }
        >
          {SECTION_LINKS.map(({ hash, icon, labelKey }) => (
            <Link key={labelKey} to={localize(`/${hash}`)} className={NAV_ICON} aria-label={t(labelKey)}>
              <Icon icon={icon} />
            </Link>
          ))}

          <div className={SEPARATOR} />

          <DarkModeToggle id="dark-toggle" className={`${NAV_ICON} ${DESKTOP_TOGGLE}`} ariaLabel={t("nav.aria.darkToggle")} />
          <ContrastToggle
            id="contrast-toggle"
            className={`${NAV_ICON} ${DESKTOP_CONTRAST_ACTIVE}`}
            ariaLabel={t("nav.aria.contrastToggle")}
          />

          <div className={SEPARATOR} />

          <CvButton id="cv-btn" className={NAV_ICON} ariaLabel={t("nav.aria.cv")}>
            <Icon icon={faFileLines} />
          </CvButton>

          <div className={SEPARATOR} />

          <LanguageMenu />
        </div>
      </nav>

      <button
        ref={menuButton}
        type="button"
        className={
          "hamburger-wrapper hamburger hover:opacity-70 fixed right-5 top-5 z-[200] hidden cursor-pointer items-center justify-center rounded-xl border border-line " +
          "bg-[color-mix(in_srgb,var(--white-color)_85%,transparent)] px-4 py-3.5 backdrop-blur-[8px] shadow-[0_4px_12px_var(--shadow-dark-sm)] max-bp1024:flex " +
          (open ? "is-active" : "")
        }
        id="mobile-menu-btn"
        aria-label={t("a11y.menu")}
        aria-controls="mobile-nav"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="relative flex h-4 w-[22px] flex-col items-center justify-between">
          <span className="hamburger-inner" />
        </span>
      </button>

      <div
        ref={drawer}
        id="mobile-nav"
        className={
          "fixed inset-0 z-[150] overflow-hidden bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
        inert={!open}
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest("[data-drawer]")) close();
        }}
      >
        <div
          data-drawer
          className={
            "absolute right-0 top-0 flex h-full w-[min(300px,85vw)] flex-col gap-2 overflow-y-auto overflow-x-hidden border border-line " +
            "bg-[color-mix(in_srgb,var(--white-color)_75%,transparent)] px-6 pb-10 pt-20 backdrop-blur-[20px] shadow-[-8px_0_32px_var(--shadow-dark-md)] " +
            "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] " +
            (open ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="flex flex-col gap-1">
            {SECTION_LINKS.map(({ hash, icon, labelKey }, index) => (
              <Link
                key={labelKey}
                ref={index === 0 ? firstLink : undefined}
                to={localize(`/${hash}`)}
                className={`${MOBILE_ROW} font-medium [&_svg]:text-muted [&_svg]:transition-colors [&_svg]:duration-150 hover:[&_svg]:text-link`}
                onClick={close}
              >
                <Icon icon={icon} />
                <span>{t(labelKey)}</span>
              </Link>
            ))}
          </div>

          <div className={DIVIDER} />

          <CvButton
            id="mobile-cv-btn"
            className={`${MOBILE_ROW} cursor-pointer border-[1.5px] border-line-strong bg-transparent font-[family-name:var(--font-body)] font-semibold hover:border-link/50 hover:bg-link/6`}
            onOpen={close}
          >
            <Icon icon={faFileLines} />
            <span>{t("nav.cv")}</span>
          </CvButton>

          <div className={DIVIDER} />

          <div className="flex items-center justify-between p-1">
            <span className="text-[13px] font-semibold uppercase tracking-[0.5px] text-muted">
              {t("nav.mobile.theme")}
            </span>
            <div className="flex gap-1.5">
              <DarkModeToggle
                id="mobile-dark-toggle"
                className={`${MOBILE_ICON} !border-link !text-link hover:!bg-link/8`}
                ariaLabel={t("a11y.toggleDark")}
              />
              <ContrastToggle
                id="mobile-contrast-toggle"
                className={`${MOBILE_ICON} hc:!border-link hc:!text-link hc:shadow-[0_0_0_1.5px_var(--link-color)] hc:hover:!bg-link/8`}
                ariaLabel={t("a11y.toggleContrast")}
              />
            </div>
          </div>

          <div className={DIVIDER} />

          <div className="flex items-center justify-between p-1">
            <span className="text-[13px] font-semibold uppercase tracking-[0.5px] text-muted">
              {t("nav.aria.language")}
            </span>
            <MobileLanguageOptions onSelect={close} revealed={open} />
          </div>
        </div>
      </div>
    </>
  );
}
