import { expect, test, type Page } from "@playwright/test";

const stored = (page: Page, key: string) => page.evaluate((k) => localStorage.getItem(k), key);

test.describe("language", () => {
  test("switching language navigates to the localized URL, persists, and keeps scroll", async ({ page }) => {
    await page.goto("/");
    await page.locator("#lang-trigger").click();
    await page.getByRole("button", { name: "Português" }).first().click();
    await expect(page).toHaveURL(/\/pt$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thiago da Silva");
    await expect(page.locator("#projects h2")).toHaveText("Projetos");
    expect(await stored(page, "lang")).toBe("pt");

    await page.reload();
    await expect(page).toHaveURL(/\/pt$/);
    await expect(page.locator("#projects h2")).toHaveText("Projetos");
  });

  test("a leftover section anchor does not pull the page there when the language changes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#about");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator("#lang-trigger").click();
    await page.getByRole("button", { name: "Português" }).first().click();
    await expect(page).toHaveURL(/\/pt$/);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("switching back to English is explicit and sticks even with a Portuguese browser", async ({ browser }) => {
    const context = await browser.newContext({ locale: "pt-BR" });
    const page = await context.newPage();
    await page.goto("/pt");
    await page.locator("#lang-trigger").click();
    await page.getByRole("button", { name: "English" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    expect(await stored(page, "lang")).toBe("en");
    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("a project page keeps its slug when the language changes", async ({ page }) => {
    await page.goto("/projects/eduassets");
    await page.locator("#lang-trigger").click();
    await page.getByRole("button", { name: "Español" }).first().click();
    await expect(page).toHaveURL(/\/es\/projects\/eduassets$/);
    await expect(page.getByRole("main").getByRole("link", { name: "Volver" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText("El Problema");
  });

  test("language dropdown closes with Escape and returns focus to its trigger", async ({ page }) => {
    await page.goto("/");
    await page.locator("#lang-trigger").click();
    await expect(page.locator("#lang-trigger")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator("#lang-trigger")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#lang-trigger")).toBeFocused();
  });

  for (const [browserLocale, target] of [
    ["pt-BR", "/pt"],
    ["es-ES", "/es"],
  ] as const) {
    test(`first visit with ${browserLocale} goes to ${target}`, async ({ browser }) => {
      const context = await browser.newContext({ locale: browserLocale });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "commit" });
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      expect(await stored(page, "lang")).toBeNull();
      await context.close();
    });
  }

  test("an English browser stays on the root", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/$/);
    await context.close();
  });

  test("a stored preference beats the browser language, and prefixed URLs are never redirected", async ({ browser }) => {
    const context = await browser.newContext({ locale: "pt-BR" });
    await context.addInitScript(() => localStorage.setItem("lang", "es"));
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "commit" });
    await expect(page).toHaveURL(/\/es$/);
    await page.goto("/pt");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/pt$/);
    await context.close();
  });

  test("project pages opened directly are not redirected by the browser language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "pt-BR" });
    const page = await context.newPage();
    await page.goto("/projects/eduassets");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/projects\/eduassets$/);
    await context.close();
  });
});

test.describe("legacy hash links", () => {
  test("/#projects/<slug> becomes the real project route", async ({ page }) => {
    await page.goto("/#projects/eduassets");
    await expect(page).toHaveURL(/\/projects\/eduassets$/);
    await expect(page.getByRole("heading", { level: 1, name: "eduAssets" })).toBeVisible();
  });

  test("an unknown legacy slug falls back to the projects section", async ({ page }) => {
    await page.goto("/#projects/does-not-exist");
    await expect(page).toHaveURL(/\/#projects$/);
  });

  test("a stored Portuguese preference sends legacy links to the Portuguese article", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => localStorage.setItem("lang", "pt"));
    const page = await context.newPage();
    await page.goto("/#projects/eduassets", { waitUntil: "commit" });
    await expect(page).toHaveURL(/\/pt\/projects\/eduassets$/);
    await context.close();
  });

  test("plain section anchors are left alone", async ({ page }) => {
    await page.goto("/#about");
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(/\/#about$/);
  });
});

