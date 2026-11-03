import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const SLUGS = ["eduassets", "buenos-aires-explorer", "dev-portfolio", "aviation-safety", "travel-explorer"];
const PREFIXES = ["", "/pt", "/es"] as const;
const ORIGIN = "https://www.dasilva-thiago.dev";

const pages = PREFIXES.flatMap((prefix) => [
  { path: prefix === "" ? "/" : prefix, kind: "home" as const, prefix },
  ...SLUGS.map((slug) => ({ path: `${prefix}/projects/${slug}`, kind: "project" as const, prefix, slug })),
]);

const hash = (script: string) => `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`;

function inlineScripts(html: string): string[] {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => !/application\/(ld\+)?json/i.test(m[1] ?? "") && (m[2] ?? "").trim() !== "")
    .map((m) => m[2] ?? "");
}

const attr = (html: string, pattern: RegExp) => pattern.exec(html)?.[1];

test.describe("per-route head", () => {
  const titles = new Set<string>();

  for (const { path, kind, prefix } of pages) {
    test(`${path}: title, description, canonical, hreflang, social tags and JSON-LD`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();

      const title = attr(html, /<title>([^<]+)<\/title>/);
      expect(title).toBeTruthy();
      titles.add(`${prefix}|${title}`);
      expect(attr(html, /<meta name="description" content="([^"]{40,})"/)).toBeTruthy();

      const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
      expect(canonical).toBe(path === "/" ? `${ORIGIN}/` : `${ORIGIN}${path}`);

      const alternates = [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => m[1]);
      expect(alternates).toEqual(["en", "pt-BR", "es", "x-default"]);

      const lang = attr(html, /<html lang="([^"]+)"/);
      expect(lang).toBe(prefix === "/pt" ? "pt-BR" : prefix === "/es" ? "es" : "en");
      expect(attr(html, /<meta property="og:locale" content="([^"]+)"/)).toBe(
        prefix === "/pt" ? "pt_BR" : prefix === "/es" ? "es_ES" : "en_US",
      );
      expect(attr(html, /<meta property="og:type" content="([^"]+)"/)).toBe(kind === "home" ? "website" : "article");
      expect(attr(html, /<meta property="og:image" content="([^"]+)"/)).toMatch(/^https:\/\/www\.dasilva-thiago\.dev\/og\//);
      expect(attr(html, /<meta name="twitter:card" content="([^"]+)"/)).toBe("summary_large_image");

      const jsonLd = attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const graph = (JSON.parse(jsonLd ?? "{}") as { "@graph": Array<{ "@type": string }> })["@graph"].map((n) => n["@type"]);
      expect(graph).toEqual(kind === "home" ? ["ProfilePage", "WebSite"] : ["SoftwareSourceCode", "BreadcrumbList"]);
    });
  }

  test("every page has a distinct title within its language", () => {
    expect(titles.size).toBe(pages.length);
  });
});

test.describe("Content-Security-Policy", () => {
  for (const { path } of pages) {
    test(`${path}: the policy hashes every inline script that is on the page`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      const csp = attr(html, /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
      expect(csp, "CSP meta tag").toBeTruthy();
      const scripts = inlineScripts(html);
      expect(scripts.length).toBeGreaterThanOrEqual(3);
      for (const script of scripts) expect(csp).toContain(hash(script));
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
      expect(html.indexOf("Content-Security-Policy")).toBeLessThan(html.indexOf("<script"));
      expect(html.indexOf("<meta charSet")).toBeLessThan(1024);
    });
  }

  async function violations(page: Page, path: string, interact?: () => Promise<void>): Promise<string[]> {
    const found: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text())) found.push(message.text());
    });
    page.on("pageerror", (error) => found.push(error.message));
    await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.fulfill({ status: 204, body: "" }));
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await interact?.();
    return found;
  }

  for (const path of ["/", "/pt", "/es/projects/travel-explorer", "/this-page-does-not-exist"]) {
    test(`${path}: loads with zero CSP violations`, async ({ page }) => {
      expect(await violations(page, path)).toEqual([]);
    });
  }

  test("the main interactions run under the policy without violations", async ({ page }) => {
    await page.route("**/api.web3forms.com/**", (route) => route.fulfill({ json: { success: true } }));
    await page.route("https://drive.google.com/**", (route) => route.fulfill({ body: "ok" }));
    const found = await violations(page, "/", async () => {
      await page.locator("#dark-toggle").click();
      await page.locator("#lang-trigger").click();
      await page.getByRole("button", { name: "Español" }).first().click();
      await page.waitForURL(/\/es$/);
      await page.locator('[data-experience="tenaris"]').scrollIntoViewIfNeeded();
      await page.locator('[data-experience="tenaris"]').click();
      await page.keyboard.press("Escape");
      await page.locator("#name").fill("Ana");
      await page.locator("#email").fill("ana@example.com");
      await page.locator("#message").fill("Hola");
      await page.locator("#contact-form button[type=submit]").click();
      await expect(page.locator("#form-feedback")).toBeVisible();
      await page.locator('[data-slug="eduassets"]').click({ position: { x: 40, y: 300 } });
      await page.waitForURL(/\/es\/projects\/eduassets$/);
    });
    expect(found).toEqual([]);
  });
});

