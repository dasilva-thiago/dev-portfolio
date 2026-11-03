let locks = 0;

export function lockScroll(): void {
  if (locks++ === 0) document.body.style.overflow = "hidden";
}

export function unlockScroll(): void {
  if (locks > 0 && --locks === 0) document.body.style.overflow = "";
}
