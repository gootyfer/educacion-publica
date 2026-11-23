import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e-production",
  workers: 1,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "off",
  },
  webServer: {
    command: "npm run preview:pages",
    url: "http://127.0.0.1:4174/educacion-publica/",
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "chromium-pwa",
      use: { browserName: "chromium" },
    },
  ],
})
