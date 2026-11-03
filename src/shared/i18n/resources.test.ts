import { describe, expect, it } from "vitest";
import en from "./resources/en.json";
import es from "./resources/es.json";
import pt from "./resources/pt.json";

const locales = { en, pt, es } as const;

function flatten(value: unknown, prefix = ""): [string, unknown][] {
  if (Array.isArray(value)) {
    return [
      [`${prefix}.length`, value.length],
      ...value.flatMap((item, index) => flatten(item, `${prefix}[${index}]`)),
    ];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [[prefix, value]];
}

const shape = (data: unknown) =>
  flatten(data)
    .map(([key]) => key)
    .sort();

describe("locale resources", () => {
  it.each(["pt", "es"] as const)("%s has exactly the same keys and array lengths as en", (locale) => {
    expect(shape(locales[locale])).toEqual(shape(en));
  });

  it.each(["en", "pt", "es"] as const)("%s has no empty strings", (locale) => {
    const empty = flatten(locales[locale])
      .filter(([, value]) => typeof value === "string" && value.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it.each(["en", "pt", "es"] as const)("%s keeps <em> markers balanced", (locale) => {
    const unbalanced = flatten(locales[locale])
      .filter(([, value]) => typeof value === "string")
      .filter(([, value]) => {
        const text = value as string;
        return (text.match(/<em>/g) ?? []).length !== (text.match(/<\/em>/g) ?? []).length;
      })
      .map(([key]) => key);
    expect(unbalanced).toEqual([]);
  });

  it("only uses <em> where the English source does", () => {
    const emKeys = (data: unknown) =>
      flatten(data)
        .filter(([, value]) => typeof value === "string" && (value as string).includes("<em>"))
        .map(([key]) => key);
    expect(emKeys(pt)).toEqual(emKeys(en));
    expect(emKeys(es)).toEqual(emKeys(en));
  });
});
