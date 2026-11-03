// True while the pre-paint script is replacing this document with its localized version (src/app/pre-paint.ts).
export function isRedirecting(): boolean {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-redirecting");
}
