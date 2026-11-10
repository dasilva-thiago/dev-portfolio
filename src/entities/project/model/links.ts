import type { ProjectSlug } from "./slugs";

// Pure data (no asset imports) so build scripts and SEO code can read it.
interface ProjectLinks {
  github?: string;
  live?: string;
  languages: string[];
}

const LINKS: Record<ProjectSlug, ProjectLinks> = {
  eduassets: {
    github: "https://github.com/dasilva-thiago/edu-assets",
    live: "https://app.eduassets.tech",
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
    languages: ["Python"],
  },
  "parkschool-alpr": {
    github: "https://github.com/FenixParkSchool/py_vision_park",
    languages: ["Python"],
  },
};

export function getProjectLinks(slug: ProjectSlug): ProjectLinks {
  return LINKS[slug];
}
