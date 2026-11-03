import type { ReactNode } from "react";

export function ProjectTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block w-fit rounded-[4px] bg-fill px-2.5 py-[3px] font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.5px] text-on-fill ${className}`}
    >
      {children}
    </span>
  );
}
