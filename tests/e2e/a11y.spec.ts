import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const themes = {
  light: { dark: "false", contrast: "false" },
  dark: { dark: "true", contrast: "false" },
  "high-contrast": { dark: "false", contrast: "true" },
} as const;

const pages = ["/", "/projects/eduassets", "/pt", "/es/projects/parkschool-alpr"];

for (const [theme, flags] of Object.entries(themes)) {
  for (const path of pages) {
    test(`axe: ${path} in ${theme} has no serious or critical violations`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
      await context.addInitScript(
        ([dark, contrast]) => {
          localStorage.setItem("darkMode", dark as string);
          localStorage.setItem("highContrast", contrast as string);
        },
        [flags.dark, flags.contrast],
      );
      const page = await context.newPage();
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const blocking = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
      expect(blocking).toEqual([]);
      await context.close();
    });
  }
}

test("axe: the open experience dialog has no serious or critical violations", async ({ page }) => {
  // The animation chunk loads when the browser is idle; wait for it so no section fade starts mid-test.
  const motionLoaded = page.waitForResponse((response) => /ScrollTrigger-.*.js/.test(response.url()));
  await page.goto("/");
  await motionLoaded;
  await page.waitForLoadState("networkidle");
  const card = page.locator('[data-experience="tenaris"]');
  await card.scrollIntoViewIfNeeded();
  // The section fades in on scroll; axe adds up ancestor opacity, so wait until that finishes.
  await expect(page.locator("#about")).toHaveCSS("opacity", "1");
  await expect(page.locator("#about")).not.toHaveAttribute("style", /opacity/);
  await card.click();
  // axe measures contrast on painted colors, so let the open transition finish first.
  await expect(page.getByRole("dialog")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("dialog").locator("> div")).toHaveCSS("transform", "none");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  expect(blocking).toEqual([]);
});
