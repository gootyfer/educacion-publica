import { defineConfig } from "vitest/config"

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/educacion-publica/" : "/",
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
}))
