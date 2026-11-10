import {
  faBuilding,
  faFlask,
  faHeadset,
  faTools,
  faUserGraduate,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export const EXPERIENCE_IDS = ["univesp", "senac", "seduc", "gestor-seller", "tenaris"] as const;
export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

export interface ExperienceEntry {
  readonly id: ExperienceId;
  readonly group: "education" | "experience";
  readonly icon: IconDefinition;
  readonly expandable: boolean;
}

export const EXPERIENCE: readonly ExperienceEntry[] = [
  { id: "univesp", group: "education", icon: faUserGraduate, expandable: false },
  { id: "senac", group: "education", icon: faTools, expandable: false },
  { id: "seduc", group: "experience", icon: faBuilding, expandable: true },
  { id: "gestor-seller", group: "experience", icon: faHeadset, expandable: true },
  { id: "tenaris", group: "experience", icon: faFlask, expandable: true },
];
