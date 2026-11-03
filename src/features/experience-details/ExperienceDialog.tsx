import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, type MouseEvent } from "react";
import { EXPERIENCE, type ExperienceId } from "~/entities/experience/model/experience";
import safetyLabels from "~/shared/assets/img/safety_labels_en_pt.webp";
import { useT } from "~/shared/i18n/useT";
import { lockScroll, unlockScroll } from "~/shared/lib/scrollLock";
import { Icon } from "~/shared/ui/Icon";

const BODY = "mb-3.5 text-[18px] font-medium leading-[1.7] text-muted";
const CHIPS = "flex flex-wrap gap-2";
const CHIP =
  "cursor-default border border-l-2 border-line border-l-accent bg-page px-3 py-[3px] font-[family-name:var(--font-mono)] text-[13px] font-normal tracking-[0.05em]";

interface ExperienceDialogProps {
  id: ExperienceId | null;
  onClose: () => void;
}

// Native <dialog>: showModal() provides the focus containment, Escape handling, inert background
// and focus restoration to the opener. Scroll locking is the only thing added here.
export function ExperienceDialog({ id, onClose }: ExperienceDialogProps) {
  const { t, tList } = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const locked = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (id && !dialog.open) {
      dialog.showModal();
      if (!locked.current) {
        lockScroll();
        locked.current = true;
      }
    } else if (!id && dialog.open) {
      dialog.close();
    }
  }, [id]);

  useEffect(
    () => () => {
      if (locked.current) {
        unlockScroll();
        locked.current = false;
      }
    },
    [],
  );

  function handleClose() {
    if (locked.current) {
      unlockScroll();
      locked.current = false;
    }
    onClose();
  }

  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  const entry = EXPERIENCE.find((candidate) => candidate.id === id);
  const titleId = id ? `experience-${id}-title` : undefined;

  return (
    <dialog
      ref={ref}
      className="about-dialog fixed inset-0 z-[9999] m-0 hidden size-full max-h-none max-w-none overflow-y-auto border-0 bg-black/18 px-6 pb-10 pt-[72px] text-inherit opacity-0 backdrop-blur-[10px] transition-opacity duration-200 open:flex open:items-center open:justify-center open:opacity-100"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={handleBackdrop}
    >
      {entry ? (
        <div className="relative m-auto w-full max-w-[500px] shrink-0 rounded-2xl border border-line bg-surface p-7 transition-transform duration-200 max-bp480:rounded-xl max-bp480:p-5">
          <button type="button" className="fixed right-6 top-5 z-[10000] flex size-9 cursor-pointer items-center justify-center rounded-full border border-line bg-transparent text-[15px] text-muted backdrop-blur-[8px] transition-[background-color,color] duration-150 hover:bg-text/8 hover:text-text" aria-label={t("a11y.close")} onClick={onClose}>
            <Icon icon={faXmark} />
          </button>

          <div className="mb-4 flex items-start gap-3.5 pr-8">
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[22px] text-accent">
              <Icon icon={entry.icon} />
            </div>
            <div>
              <p className="mb-[3px] text-[22px] font-semibold text-text" id={titleId}>
                {t(`experience.${entry.id}.title`)}
              </p>
              <p className="text-[18px] text-link">{t(`experience.${entry.id}.place`)}</p>
            </div>
          </div>

          {entry.id === "seduc" ? (
            <>
              <p className={BODY}>{t("experience.seduc.description")}</p>
              <div className={CHIPS}>
                {tList("experience.seduc.tags").map((tag) => (
                  <span key={tag} className={CHIP}>{tag}</span>
                ))}
              </div>
            </>
          ) : null}

          {entry.id === "tenaris" ? (
            <>
              <p className={BODY}>{t("experience.tenaris.description")}</p>
              <hr className="my-4 border-0 border-t border-line" />
              <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.06em] text-link">{t("initiative.industrialSafety.title")}</p>
              <p className={BODY}>{t("initiative.industrialSafety.description")}</p>
              <img
                src={safetyLabels}
                alt={t("initiative.industrialSafety.imageAlt")}
                className="mb-3.5 mt-3 block w-full rounded-lg border border-line"
                width={1500}
                height={735}
                loading="lazy"
              />
              <div className={CHIPS}>
                {tList("initiative.industrialSafety.tags").map((tag) => (
                  <span key={tag} className={CHIP}>{tag}</span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
