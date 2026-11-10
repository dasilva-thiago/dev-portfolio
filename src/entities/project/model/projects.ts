import avCard from "~/shared/assets/img/Aviation_Safety_Project_screenshot.webp";
import baCard from "~/shared/assets/img/BAexp_screenshot.webp";
import edHero from "~/shared/assets/img/eduAssets_banner.webp";
import edCard from "~/shared/assets/img/eduAssets_banner-for-card.webp";
import devCard from "~/shared/assets/img/portfolio-preview.webp";
import alprCard from "~/shared/assets/img/parkschool-alpr.webp";
import { getProjectLinks } from "./links";
import type { ProjectSlug } from "./slugs";

export interface ImageAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface Project {
  readonly slug: ProjectSlug;
  readonly order: number;
  readonly variant: "featured" | "secondary" | "compact";
  readonly cardImage: ImageAsset;
  readonly heroImage: ImageAsset;
  readonly tech: readonly string[];
  readonly links: ReturnType<typeof getProjectLinks>;
}

export const PROJECTS: readonly Project[] = [
  {
    slug: "eduassets",
    order: 1,
    variant: "featured",
    cardImage: { src: edCard, width: 600, height: 338 },
    heroImage: { src: edHero, width: 1920, height: 1080 },
    tech: [
      "TypeScript",
      "Vite",
      "CSS Custom Properties",
      "Feature-first",
      "Node.js",
      "Express 5",
      "Prisma",
      "Zod",
      "PostgreSQL",
      "Neon",
      "Cloudflare Pages",
      "Oracle Cloud",
      "Docker",
      "Nginx",
      "Python · RFID (optional)",
      "Raspberry Pi",
      "Arduino Nano",
    ],
    links: getProjectLinks("eduassets"),
  },
  {
    slug: "buenos-aires-explorer",
    order: 2,
    variant: "secondary",
    cardImage: { src: baCard, width: 1277, height: 488 },
    heroImage: { src: baCard, width: 1277, height: 488 },
    tech: ["C#", ".NET 10", "Windows Forms", "Entity Framework Core", "SQLite", "WebView2", "Leaflet.js", "QuestPDF", "Nominatim", "Wikimedia"],
    links: getProjectLinks("buenos-aires-explorer"),
  },
  {
    slug: "dev-portfolio",
    order: 3,
    variant: "compact",
    cardImage: { src: devCard, width: 1280, height: 640 },
    heroImage: { src: devCard, width: 1280, height: 640 },
    tech: ["React", "TypeScript", "Tailwind CSS", "React Router", "Vite"],
    links: getProjectLinks("dev-portfolio"),
  },
  {
    slug: "aviation-safety",
    order: 4,
    variant: "compact",
    cardImage: { src: avCard, width: 1077, height: 460 },
    heroImage: { src: avCard, width: 1077, height: 460 },
    tech: ["Python", "Power BI", "Pandas"],
    links: getProjectLinks("aviation-safety"),
  },
  {
    slug: "parkschool-alpr",
    order: 5,
    variant: "compact",
    cardImage: { src: alprCard, width: 1200, height: 675 },
    heroImage: { src: alprCard, width: 1200, height: 675 },
    tech: ["Python", "FastAPI", "OpenCV", "TensorFlow", "Keras", "Pydantic", "HTTPX", "Pytest"],
    links: getProjectLinks("parkschool-alpr"),
  },
];

export function getProject(slug: ProjectSlug): Project {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}
