import {
  faBuilding,
  faFlask,
  faHeadset,
  faTools,
  faUserGraduate,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import eduAssetsBanner from "~/shared/assets/img/eduAssets_banner.webp";
import safetyLabels from "~/shared/assets/img/safety_labels_en_pt.webp";
import seducCart from "~/shared/assets/img/seduc/seduc-cart.webp";
import seducRfid from "~/shared/assets/img/seduc/seduc-rfid.webp";
import seducSystem from "~/shared/assets/img/seduc/seduc-system.webp";

export const EXPERIENCE_IDS = ["univesp", "senac", "seduc", "gestor-seller", "tenaris"] as const;
export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

// Entries with their own section on the experience page (education stays a compact list there).
export type WorkExperienceId = "seduc" | "gestor-seller" | "tenaris";

export interface ExperienceEntry {
  readonly id: ExperienceId;
  readonly group: "education" | "experience";
  readonly icon: IconDefinition;
}

export const EXPERIENCE: readonly ExperienceEntry[] = [
  { id: "univesp", group: "education", icon: faUserGraduate },
  { id: "senac", group: "education", icon: faTools },
  { id: "seduc", group: "experience", icon: faBuilding },
  { id: "gestor-seller", group: "experience", icon: faHeadset },
  { id: "tenaris", group: "experience", icon: faFlask },
];

// The current role, highlighted in the About section and first on the experience page.
export const FEATURED_EXPERIENCE: WorkExperienceId = "seduc";

export const isWorkExperience = (entry: ExperienceEntry): entry is ExperienceEntry & { id: WorkExperienceId } =>
  entry.group === "experience";

export interface GalleryImage {
  readonly key: "rfid" | "cart" | "system";
  readonly src: string;
  readonly width: number;
  readonly height: number;
  // Tailwind class choosing where the portrait photo is cropped in its shorter box.
  readonly position: string;
}

// Photos taken at the school (no people's faces or personal data in frame), shown with the eduAssets banner.
export const SEDUC_GALLERY = {
  banner: { src: eduAssetsBanner, width: 1920, height: 1080 },
  photos: [
    { key: "system", src: seducSystem, width: 480, height: 1066, position: "object-[50%_45%]" },
    { key: "rfid", src: seducRfid, width: 480, height: 1066, position: "object-[50%_62%]" },
    { key: "cart", src: seducCart, width: 480, height: 1066, position: "object-[50%_55%]" },
  ],
} as const satisfies { banner: { src: string; width: number; height: number }; photos: readonly GalleryImage[] };

export const SAFETY_LABELS_IMAGE = { src: safetyLabels, width: 1500, height: 735 } as const;
