import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useT } from "../i18n/useT";
import { Icon } from "./Icon";

const BUTTON =
  "relative z-[2] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[0.875rem] no-underline " +
  "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_var(--shadow-link-sm)]";

export function AccessButton({ href }: { href: string }) {
  const { t } = useT();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BUTTON} border-[1.5px] border-fill bg-fill font-bold text-on-fill transition-[filter,transform,box-shadow] duration-200 hover:brightness-[.94] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-link`}
    >
      <Icon icon={faArrowRight} aria-hidden="true" />
      <span>{t("buttons.access")}</span>
    </a>
  );
}

export function GithubButton({ href }: { href: string }) {
  const { t } = useT();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BUTTON} border-[1.5px] border-line-strong bg-transparent font-semibold text-text transition-[border-color,color,background-color,transform,box-shadow] duration-200 hover:border-link/50 hover:bg-link/6 hover:text-link`}
    >
      <Icon icon={faGithub} />
      <span>{t("buttons.github")}</span>
    </a>
  );
}
