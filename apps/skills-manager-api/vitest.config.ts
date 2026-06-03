import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@skills-manager/core", replacement: fileURLToPath(new URL("../packages/skills-core/src/index.ts", import.meta.url)) },
      {
        find: "@skills-manager/translation",
        replacement: fileURLToPath(new URL("../packages/skills-translation/src/index.ts", import.meta.url))
      }
    ]
  },
  test: {
    include: ["test/**/*.test.ts"]
  }
});
