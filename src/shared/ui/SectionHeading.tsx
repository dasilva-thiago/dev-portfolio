import type { ReactNode } from "react";

// Section titles share the short accent bar underneath.
export function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`text-center text-[35px] after:mx-auto after:mt-2.5 after:block after:h-[3px] after:w-12 after:rounded-[2px] after:bg-fill after:content-[''] ${className}`}
    >
      {children}
    </h2>
  );
}
