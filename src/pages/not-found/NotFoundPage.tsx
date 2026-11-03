import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SITE } from "~/shared/config/site";
import { I18nProvider } from "~/shared/i18n/I18nProvider";
import { loadResources } from "~/shared/i18n/load";
import { HTML_LANG, type Locale } from "~/shared/i18n/locales";
import { localeFromPath } from "~/shared/i18n/path";
import type { Resources } from "~/shared/i18n/types";
import { useLocalizedPath, useT } from "~/shared/i18n/useT";
import { SkipLink } from "~/shared/ui/SkipLink";
import { SiteNav } from "~/widgets/site-nav/SiteNav";

function NotFoundContent() {
  const { t } = useT();
  const localize = useLocalizedPath();
  return (
    <>
      <SkipLink />
      <SiteNav floating />
      <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-[family-name:var(--font-mono)] text-[12px] font-bold uppercase tracking-[0.08em] text-link">404</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] text-text">{t("notFound.title")}</h1>
        <p className="max-w-[460px] font-medium leading-[1.65] text-muted">{t("notFound.text")}</p>
        <Link
          to={localize("/")}
          className="mt-2 rounded-lg border-2 border-fill bg-fill px-4 py-1.5 text-[1rem] text-on-fill transition-[transform,filter] duration-100 hover:-translate-y-1 hover:brightness-90"
        >
          {t("notFound.home")}
        </Link>
      </main>
    </>
  );
}

// The host serves one static 404.html (English) for every unknown URL. Under /pt or /es the page loads that
// locale's copy once it is running in the browser, so visitors read the 404 in the language of the URL.
export function NotFoundPage() {
  const { locale } = useT();
  const [override, setOverride] = useState<{ locale: Locale; resources: Resources } | null>(null);

  useEffect(() => {
    const fromUrl = localeFromPath(window.location.pathname);
    if (fromUrl === locale) return;
    let cancelled = false;
    void loadResources(fromUrl).then((resources) => {
      if (!cancelled) setOverride({ locale: fromUrl, resources });
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!override) return;
    document.documentElement.lang = HTML_LANG[override.locale];
    document.title = `${override.resources.notFound.title} — ${SITE.author}`;
  }, [override]);

  return override ? (
    <I18nProvider locale={override.locale} resources={override.resources}>
      <NotFoundContent />
    </I18nProvider>
  ) : (
    <NotFoundContent />
  );
}
