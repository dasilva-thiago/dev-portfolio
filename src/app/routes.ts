import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";
// Loaded before the `~/` alias exists: keep this import relative.
import { PROJECT_SLUGS } from "../entities/project/model/slugs";

// One route per known project (not `projects/:slug`), so an unknown slug falls through to the `*` route on the
// client too, which is exactly what the host's static 404.html was rendered from.
function localeRoutes(locale: "en" | "pt" | "es") {
  return [
    index("routes/home.tsx", { id: `home-${locale}` }),
    ...PROJECT_SLUGS.map((slug) => route(`projects/${slug}`, "routes/project.tsx", { id: `project-${locale}-${slug}` })),
  ];
}

export default [
  ...localeRoutes("en"),
  ...prefix("pt", localeRoutes("pt")),
  ...prefix("es", localeRoutes("es")),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
