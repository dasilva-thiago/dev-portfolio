import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope as faEnvelopeRegular, faFileLines as faFileLinesRegular } from "@fortawesome/free-regular-svg-icons";
import { faBriefcase, faEnvelope, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { projectPath } from "~/entities/project/model/slugs";
import { CvButton } from "~/features/open-cv/CvButton";
import { SITE } from "~/shared/config/site";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { Icon } from "~/shared/ui/Icon";
import { SECTION } from "~/shared/ui/section";

const SOCIAL_ICON =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-social-border bg-social-bg text-[1.1rem] text-social " +
  "transition-[transform,box-shadow,color,border-color,background-color] duration-[500ms,200ms,200ms,200ms,200ms] " +
  "hover:-translate-y-[3px] hover:scale-[1.2] hover:border-link/45 hover:bg-link hover:text-surface " +
  "hover:shadow-[0_0_0_2px_var(--background-color),0_0_0_4px_var(--link-color),0_10px_30px_color-mix(in_srgb,var(--link-color)_12%,transparent),0_2px_8px_color-mix(in_srgb,var(--link-color)_8%,transparent)]";

const BUTTON_HOVER =
  "transition-all duration-100 hover:-translate-y-1 hover:border-text/50 hover:brightness-90";

const OUTLINE_BUTTON = `mb-2.5 mr-2.5 inline-block rounded-lg border-2 border-link px-2.5 py-[5px] hover:text-text hover:shadow-[0_8px_24px_var(--shadow-link-sm)] ${BUTTON_HOVER}`;

export function Hero() {
  const { t } = useT();
  const localize = useLocalizedPath();

  return (
    <section
      className={`hero-section ${SECTION} flex min-h-[calc(100vh-110px)] cursor-default items-center justify-center text-center max-bp1024:min-h-[calc(100vh-90px)] max-bp768:min-h-[calc(100svh-80px)]`}
    >
      <div className="flex w-full max-w-[780px] flex-[5] flex-col items-center max-bp1024:max-w-[700px] max-bp768:max-w-[90%]">
        <span className="hero-greeting animate-fade-up [animation-delay:0ms] motion-reduce:animate-none mb-5 text-[18px] tracking-[0.5px] text-muted max-bp768:mb-4 max-bp768:text-[15px] max-bp600:mb-3.5 max-bp600:text-[13px] max-bp480:mb-3 max-bp480:text-[12px]">
          {t("hero.availability")}
        </span>
        <h1 className="animate-fade-up [animation-delay:100ms] motion-reduce:animate-none self-center text-balance pb-[15px] font-[family-name:var(--font-hero)] text-[clamp(44px,6vw,84px)] leading-[1.15] text-text hc:text-link hc:[-webkit-text-fill-color:var(--link-color)]">
          {t("hero.title")}
        </h1>
        <p className="hero-subtitle animate-fade-up [animation-delay:350ms] motion-reduce:animate-none self-center text-[32px] font-semibold italic tracking-[0.3px] text-muted max-bp1024:text-[28px] max-bp768:text-[26px] max-bp600:text-[24px] max-bp480:text-[22px] max-bp360:text-[19px]">
          {t("hero.subtitle")}
        </p>
        <p className="hero-stack animate-fade-up [animation-delay:425ms] motion-reduce:animate-none mt-3 font-[family-name:var(--font-mono)] text-[15px] tracking-[0.04em] text-link max-bp480:text-[13px]">
          {t("hero.stack")}
        </p>

        <div className="hero-description animate-fade-up [animation-delay:500ms] motion-reduce:animate-none mt-8 max-w-[650px] text-balance text-center text-[1.1rem] leading-[1.8] text-muted max-bp1024:max-w-[620px] max-bp1024:text-[1.05rem] max-bp768:max-w-[520px] max-bp768:text-[1rem] max-bp768:leading-[1.7] max-bp600:mt-6 max-bp600:max-w-[400px] max-bp600:leading-[1.65] max-bp480:mt-7 max-bp480:max-w-[340px] max-bp480:leading-[1.6] max-bp360:max-w-[300px] max-bp360:text-[0.95rem]">
          <p>{t("hero.description")}</p>
          <p className="mt-2 text-[0.95rem] max-bp480:text-[0.9rem]">{t("hero.location")}</p>
        </div>

        <div className="hero-social-links animate-fade-up [animation-delay:600ms] motion-reduce:animate-none mb-[5px] mt-[25px] flex items-center justify-center gap-[18px]">
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON} aria-label="GitHub">
            <Icon icon={faGithub} />
          </a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className={SOCIAL_ICON} aria-label="LinkedIn">
            <Icon icon={faLinkedinIn} />
          </a>
          <a href={`mailto:${SITE.email}`} className={SOCIAL_ICON} aria-label="Email">
            <Icon icon={faEnvelopeRegular} />
          </a>
          <CvButton id="hero-cv-icon" className={SOCIAL_ICON} ariaLabel={t("nav.aria.cv")}>
            <Icon icon={faFileLinesRegular} />
          </CvButton>
        </div>

        <div className="hero-buttons animate-fade-up [animation-delay:700ms] motion-reduce:animate-none mt-[25px] flex flex-wrap justify-center">
          <Link
            to={localize(projectPath("eduassets"))}
            className={`mb-2.5 mr-2.5 inline-flex items-center gap-1.5 rounded-lg border-2 border-fill bg-fill px-2.5 py-[5px] text-[1rem] text-on-fill hover:shadow-[0_8px_24px_var(--shadow-link-md)] ${BUTTON_HOVER}`}
          >
            <Icon icon={faBriefcase} />
            <span>{t("hero.cta")}</span>
          </Link>
          <CvButton id="hero-cv-button" className={`${OUTLINE_BUTTON} cursor-pointer bg-transparent font-[inherit] text-[1rem] text-link`}>
            <Icon icon={faFileLines} /> <span>{t("nav.cv")}</span>
          </CvButton>
          <Link to={localize("/#contact")} className={OUTLINE_BUTTON}>
            <Icon icon={faEnvelope} /> <span>{t("nav.contact")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
