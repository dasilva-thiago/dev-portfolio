import { Fragment, type ReactNode } from "react";

interface RichProps {
  text: string;
  emClassName?: string;
}

// Renders `<em>…</em>` markers from locale strings as elements, never as HTML.
export function Rich({ text, emClassName }: RichProps): ReactNode {
  const parts = text.split(/<em>(.*?)<\/em>/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className={emClassName}>
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
