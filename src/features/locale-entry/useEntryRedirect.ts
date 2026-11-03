import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isProjectSlug, projectPath } from "~/entities/project/model/slugs";
import { localizePath } from "~/shared/i18n/path";
import { isRedirecting } from "~/shared/lib/redirecting";
import { useT } from "~/shared/i18n/useT";

const LEGACY_PROJECT_HASH = /^#projects\/([^/?#]+)/;

// Legacy `/#projects/<slug>` links (from the old overlay) become the real project route in the current locale.
// The first-visit language redirect happens earlier, in the pre-paint script (src/app/pre-paint.ts).
export function useEntryRedirect(): void {
  const navigate = useNavigate();
  const { locale } = useT();

  useEffect(() => {
    if (isRedirecting()) return;
    const legacy = LEGACY_PROJECT_HASH.exec(window.location.hash);
    if (!legacy?.[1]) return;
    const slug = decodeURIComponent(legacy[1]);
    const to = isProjectSlug(slug) ? projectPath(slug) : "/#projects";
    void navigate(localizePath(to, locale), { replace: true });
    // Intentionally once per mount: later navigations are the user's own choices.
  }, []);
}
