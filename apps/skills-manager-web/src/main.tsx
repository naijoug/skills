import React from "react";
import { createRoot } from "react-dom/client";
import { createWebAdapter } from "@skills-manager/platform";
import { SkillsManagerApp } from "@skills-manager/ui";
import "@skills-manager/ui/styles.css";

const adapter = createWebAdapter({
  baseUrl: import.meta.env.VITE_SKILLS_MANAGER_API_URL ?? "http://127.0.0.1:8787"
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SkillsManagerApp adapter={adapter} />
  </React.StrictMode>
);
