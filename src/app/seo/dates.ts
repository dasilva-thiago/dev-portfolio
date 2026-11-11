// Imported by the sitemap (loaded from react-router.config.ts before the `~/` alias exists): keep imports relative.
import { EXPERIENCE_UPDATED_AT } from "../../entities/experience/model/paths";
import { HOME_UPDATED_AT as PROJECTS_UPDATED_AT } from "../../entities/project/model/slugs";

// The home page shows the projects and the current role (About section), so it changes when either does.
export const HOME_UPDATED_AT = [PROJECTS_UPDATED_AT, EXPERIENCE_UPDATED_AT].sort().at(-1) ?? PROJECTS_UPDATED_AT;