test.describe("appearance", () => {
  test("dark toggle applies, persists, and is in place before first paint on reload", async ({ page }) => {
    await page.goto("/");
    await page.locator("#dark-toggle").click();
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
    await expect(page.locator("#dark-toggle")).toHaveAttribute("aria-pressed", "true");
    expect(await stored(page, "darkMode")).toBe("true");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#16130d");

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.classList.contains("dark-mode"));
    const early = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    expect(early).toBe("rgb(22, 19, 13)");
  });

  test("contrast is independent of dark mode and persists", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contrast-toggle").click();
    await expect(page.locator("html")).toHaveClass(/high-contrast/);
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    expect(await stored(page, "highContrast")).toBe("true");
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/high-contrast/);
  });

  test("first visit follows the system color scheme, a stored choice overrides it", async ({ browser }) => {
    const dark = await browser.newContext({ colorScheme: "dark" });
    const page = await dark.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
    await page.locator("#dark-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await dark.close();
  });

  test("a live system change applies only while there is no stored preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
    await page.locator("#dark-toggle").click();
    await page.emulateMedia({ colorScheme: "dark" });
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForTimeout(200);
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(200);
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
  });
});

test.describe("navigation", () => {
  test("the pill navbar hides after the hero and a hover zone reveals it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("nav")).toHaveCSS("opacity", "1");
    // The hover zone covers the top 70px, and the virtual mouse may start at (0, 0) depending on the platform.
    await page.mouse.move(700, 500);
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(page.locator("body")).toHaveClass(/scrolled-past-hero/);
    await expect(page.locator("nav")).toHaveCSS("opacity", "0");
    await page.mouse.move(700, 20);
    await expect(page.locator("nav")).toHaveCSS("opacity", "1");
  });

  test("project pages show the navigation permanently", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/projects/eduassets");
    await expect(page.locator("nav > div")).toBeVisible();
    await expect(page.locator("nav")).toHaveCSS("opacity", "1");
    await page.locator("nav > div").getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/#about$/);
  });

  test.describe("mobile drawer", () => {
    test.use({ viewport: { width: 390, height: 800 } });

    test("opens, locks scroll, and closes with Escape, backdrop, and link click", async ({ page }) => {
      await page.goto("/");
      const drawer = page.locator("#mobile-nav");
      const button = page.locator("#mobile-menu-btn");

      await button.click();
      await expect(drawer).toHaveJSProperty("inert", false);
      await expect(button).toHaveAttribute("aria-expanded", "true");
      expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

      await page.keyboard.press("Escape");
      await expect(drawer).toHaveJSProperty("inert", true);
      expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
      await expect(button).toBeFocused();

      await button.click();
      await page.mouse.click(20, 400);
      await expect(drawer).toHaveJSProperty("inert", true);

      await button.click();
      await drawer.getByRole("link", { name: "Skills" }).click();
      await expect(drawer).toHaveJSProperty("inert", true);
      await expect(page).toHaveURL(/#skills$/);
    });

    test("language options switch the locale and close the drawer", async ({ page }) => {
      await page.goto("/");
      await page.locator("#mobile-menu-btn").click();
      await page.locator("#mobile-nav").getByRole("button", { name: "Português" }).click();
      await expect(page).toHaveURL(/\/pt$/);
      await expect(page.locator("#mobile-nav")).toHaveJSProperty("inert", true);
    });

    test("a closed drawer is not reachable by keyboard or assistive tech", async ({ page }) => {
      await page.goto("/");
      expect(await page.locator("#mobile-nav").evaluate((el: HTMLElement) => el.inert)).toBe(true);
    });
  });
});

test.describe("experience", () => {
  test("the About section features the current role with its photos and links", async ({ page }) => {
    await page.goto("/");
    const featured = page.locator("#current-experience");
    await featured.scrollIntoViewIfNeeded();
    await expect(featured.getByRole("heading", { name: "Technical Support & IT Technician" })).toBeVisible();
    await expect(featured.getByText("Current role")).toBeVisible();
    const images = featured.locator("img");
    await expect(images).toHaveCount(4);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
    }
    await expect(featured.getByRole("link", { name: "See eduAssets" })).toHaveAttribute("href", "/projects/eduassets");
    await expect(featured.getByRole("link", { name: "See full experience" })).toHaveAttribute("href", "/experience");
  });

  test("a compact card opens its section on the experience page, and Back returns to About", async ({ page }) => {
    await page.goto("/");
    const card = page.locator('[data-experience="tenaris"]');
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page).toHaveURL(/\/experience#tenaris$/);
    const section = page.locator("article#tenaris");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "Apprentice → Laboratory Test Specimen Preparation Technician",
    );
    await expect(section.getByText("Industrial Safety Localization")).toBeVisible();
    await expect(section).toBeInViewport();
    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/#about$/);
  });

  test("the experience page lists every role, its activities and the education", async ({ page }) => {
    await page.goto("/experience");
    await expect(page.getByRole("heading", { level: 1, name: "Professional experience" })).toBeVisible();
    await expect(page.locator("main article")).toHaveCount(3);
    await expect(page.locator("main article#seduc li").first()).toContainText("Provided support for systems");
    await expect(page.locator("main article#seduc img")).toHaveCount(4);
    await expect(page.getByRole("heading", { level: 2, name: "Education" })).toBeVisible();
  });

  test("the experience page follows the locale", async ({ page }) => {
    await page.goto("/pt/experience");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experiência profissional");
    await expect(page.locator("article#seduc")).toContainText("Levantamento de Requisitos");
    await expect(page.locator("article#seduc").getByRole("link", { name: "Ver o eduAssets" })).toHaveAttribute(
      "href",
      "/pt/projects/eduassets",
    );
  });
});

