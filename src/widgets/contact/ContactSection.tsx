import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import { ContactForm } from "~/features/contact-form/ContactForm";
import { CvButton } from "~/features/open-cv/CvButton";
import { useT } from "~/shared/i18n/useT";
import { useMotion } from "~/shared/lib/motion";
import { useSectionFade } from "~/shared/lib/useSectionFade";
import { Icon } from "~/shared/ui/Icon";
import { SectionHeading } from "~/shared/ui/SectionHeading";

const CV_BUTTON =
  "mt-4 inline-flex cursor-pointer items-center justify-center gap-2 self-center rounded-xl border-[1.5px] border-line-strong bg-transparent px-7 py-3 font-[family-name:var(--font-body)] text-[14px] font-semibold text-text " +
  "transition-[border-color,color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-link/50 hover:bg-link/6 hover:text-link hover:shadow-[0_4px_12px_var(--shadow-link-sm)]";

export function ContactSection() {
  const { t } = useT();
  const section = useRef<HTMLElement>(null);
  useSectionFade(section);

  useMotion(section, ({ gsap }) => {
    const root = section.current;
    if (!root) return;
    const trigger = { trigger: root, start: "top 82%", once: true };
    gsap.from("h2", { scrollTrigger: trigger, opacity: 0, y: 20, duration: 0.6, ease: "power2.out", clearProps: "all" });
    gsap.from(".contact-form-wrapper", {
      scrollTrigger: trigger,
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "all",
    });
  });

  return (
    <section
      id="contact"
      className="mb-[100px] flex scroll-mt-6 cursor-default flex-col items-center px-5 py-[60px] max-bp600:px-4"
      ref={section}
    >
      <SectionHeading className="relative mb-3.5">{t("sections.contact.title")}</SectionHeading>
      <p className="mb-10 max-w-[560px] text-center text-[1rem] font-medium leading-[1.75] text-muted max-bp600:text-[0.95rem]">
        {t("contact.intro")}
      </p>

      <div className="contact-form-wrapper flex w-full max-w-[560px] flex-col">
        <ContactForm />
        <CvButton id="contact-cv-btn" className={CV_BUTTON} ariaLabel={t("a11y.resume")}>
          <Icon icon={faFileLines} />
          <span>{t("nav.cv")}</span>
        </CvButton>
      </div>
    </section>
  );
}
