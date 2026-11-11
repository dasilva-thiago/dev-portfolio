const CHIP =
  "cursor-default border border-l-2 border-line border-l-accent bg-page px-3 py-[3px] font-[family-name:var(--font-mono)] text-[13px] font-normal tracking-[0.05em]";

export function ExperienceTags({ tags, className = "" }: { tags: readonly string[]; className?: string }) {
  return (
    <ul className={`flex list-none flex-wrap gap-2 p-0 ${className}`}>
      {tags.map((tag) => (
        <li key={tag} className={CHIP}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
