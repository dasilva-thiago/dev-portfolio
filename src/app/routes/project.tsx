import { useLocation } from "react-router";
import { isProjectSlug } from "~/entities/project/model/slugs";
import { NotFoundPage } from "~/pages/not-found/NotFoundPage";
import { ProjectPage } from "~/pages/project/ProjectPage";
import { notFoundMeta, projectMeta } from "../seo/meta";
import { readRootData } from "../seo/rootData";
import type { Route } from "./+types/project";

// Each known slug has its own route entry (see routes.ts); the slug is the last path segment.
const slugFromPath = (pathname: string) => pathname.split("/").filter(Boolean).pop();

export function meta({ location, matches }: Route.MetaArgs) {
  const root = readRootData(matches);
  if (!root) return [];
  const slug = slugFromPath(location.pathname);
  return isProjectSlug(slug) ? projectMeta(root.locale, slug, root.resources) : notFoundMeta(root.resources);
}

export default function ProjectRoute() {
  const slug = slugFromPath(useLocation().pathname);
  return isProjectSlug(slug) ? <ProjectPage slug={slug} /> : <NotFoundPage />;
}

export function ErrorBoundary() {
  return <NotFoundPage />;
}
