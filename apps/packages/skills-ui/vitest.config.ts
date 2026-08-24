import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [{ find: "@skills-manager/core", replacement: fileURLToPath(new URL("../skills-core/src/index.ts", import.meta.url)) }]
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"]
  }
});
