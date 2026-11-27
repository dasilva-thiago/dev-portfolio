import avCard from "~/shared/assets/img/Aviation_Safety_Project_screenshot.webp";
import baCard from "~/shared/assets/img/BAexp_screenshot.webp";
import edHero from "~/shared/assets/img/eduAssets_banner.webp";
import edCard from "~/shared/assets/img/eduAssets_banner-for-card.webp";
import devCard from "~/shared/assets/img/portfolio-preview.webp";
import alprCard from "~/shared/assets/img/parkschool-alpr.webp";
import esCadCupom from "~/shared/assets/img/eduserver-box/cad-cupom.png";
import esCadFrente from "~/shared/assets/img/eduserver-box/cad-frente.png";
import esCadMontada from "~/shared/assets/img/eduserver-box/cad-montada.png";
import esCadSemTampa from "~/shared/assets/img/eduserver-box/cad-sem-tampa.png";
import esCadTampaBerco from "~/shared/assets/img/eduserver-box/cad-tampa-berco.png";
import esFuncionando from "~/shared/assets/img/eduserver-box/funcionando.jpg";
import esMedicaoAltura from "~/shared/assets/img/eduserver-box/medicao-altura.jpg";
import esMedicaoEspessura from "~/shared/assets/img/eduserver-box/medicao-espessura.jpg";
import esPlaca from "~/shared/assets/img/eduserver-box/placa.jpg";
import esPortas from "~/shared/assets/img/eduserver-box/portas.jpg";
import esRfid from "~/shared/assets/img/eduserver-box/rfid.jpg";
import esSsdHub from "~/shared/assets/img/eduserver-box/ssd-e-hub.jpg";
import esTela from "~/shared/assets/img/eduserver-box/tela.jpg";
import esHero from "~/shared/assets/img/eduserver-box-hero.webp";
import { getProjectLinks } from "./links";
import type { ProjectSlug } from "./slugs";

export interface ImageAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

// `render`: a CAD render with a transparent background, shown on a dark panel.
// `cardPosition`: object-position class for the card slide, when the subject is off-center.
export interface GalleryImage extends ImageAsset {
  readonly render?: boolean;
  readonly cardPosition?: string;
}

export interface Project {
  readonly slug: ProjectSlug;
  readonly order: number;
  readonly variant: "featured" | "secondary" | "compact";
  readonly cardImage: ImageAsset;
  // "contain" keeps a very wide screenshot whole in the card instead of cropping it.
  readonly cardFit?: "cover" | "contain";
  readonly heroImage: ImageAsset;
  readonly tech: readonly string[];
  readonly links: ReturnType<typeof getProjectLinks>;
  // Image groups shown at the end of the project page; group g, image i takes its heading, alt text and caption
  // from `article.galleries[g]` in each locale. Portrait images sit two per row, landscape ones take the full row.
  readonly galleries?: readonly (readonly GalleryImage[])[];
  // When set, the card cycles through these gallery images ([group, image]) instead of showing `cardImage`.
  readonly cardSlides?: readonly (readonly [number, number])[];
}

const WIDE = { width: 2000, height: 900 };
const TALL = { width: 900, height: 2000 };
const RENDER = { width: 2000, height: 1333, render: true };

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
    slug: "eduserver-box",
    order: 2,
    variant: "secondary",
    cardImage: { src: esHero, width: 1600, height: 900 },
    heroImage: { src: esHero, width: 1600, height: 900 },
    tech: ["Autodesk Fusion", "3D printing (FDM)", "Arduino Nano", "RFID"],
    links: getProjectLinks("eduserver-box"),
    galleries: [
      [
        { src: esPlaca, ...WIDE },
        { src: esPortas, ...WIDE },
        { src: esMedicaoEspessura, ...WIDE },
        { src: esMedicaoAltura, ...TALL },
        { src: esSsdHub, ...TALL },
        { src: esFuncionando, ...WIDE, cardPosition: "object-[80%_50%]" },
        { src: esRfid, ...TALL },
        { src: esTela, ...TALL },
      ],
      [
        { src: esCadMontada, ...RENDER },
        { src: esCadFrente, ...RENDER },
        { src: esCadSemTampa, ...RENDER },
        { src: esCadTampaBerco, ...RENDER },
        { src: esCadCupom, ...RENDER },
      ],
    ],
    cardSlides: [
      [1, 0],
      [0, 0],
      [0, 5],
      [1, 2],
      [0, 2],
      [1, 3],
    ],
  },
  {
    slug: "buenos-aires-explorer",
    order: 3,
    variant: "compact",
    cardFit: "contain",
    cardImage: { src: baCard, width: 1277, height: 488 },
    heroImage: { src: baCard, width: 1277, height: 488 },
    tech: ["C#", ".NET 10", "Windows Forms", "Entity Framework Core", "SQLite", "WebView2", "Leaflet.js", "QuestPDF", "Nominatim", "Wikimedia"],
    links: getProjectLinks("buenos-aires-explorer"),
  },
  {
    slug: "dev-portfolio",
    order: 4,
    variant: "compact",
    cardImage: { src: devCard, width: 1280, height: 640 },
    heroImage: { src: devCard, width: 1280, height: 640 },
    tech: ["React", "TypeScript", "Tailwind CSS", "React Router", "Vite"],
    links: getProjectLinks("dev-portfolio"),
  },
  {
    slug: "aviation-safety",
    order: 5,
    variant: "compact",
    cardImage: { src: avCard, width: 1077, height: 460 },
    heroImage: { src: avCard, width: 1077, height: 460 },
    tech: ["Python", "Power BI", "Pandas"],
    links: getProjectLinks("aviation-safety"),
  },
  {
    slug: "parkschool-alpr",
    order: 6,
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
