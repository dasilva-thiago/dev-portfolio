import { HomePage } from "~/pages/home/HomePage";
import { homeMeta } from "../seo/meta";
import { readRootData } from "../seo/rootData";
import type { Route } from "./+types/home";

export function meta({ matches }: Route.MetaArgs) {
  const root = readRootData(matches);
  return root ? homeMeta(root.locale, root.resources) : [];
}

export default function HomeRoute() {
  return <HomePage />;
}
