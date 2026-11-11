import { expect, test } from "@playwright/test";

const SLUGS = ["eduassets", "buenos-aires-explorer", "dev-portfolio", "aviation-safety", "parkschool-alpr"];

test.describe("pre-rendered routes", () => {
  test("home responds 200 with its content in the HTML (no JavaScript needed)", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("hero-section");
    for (const slug of SLUGS) expect(html).toContain(`/projects/${slug}`);
  });

  for (const slug of SLUGS) {
    test(`/projects/${slug} is pre-rendered with its own article`, async ({ request }) => {
      const response = await request.get(`/projects/${slug}`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain("<article");
      expect(html).not.toContain("hero-section");
    });
  }

  test("/experience is pre-rendered with every role and the education list", async ({ request }) => {
    const response = await request.get("/experience");
    expect(response.status()).toBe(200);
    const html = await response.text();
    for (const id of ["seduc", "gestor-seller", "tenaris"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('id="education-title"');
    expect(html).not.toContain("hero-section");
  });

  test("unknown project slug is a 404", async ({ request }) => {
    expect((await request.get("/projects/does-not-exist")).status()).toBe(404);
  });
});

test.describe("rendering", () => {
  for (const path of ["/", "/experience", ...SLUGS.map((s) => `/projects/${s}`)]) {
    test(`${path} hydrates without console errors or warnings`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m) => {
        if (["error", "warning"].includes(m.type())) problems.push(m.text());
      });
      page.on("pageerror", (e) => problems.push(e.message));
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
    });
  }

  test("project page shows the hero image and article content", async ({ page }) => {
    await page.goto("/projects/eduassets");
    await expect(page.getByRole("heading", { level: 1, name: "eduAssets" })).toBeVisible();
    const hero = page.locator("main article img");
    await expect(hero).toBeVisible();
    expect(await hero.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
  });

  test("dev-portfolio article keeps the literal <head> text from the copy", async ({ page }) => {
    await page.goto("/projects/dev-portfolio");
    await expect(page.getByRole("heading", { level: 2, name: "Architecture" })).toBeVisible();
    await expect(page.locator("main article")).not.toContainText("vanilla JS and Vite — no frontend framework");
  });

  test("a project card opens its page and the back link returns to the projects section", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-slug="eduassets"]').click({ position: { x: 40, y: 300 } });
    await expect(page).toHaveURL(/\/projects\/eduassets$/);
    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/#projects$/);
  });

  test("project card inner links stay independent of the card link", async ({ page }) => {
    await page.goto("/");
    const github = page.locator('[data-slug="eduassets"] a[href*="github.com"]');
    await expect(github).toHaveAttribute("href", "https://github.com/dasilva-thiago/edu-assets");
    await expect(github).toHaveAttribute("target", "_blank");
  });

  test("every image has explicit dimensions and alt text", async ({ page }) => {
    await page.goto("/");
    const bad = await page.$$eval("img", (imgs) =>
      imgs.filter((i) => !i.getAttribute("width") || !i.getAttribute("height") || !i.alt).map((i) => i.src),
    );
    expect(bad).toEqual([]);
  });
});

test.describe("language flags", () => {
  for (const path of ["/", "/pt", "/es"]) {
    test(`${path}: the active flag renders at once; the others load only when the menu opens`, async ({ page }) => {
      const requested: string[] = [];
      page.on("request", (request) => {
        if (/\.svg(\?|$)/.test(request.url())) requested.push(request.url());
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const flags = page.locator("#lang-trigger span, #lang-dropdown span");
      expect(await flags.count()).toBe(4);
      const image = (index: number) => flags.nth(index).evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(await image(0)).toMatch(/^url\(/);
      const closed = await flags.evaluateAll((els) => els.slice(1).map((el) => getComputedStyle(el).backgroundImage));
      expect(closed.filter((value) => value !== "none")).toHaveLength(1);
      expect(requested.length).toBeLessThanOrEqual(1);

      await page.locator("#lang-trigger").click();
      for (const index of [1, 2, 3]) await expect.poll(() => image(index)).toMatch(/^url\(/);
    });
  }
});

test.describe("typography", () => {
  test("DM Sans (body), Syne (hero) and DM Mono (labels) are actually loaded and applied", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => ({
      body: getComputedStyle(document.body).fontFamily,
      hero: getComputedStyle(document.querySelector("h1") as Element).fontFamily,
      mono: getComputedStyle(document.querySelector("#skills p") as Element).fontFamily,
      sans: document.fonts.check('16px "DM Sans Variable"'),
      syne: document.fonts.check('16px "Syne Variable"'),
      dmMono: document.fonts.check('16px "DM Mono"'),
    }));
    expect(info.body).toMatch(/^"DM Sans Variable"/);
    expect(info.hero).toMatch(/^"Syne Variable"/);
    expect(info.mono).toMatch(/^"DM Mono"/);
    expect(info.sans && info.syne && info.dmMono).toBe(true);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")));
    expect(loaded).toEqual(expect.arrayContaining(["DM Sans Variable"]));
  });
});
