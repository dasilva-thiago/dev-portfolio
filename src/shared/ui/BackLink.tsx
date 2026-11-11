import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { Icon } from "./Icon";

const BACK_LINK =
  "fixed left-[clamp(1.25rem,5vw,2.5rem)] top-4 z-[110] inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-line " +
  "bg-[color-mix(in_srgb,var(--white-color)_92%,transparent)] px-3.5 py-[7px] font-[family-name:var(--font-mono)] text-[0.875rem] font-medium text-text no-underline " +
  "backdrop-blur-[10px] shadow-[0_2px_8px_var(--shadow-dark-sm)] transition-[color,border-color,background-color] duration-150 " +
  "hover:border-link/50 hover:bg-[color-mix(in_srgb,var(--link-color)_6%,var(--white-color))] hover:text-link " +
  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-link hc:bg-page hc:shadow-none " +
  "max-bp640:top-3 max-bp640:px-3 max-bp640:py-1.5";

// Fixed "back" pill shown on the inner pages (project and experience). It sits above the navbar hover zone
// (z-99) and the navbar (z-100) so it stays clickable after the page scrolls past its top.
export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className={BACK_LINK}>
      <Icon icon={faArrowLeft} />
      <span>{label}</span>
    </Link>
  );
}
