import { copyFile, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildSitemap } from "../src/app/seo/sitemap";
import { injectCsp } from "./csp";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === "assets" ? [] : htmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return nested.flat();
}

// Runs after React Router has prerendered every route into `dir` (build/client).
export async function finalizeBuild(dir: string): Promise<void> {
  // The prerendered 404 becomes the host's real 404 page; its routes must not stay reachable with a 200.
  const notFound = join(dir, "404", "index.html");
  if (await exists(notFound)) {
    await copyFile(notFound, join(dir, "404.html"));
    await rm(join(dir, "404"), { recursive: true, force: true });
    await rm(join(dir, "404.data"), { force: true });
  }

  // The SPA fallback is never wanted: unknown URLs must be a 404, not a soft-200 shell.
  await rm(join(dir, "__spa-fallback.html"), { force: true });

  for (const file of await htmlFiles(dir)) {
    await writeFile(file, injectCsp(await readFile(file, "utf8")));
  }

  await writeFile(join(dir, "sitemap.xml"), buildSitemap());
}
