import { NotFoundPage } from "~/pages/not-found/NotFoundPage";
import { notFoundMeta } from "../seo/meta";
import { readRootData } from "../seo/rootData";
import type { Route } from "./+types/not-found";

export function meta({ matches }: Route.MetaArgs) {
  const root = readRootData(matches);
  return root ? notFoundMeta(root.resources) : [{ title: "Not found" }];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
