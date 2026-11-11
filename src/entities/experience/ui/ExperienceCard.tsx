import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { useT } from "~/shared/i18n/useT";
import { Icon } from "~/shared/ui/Icon";
import type { ExperienceEntry } from "../model/experience";

interface ExperienceCardProps {
  entry: ExperienceEntry;
  // When set, the card is a link to the entry's section on the experience page.
  to?: string;
}

const CARD =
  "group flex w-full items-start gap-3 rounded-[10px] border border-line bg-surface px-[18px] py-4 text-left font-[family-name:var(--font-body)] text-text no-underline " +
  "hover:border-link/50 hover:shadow-[0_4px_16px_var(--shadow-link-sm)]";

const LINKED = "transition-[border-color,box-shadow,transform] duration-[150ms,150ms,300ms] hover:-translate-y-1";

export function ExperienceCard({ entry, to }: ExperienceCardProps) {
  const { t } = useT();
  const key = `experience.${entry.id}` as const;
  const content = (
    <>
      <div className="mt-[15px] flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[22px] text-accent">
        <Icon icon={entry.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="mb-[3px] block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.05em] text-link">
          {t(`${key}.date`)}
        </span>
        <p className="mb-0.5 text-[18px] font-semibold text-text">{t(`${key}.title`)}</p>
        <p className="text-[14px] font-semibold text-muted">{t(`${key}.place`)}</p>
        {to ? (
          <p className="mt-[7px] inline-flex items-center gap-[5px] text-[11px] font-semibold text-link transition-[gap] duration-150 group-hover:gap-2">
            <Icon icon={faArrowRight} /> <span>{t("about.seeMore")}</span>
          </p>
        ) : null}
      </div>
    </>
  );

  return to ? (
    <Link to={to} data-experience={entry.id} className={`${CARD} ${LINKED}`}>
      {content}
    </Link>
  ) : (
    <div className={`${CARD} cursor-default transition-[border-color,box-shadow] duration-150`}>{content}</div>
  );
}
