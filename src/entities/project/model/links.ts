import type { ProjectSlug } from "./slugs";

// Pure data (no asset imports) so build scripts and SEO code can read it.
interface ProjectLinks {
  github: string;
  live?: string;
  languages: string[];
}

const LINKS: Record<ProjectSlug, ProjectLinks> = {
  eduassets: {
    github: "https://github.com/dasilva-thiago/edu-assets",
    live: "https://eduassets.tech",
    languages: ["TypeScript", "JavaScript", "Python"],
  },
  "buenos-aires-explorer": {
    github: "https://github.com/dasilva-thiago/BuenosAiresExp",
    languages: ["C#"],
  },
  "dev-portfolio": {
    github: "https://github.com/dasilva-thiago/dev-portfolio",
    languages: ["TypeScript", "CSS"],
  },
  "aviation-safety": {
    github: "https://github.com/dasilva-thiago/aviation_safety_project",
    languages: ["Python"],
  },
  "travel-explorer": {
    github: "https://github.com/dasilva-thiago/TravelExplorer",
    languages: ["TypeScript", "JavaScript"],
  },
};

export function getProjectLinks(slug: ProjectSlug): ProjectLinks {
  return LINKS[slug];
}
