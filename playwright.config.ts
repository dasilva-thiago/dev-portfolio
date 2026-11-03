import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "node tests/serve-static.mjs build/client 4173",
    url: "http://localhost:4173",
    // Locally an already-running server on :4173 is reused; CI always starts a fresh one.
    reuseExistingServer: !process.env.CI,
  },
});
