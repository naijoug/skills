import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@skills-manager/ui/styles.css", replacement: fileURLToPath(new URL("../packages/skills-ui/src/styles.css", import.meta.url)) },
      { find: "@skills-manager/core", replacement: fileURLToPath(new URL("../packages/skills-core/src/index.ts", import.meta.url)) },
      { find: "@skills-manager/platform", replacement: fileURLToPath(new URL("../packages/skills-platform/src/index.ts", import.meta.url)) },
      { find: "@skills-manager/ui", replacement: fileURLToPath(new URL("../packages/skills-ui/src/index.ts", import.meta.url)) }
    ]
  },
  server: {
    port: 5174,
    strictPort: true
  },
  build: {
    outDir: "dist"
  }
});
