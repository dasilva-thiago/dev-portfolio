import type { Config } from "@react-router/dev/config";
import { join } from "node:path";
import { PROJECT_SLUGS, projectPath } from "./src/entities/project/model/slugs";
import { LOCALES } from "./src/shared/i18n/locales";
import { localizePath } from "./src/shared/i18n/path";
import { finalizeBuild } from "./scripts/postbuild";

export default {
  appDirectory: "src/app",
  ssr: false,
  prerender: [
    ...LOCALES.flatMap((locale) => [
      localizePath("/", locale),
      ...PROJECT_SLUGS.map((slug) => localizePath(projectPath(slug), locale)),
    ]),
    "/404",
  ],
  async buildEnd({ reactRouterConfig }) {
    await finalizeBuild(join(reactRouterConfig.buildDirectory, "client"));
  },
} satisfies Config;
