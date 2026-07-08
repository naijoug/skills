import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "@skills-manager/core", replacement: fromRoot("./packages/skills-core/src/index.ts") },
      { find: "@skills-manager/platform", replacement: fromRoot("./packages/skills-platform/src/index.ts") },
      { find: "@skills-manager/ui", replacement: fromRoot("./packages/skills-ui/src/index.ts") },
      { find: "@skills-manager/installers", replacement: fromRoot("./packages/skills-installers/src/index.ts") },
      { find: "@skills-manager/translation", replacement: fromRoot("./packages/skills-translation/src/index.ts") }
    ]
  },
  test: {
    environment: "node",
    include: ["packages/**/test/**/*.test.ts", "skills-manager-api/test/**/*.test.ts"]
  }
});
