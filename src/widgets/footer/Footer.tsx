import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { SITE } from "~/shared/config/site";
import { Icon } from "~/shared/ui/Icon";
import { SECTION } from "~/shared/ui/section";

const LINK =
  "text-muted transition-colors duration-200 hover:text-link";

export function Footer() {
  return (
    <footer
      className={`${SECTION} cursor-default border-t-[1.5px] border-line py-10 text-center text-[14px] font-medium text-muted max-bp850:py-[30px]`}
    >
      <div className="mb-3 flex justify-center gap-5 text-[22px]">
        <a href={SITE.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={LINK}>
          <Icon icon={faGithub} />
        </a>
        <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={LINK}>
          <Icon icon={faLinkedin} />
        </a>
        <a href={`mailto:${SITE.email}`} aria-label="Email" className={LINK}>
          <Icon icon={faEnvelope} />
        </a>
      </div>
      <p>
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {SITE.author} •{" "}
        {SITE.location}
      </p>
    </footer>
  );
}
