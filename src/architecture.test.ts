import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";

// Higher layers may import lower ones; never the reverse (plan section 4.2).
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"] as const;
const SLICED = new Set(["pages", "widgets", "features", "entities"]);
const SRC = resolve(__dirname);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

function specifiers(source: string): string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
    if (match[1]) found.push(match[1]);
  }
  return found;
}

function targetOf(file: string, specifier: string): string | null {
  if (specifier.startsWith("~/")) return resolve(SRC, specifier.slice(2));
  if (specifier.startsWith(".")) return resolve(dirname(file), specifier);
  return null;
}

function locate(absolute: string): { layer: (typeof LAYERS)[number]; slice: string | undefined } | null {
  const [layer, slice] = relative(SRC, absolute).split(sep);
  const known = LAYERS.find((candidate) => candidate === layer);
  return known ? { layer: known, slice } : null;
}

describe("architecture boundaries", () => {
  const violations: string[] = [];

  for (const layer of LAYERS) {
    const dir = join(SRC, layer);
    for (const file of walk(dir)) {
      const from = locate(file);
      if (!from) continue;
      for (const specifier of specifiers(readFileSync(file, "utf8"))) {
        const absolute = targetOf(file, specifier);
        const to = absolute ? locate(absolute) : null;
        if (!to) continue;
        const where = `${relative(SRC, file)} -> ${specifier}`;
        if (LAYERS.indexOf(to.layer) < LAYERS.indexOf(from.layer)) {
          violations.push(`${where} (lower layer imports a higher layer)`);
        } else if (to.layer === from.layer && SLICED.has(from.layer) && to.slice !== from.slice) {
          violations.push(`${where} (slices of the same layer must not import each other)`);
        }
      }
    }
  }

  it("has no upward or cross-slice imports", () => {
    expect(violations).toEqual([]);
  });

  it("covers every layer directory", () => {
    for (const layer of LAYERS) {
      expect(walk(join(SRC, layer)).length).toBeGreaterThan(0);
    }
  });

  it("keeps innerHTML out of components", () => {
    const offenders = LAYERS.flatMap((layer) => walk(join(SRC, layer)))
      .filter((file) => /innerHTML/i.test(readFileSync(file, "utf8")))
      .map((file) => relative(SRC, file).split(sep).join("/"));
    // The only allowed use is the synchronous pre-paint script in the root document.
    expect(offenders).toEqual(["app/root.tsx"]);
  });
});
