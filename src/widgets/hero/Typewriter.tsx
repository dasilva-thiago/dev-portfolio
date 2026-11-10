import { useEffect, useState } from "react";
import { useT } from "~/shared/i18n/useT";
import { useReducedMotion } from "~/shared/lib/useReducedMotion";

const TYPE_SPEED = 75;
const DELETE_SPEED = 40;
const PAUSE_AFTER = 1800;
const PAUSE_BEFORE = 300;
// The first phrase is the target role: it stays on screen longer and takes the accent color.
const PRIMARY_PAUSE_AFTER = 6000;

// The first phrase is rendered in full (so the pre-rendered HTML and reduced-motion users get real
// content); the animation then deletes it and cycles through the remaining phrases.
export function Typewriter() {
  const { tList } = useT();
  const reduced = useReducedMotion();
  const phrases = tList("hero.typewriter");
  const signature = phrases.join("|");
  const [text, setText] = useState(phrases[0] ?? "");
  const [isPrimary, setIsPrimary] = useState(true);

  useEffect(() => {
    const list = signature.split("|");
    setText(list[0] ?? "");
    setIsPrimary(true);
    if (reduced || list.length === 0) return;

    let phrase = 0;
    let chars = (list[0] ?? "").length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = list[phrase % list.length] ?? "";
      if (deleting) {
        chars -= 1;
        setText(current.slice(0, chars));
        if (chars === 0) {
          deleting = false;
          phrase = (phrase + 1) % list.length;
          setIsPrimary(phrase === 0);
          timer = setTimeout(tick, PAUSE_BEFORE);
          return;
        }
        timer = setTimeout(tick, DELETE_SPEED);
      } else {
        chars += 1;
        setText(current.slice(0, chars));
        if (chars === current.length) {
          deleting = true;
          timer = setTimeout(tick, phrase === 0 ? PRIMARY_PAUSE_AFTER : PAUSE_AFTER);
          return;
        }
        timer = setTimeout(tick, TYPE_SPEED);
      }
    };

    timer = setTimeout(tick, PRIMARY_PAUSE_AFTER);
    return () => clearTimeout(timer);
  }, [signature, reduced]);

  return (
    <>
      <span id="typewriter-target" className={isPrimary ? "font-bold text-link" : undefined}>
        {text}
      </span>
      <span
        className="typewriter-cursor ml-px inline-block animate-cursor-blink font-light text-link motion-reduce:animate-none"
        aria-hidden="true"
      >
        |
      </span>
    </>
  );
}
