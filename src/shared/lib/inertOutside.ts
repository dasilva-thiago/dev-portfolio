// Makes every top-level <body> child except `keep` inert (unfocusable, hidden from assistive tech), the way a
// modal <dialog> does. Returns a function that restores only what it changed.
export function inertOutside(keep: ReadonlyArray<Element | null>): () => void {
  const kept = new Set(keep.filter((element): element is Element => element !== null));
  const changed: HTMLElement[] = [];
  for (const element of Array.from(document.body.children)) {
    if (!(element instanceof HTMLElement) || kept.has(element) || element.inert) continue;
    if (element.tagName === "SCRIPT") continue;
    element.inert = true;
    changed.push(element);
  }
  return () => {
    for (const element of changed) element.inert = false;
  };
}
