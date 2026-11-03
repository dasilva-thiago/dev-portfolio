import br from "flag-icons/flags/4x3/br.svg";
import us from "flag-icons/flags/4x3/us.svg";
import type { Locale } from "../i18n/locales";

// The official Spanish flag embeds a detailed coat of arms (about 80 kB); at 20x15 px the three stripes are
// all that is visible, so a minimal version is used instead.
const ES =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" fill="#c60b1e"/><rect y="120" width="640" height="240" fill="#ffc400"/></svg>',
  );

const FLAGS: Record<Locale, string> = { en: us, pt: br, es: ES };

// `deferred` keeps the box but skips the image request until the flag is actually shown.
export function Flag({ locale, deferred = false }: { locale: Locale; deferred?: boolean }) {
  return (
    <span
      className="relative inline-block h-[15px] w-5 rounded-[3px] bg-contain bg-center bg-no-repeat leading-none before:content-['\00a0']"
      aria-hidden="true"
      style={deferred ? undefined : { backgroundImage: `url("${FLAGS[locale]}")` }}
    />
  );
}
