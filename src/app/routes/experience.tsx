import { ExperiencePage } from "~/pages/experience/ExperiencePage";
import { NotFoundPage } from "~/pages/not-found/NotFoundPage";
import { experienceMeta } from "../seo/meta";
import { readRootData } from "../seo/rootData";
import type { Route } from "./+types/experience";

export function meta({ matches }: Route.MetaArgs) {
  const root = readRootData(matches);
  return root ? experienceMeta(root.locale, root.resources) : [];
}

export default function ExperienceRoute() {
  return <ExperiencePage />;
}

export function ErrorBoundary() {
  return <NotFoundPage />;
}