test.describe("contact form", () => {
  async function fill(page: Page, values: { name?: string; email?: string; message?: string }) {
    await page.locator("#name").fill(values.name ?? "");
    await page.locator("#email").fill(values.email ?? "");
    await page.locator("#message").fill(values.message ?? "");
  }

  test("validates empty fields and email format without calling the provider", async ({ page }) => {
    let calls = 0;
    await page.route("**/api.web3forms.com/**", (route) => {
      calls += 1;
      return route.abort();
    });
    await page.goto("/");
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#form-feedback")).toHaveText("Please fill in all fields before sending.");
    await expect(page.locator("#form-feedback")).toHaveClass(/error/);

    await fill(page, { name: "Ana", email: "nope", message: "Hi" });
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#form-feedback")).toHaveText("Please enter a valid email address.");
    expect(calls).toBe(0);
  });

  test("sends the expected payload, shows loading then success, and resets the form and counter", async ({ page }) => {
    let payload: Record<string, string> | null = null;
    await page.route("**/api.web3forms.com/submit", async (route) => {
      payload = route.request().postDataJSON() as Record<string, string>;
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({ json: { success: true } });
    });
    await page.goto("/");
    await fill(page, { name: "Ana", email: "ana@example.com", message: "Hello there" });
    await expect(page.locator(".char-counter")).toHaveText("11 / 2000");
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#contact-form button[type=submit]")).toBeDisabled();
    await expect(page.locator("#contact-form button[type=submit]")).toContainText("Sending...");
    await expect(page.locator("#form-feedback")).toHaveText("Got it! I'll reply as soon as possible.");
    await expect(page.locator("#form-feedback")).toHaveClass(/success/);
    await expect(page.locator("#contact-form button[type=submit]")).toBeEnabled();
    await expect(page.locator("#message")).toHaveValue("");
    await expect(page.locator(".char-counter")).toHaveText("0 / 2000");
    expect(payload).toMatchObject({
      from_name: "Contato - Portfolio",
      subject: "Nova mensagem de Ana",
      name: "Ana",
      email: "ana@example.com",
      message: "Hello there",
    });
  });

  test("counter tiers change color classes at 1000, 1500, 1800 and 2000", async ({ page }) => {
    await page.goto("/");
    const counter = page.locator(".char-counter");
    for (const [length, tier] of [
      [1000, "1000"],
      [1500, "1500"],
      [1800, "1800"],
      [2000, "2000"],
    ] as const) {
      await page.locator("#message").fill("x".repeat(length));
      await expect(counter).toHaveAttribute("data-tier", tier);
    }
    await page.locator("#message").fill("x");
    await expect(counter).toHaveAttribute("data-tier", "none");
  });

  test("a provider failure and a network error each show their own localized message", async ({ page }) => {
    await page.goto("/pt");
    await page.route("**/api.web3forms.com/submit", (route) => route.fulfill({ json: { success: false } }));
    await fill(page, { name: "Ana", email: "ana@example.com", message: "Oi" });
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#form-feedback")).toHaveText("Falha ao enviar. Tente novamente mais tarde.");

    await page.unroute("**/api.web3forms.com/submit");
    await page.route("**/api.web3forms.com/submit", (route) => route.abort());
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#form-feedback")).toHaveText("Ocorreu um erro. Tente novamente mais tarde.");
  });

  test("a filled honeypot fakes success without any request", async ({ page }) => {
    let calls = 0;
    await page.route("**/api.web3forms.com/**", (route) => {
      calls += 1;
      return route.abort();
    });
    await page.goto("/");
    await fill(page, { name: "Bot", email: "bot@example.com", message: "spam" });
    await page.locator('input[name="_honey"]').evaluate((el: HTMLInputElement) => {
      el.value = "gotcha";
    });
    await page.locator("#contact-form button[type=submit]").click();
    await expect(page.locator("#form-feedback")).toHaveClass(/success/);
    expect(calls).toBe(0);
  });

  test("feedback is announced through a polite live region", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('#contact-form [aria-live="polite"]')).toHaveCount(1);
  });
});

