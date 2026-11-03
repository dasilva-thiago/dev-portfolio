import type { CSSProperties } from "react";
import type { EvolvingSkill } from "../model/skills";
import { SkillGlyphSvg } from "./SkillGlyphSvg";

export function SkillRunway({ skill }: { skill: EvolvingSkill }) {
  const fillStyle = { "--skill-pct": `${skill.percent}%` } as CSSProperties;
  return (
    <div
      className={
        "group relative flex cursor-default items-center gap-[18px] overflow-hidden rounded-[14px] border border-line bg-surface px-[22px] py-[18px] " +
        "transition-[transform,border-color,box-shadow] duration-[300ms,250ms,250ms] " +
        "hover:-translate-y-1 hover:border-link/45 hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--link-color)_10%,transparent),0_2px_8px_color-mix(in_srgb,var(--link-color)_6%,transparent)] " +
        "motion-reduce:transition-[border-color,box-shadow] motion-reduce:hover:transform-none " +
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-[350ms] before:content-[''] " +
        "before:bg-[linear-gradient(130deg,transparent_35%,color-mix(in_srgb,var(--link-color)_6%,transparent)_55%,transparent_75%)] hover:before:opacity-100"
      }
    >
      <div
        className={
          "relative z-[1] flex size-[52px] shrink-0 items-center justify-center rounded-xl border-[0.5px] border-accent/20 bg-accent/[.08] " +
          "transition-[background-color,border-color,transform] duration-[250ms,250ms,300ms] " +
          "group-hover:scale-[1.08] group-hover:border-accent/40 group-hover:bg-accent/15 " +
          "[&_svg]:size-7 [&_svg]:text-accent [&_svg]:opacity-75 [&_svg]:transition-[opacity,transform] [&_svg]:duration-[250ms,300ms] " +
          "group-hover:[&_svg]:scale-105 group-hover:[&_svg]:opacity-100"
        }
      >
        <SkillGlyphSvg path={skill.path} />
      </div>
      <div className="relative z-[1] flex min-w-0 flex-1 flex-col gap-[7px]">
        <div className="flex items-baseline justify-between">
          <span className="text-[14px] font-semibold text-text transition-colors duration-200 group-hover:text-link">
            {skill.name}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-[12px] text-muted transition-colors duration-200 group-hover:text-link">
            {skill.percent}%
          </span>
        </div>
        <div
          className={
            "relative h-[7px] rounded-[4px] bg-line/60 " +
            "before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-[1.5px] before:rounded-[3px] before:content-[''] " +
            "before:bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,color-mix(in_srgb,var(--link-color)_5%,transparent)_10px,color-mix(in_srgb,var(--link-color)_5%,transparent)_12px)]"
          }
        >
          <div
            className="skill-runway-fill absolute left-0 top-0 h-[7px] w-(--skill-pct) rounded-[4px] bg-fill"
            style={fillStyle}
            data-percent={skill.percent}
          />
        </div>
      </div>
    </div>
  );
}
