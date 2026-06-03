import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: [{ find: "@skills-manager/core", replacement: fileURLToPath(new URL("../skills-core/src/index.ts", import.meta.url)) }]
  },
  test: {
    include: ["test/**/*.test.ts"]
  }
});
