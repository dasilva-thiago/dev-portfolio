import { expect, test } from "@playwright/test";

test("pre-rendered HTML carries the pre-paint theme script and content without JS", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("darkMode");
  expect(html).toContain("Junior Full Stack Developer");
});

test("hydrates without warnings and stored dark mode is applied before first paint", async ({ browser }) => {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    localStorage.setItem("darkMode", "true");
    localStorage.setItem("highContrast", "true");
  });
  const page = await ctx.newPage();
  const problems: string[] = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(e.message));
  await page.route("**/*.js", (r) => r.continue());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const classes = await page.evaluate(() => document.documentElement.className);
  expect(classes).toContain("dark-mode");
  expect(classes).toContain("high-contrast");
  await page.waitForLoadState("networkidle");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(0, 0, 0)");
  expect(problems).toEqual([]);
  await ctx.close();
});

test("design tokens resolve in light mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "See eduAssets" }).first()).toHaveCSS("background-color", "rgb(242, 176, 30)");
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(250, 246, 236)");
});
