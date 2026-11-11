import type { SkillGlyph } from "../model/skills";
import { SkillGlyphSvg } from "./SkillGlyphSvg";

// `learning` marks a skill still being studied: same tile, dashed outline.
export function SkillIconCard({ skill, learning = false }: { skill: SkillGlyph; learning?: boolean }) {
  return (
    <div
      className={
        "skill-icon-card group relative flex cursor-default flex-col items-center gap-2.5 overflow-hidden rounded-[14px] border bg-surface px-2.5 pb-3.5 pt-[18px] max-bp600:px-1 " +
        (learning ? "border-dashed border-link/50 " : "border-line ") +
        "transition-[transform,border-color,box-shadow] duration-[300ms,250ms,250ms] " +
        "hover:-translate-y-[5px] hover:border-link/45 hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--link-color)_12%,transparent),0_2px_8px_color-mix(in_srgb,var(--link-color)_8%,transparent)] " +
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-[350ms] before:content-[''] " +
        "before:bg-[linear-gradient(130deg,transparent_35%,color-mix(in_srgb,var(--link-color)_8%,transparent)_55%,transparent_75%)] hover:before:opacity-100"
      }
    >
      <div
        className={
          "relative z-[1] flex size-12 shrink-0 items-center justify-center rounded-xl border-[0.5px] border-accent/[.18] bg-accent/[.08] " +
          "transition-[background-color,border-color] duration-250 group-hover:border-accent/35 group-hover:bg-accent/[.16] " +
          "max-bp600:size-10 [&_svg]:size-[26px] [&_svg]:text-accent [&_svg]:opacity-75 [&_svg]:transition-[opacity,transform] [&_svg]:duration-[250ms,300ms] " +
          "group-hover:[&_svg]:scale-110 group-hover:[&_svg]:opacity-100 max-bp600:[&_svg]:size-[22px]"
        }
      >
        <SkillGlyphSvg path={skill.path} />
      </div>
      <span className="relative z-[1] text-[12px] font-bold tracking-[0.02em] text-muted transition-colors duration-200 group-hover:text-link max-bp600:text-[10px]">
        {skill.name}
      </span>
    </div>
  );
}
