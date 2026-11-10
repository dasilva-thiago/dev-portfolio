import type { SkillGlyph } from "../model/skills";
import { SkillGlyphSvg } from "./SkillGlyphSvg";

export function SkillLearningChip({ skill }: { skill: SkillGlyph }) {
  return (
    <li
      className={
        "group flex cursor-default items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-5 " +
        "transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-link/45 motion-reduce:hover:transform-none"
      }
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 [&_svg]:size-[22px] [&_svg]:text-accent">
        <SkillGlyphSvg path={skill.path} />
      </span>
      <span className="text-[14px] font-semibold text-text transition-colors duration-200 group-hover:text-link">
        {skill.name}
      </span>
    </li>
  );
}
