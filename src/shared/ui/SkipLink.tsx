import { useT } from "../i18n/useT";

export function SkipLink() {
  const { t } = useT();
  return (
    <a
      href="#main-content"
      className="absolute left-0 top-[-100%] z-[9999] rounded-br-lg bg-link px-5 py-3 font-semibold text-page transition-[top] duration-200 focus:top-0 focus:outline-[3px] focus:outline-text"
    >
      {t("a11y.skipLink")}
    </a>
  );
}