test.describe("analytics", () => {
  test("is inactive on any host other than the production domain", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (/googletagmanager|google-analytics/.test(request.url())) requests.push(request.url());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");
  });

  test("on the production hostname it sends one page_view per route change", async ({ page }) => {
    // Serve the built site under the production hostname to exercise the bootstrap for real.
    await page.route("https://www.dasilva-thiago.dev/**", async (route) => {
      const local = new URL(route.request().url());
      const response = await route.fetch({ url: `http://localhost:4173${local.pathname}${local.search}` });
      await route.fulfill({ response });
    });
    await page.route(/googletagmanager\.com/, (route) =>
      route.fulfill({ contentType: "text/javascript", body: "window.__gtmLoaded = true;" }),
    );
    await page.addInitScript(() => {
      window.dataLayer = [];
    });
    await page.goto("https://www.dasilva-thiago.dev/");
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => (window as unknown as { __gtmLoaded?: boolean }).__gtmLoaded === true);
    const events = () =>
      page.evaluate(() =>
        (window.dataLayer ?? [])
          .map((entry) => Array.from(entry as ArrayLike<unknown>))
          .filter((entry) => entry[0] === "event" && entry[1] === "page_view")
          .map((entry) => (entry[2] as { page_path: string }).page_path),
      );
    expect(await events()).toEqual(["/"]);

    await page.locator('[data-slug="eduassets"] h3 a').click();
    await page.waitForURL(/\/projects\/eduassets$/);
    await expect.poll(events).toEqual(["/", "/projects/eduassets"]);
    // Late requests (lazy chunks) may still be in flight; without this, their failure is reported on the next test.
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
});

test.describe("host behavior", () => {
  test("unknown URLs get the real 404 page with noindex", async ({ request }) => {
    for (const path of ["/nope", "/pt/nope", "/projects/does-not-exist", "/es/projects/nope"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
      const html = await response.text();
      expect(html).toContain('<meta name="robots" content="noindex"/>');
    }
  });

  test("the 404 page renders a way back home", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await page.getByRole("link", { name: "Back to the home page" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("a trailing slash redirects to the clean URL", async ({ request }) => {
    const response = await request.get("/projects/eduassets/", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/projects/eduassets");
  });

  test("retired and fallback files are not published", async ({ request }) => {
    for (const path of ["/locales/en.json", "/locales/pt.json", "/__spa-fallback.html", "/404/index.html"]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test("robots.txt points to a sitemap that lists all 18 URLs, each of which responds 200", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://www.dasilva-thiago.dev/sitemap.xml");
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => (m[1] ?? "").replace(ORIGIN, "") || "/");
    expect(locs).toHaveLength(18);
    for (const loc of locs) expect((await request.get(loc)).status(), loc).toBe(200);
  });

  test("share images referenced by the metadata exist", async ({ request }) => {
    for (const path of ["/og/portfolio.jpg", "/images/profile.jpg", ...SLUGS.map((s) => `/og/${s}.jpg`)]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/image\//);
    }
  });
});