test.describe("CV links", () => {
  for (const [path, target] of [
    ["/", "https://cv.dasilva-thiago.dev/en"],
    ["/pt", "https://cv.dasilva-thiago.dev/pt"],
    ["/es", "https://cv.dasilva-thiago.dev/es"],
  ] as const) {
    test(`${path} opens the matching CV in a new tab`, async ({ page, context }) => {
      await context.route("https://cv.dasilva-thiago.dev/**", (route) => route.fulfill({ body: "ok" }));
      await page.goto(path);
      await expect(page.locator("#hero-cv-icon")).toHaveAttribute("href", target);
      const [popup] = await Promise.all([page.waitForEvent("popup"), page.locator("#hero-cv-icon").click()]);
      expect(popup.url()).toBe(target);
    });
  }
});

test.describe("motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("with reduced motion nothing is hidden or transformed and the typewriter stays static", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    for (const selector of ["h1", ".hero-subtitle", ".hero-buttons", "#about", "#projects", "#contact"]) {
      const style = await page.locator(selector).first().evaluate((el: HTMLElement) => ({
        opacity: getComputedStyle(el).opacity,
        transform: getComputedStyle(el).transform,
      }));
      expect(style, selector).toEqual({ opacity: "1", transform: "none" });
    }
    const before = await page.locator("#typewriter-target").textContent();
    await page.waitForTimeout(3200);
    expect(await page.locator("#typewriter-target").textContent()).toBe(before);
    expect(before).toBe("Junior Full Stack Developer");
  });
});

test.describe("motion enabled", () => {
  test("the typewriter holds the highlighted role, then cycles to the next phrase", async ({ page }) => {
    await page.goto("/");
    const target = page.locator("#typewriter-target");
    await expect(target).toHaveText("Junior Full Stack Developer");
    await expect(target).toHaveClass(/text-link/);
    await page.waitForTimeout(3000);
    await expect(target).toHaveText("Junior Full Stack Developer");
    await expect(target).toHaveText("an IT support technician", { timeout: 15000 });
    await expect(target).not.toHaveClass(/text-link/);
  });

  test("below-the-fold sections reveal on scroll and end fully visible", async ({ page }) => {
    await page.goto("/");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(page.locator("#projects")).toHaveCSS("opacity", "1");
    await page.locator(".skills-evolving").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await expect(page.locator(".skills-evolving")).toHaveCSS("opacity", "1");
    await expect(page.locator(".skills-evolving")).toContainText("PHP");
    await expect(page.locator(".skills-evolving")).not.toContainText("%");
  });
});

test.describe("hydration is clean in every locale", () => {
  for (const path of ["/pt", "/es", "/pt/projects/eduassets", "/es/projects/parkschool-alpr"]) {
    test(`${path} logs no errors or warnings`, async ({ page }) => {
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
});

test.describe("mobile drawer focus containment", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("Tab never leaves the open drawer, and the page behind is inert until it closes", async ({ page }) => {
    await page.goto("/");
    await page.locator("#mobile-menu-btn").click();
    for (let i = 0; i < 25; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const active = document.activeElement;
        return Boolean(active?.closest("#mobile-nav") || active?.id === "mobile-menu-btn" || active === document.body);
      });
      expect(inside, `focus after ${i + 1} Tab presses`).toBe(true);
    }
    await expect(page.locator("#main-content")).toHaveJSProperty("inert", true);
    await page.keyboard.press("Escape");
    await expect(page.locator("#main-content")).toHaveJSProperty("inert", false);
  });
});

test.describe("mobile hero", () => {
  test.use({ reducedMotion: "reduce" });

  for (const [width, height] of [
    [360, 640],
    [375, 667],
    [390, 844],
  ] as const) {
    test(`${width}x${height}: the name fits on one line and the hero clears the menu button`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/pt");
      const lines = await page.locator("h1").evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
      });
      expect(lines).toBe(1);
      const menu = await page.locator("#mobile-menu-btn").boundingBox();
      const availability = await page.locator(".hero-greeting").boundingBox();
      expect(availability?.y ?? 0).toBeGreaterThanOrEqual((menu?.y ?? 0) + (menu?.height ?? 0));
    });
  }
});

test.describe("localized 404", () => {
  for (const [path, heading, lang] of [
    ["/pt/nao-existe", "Página não encontrada", "pt-BR"],
    ["/es/projects/no-existe", "Página no encontrada", "es"],
    ["/projects/does-not-exist", "Page not found", "en"],
  ] as const) {
    test(`${path} shows one 404 page in its language without hydration errors`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (m) => {
        if (["error", "warning"].includes(m.type()) && !/404 \(Not Found\)/.test(m.text())) problems.push(m.text());
      });
      page.on("pageerror", (e) => problems.push(e.message));
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      expect(problems).toEqual([]);
    });
  }
});
