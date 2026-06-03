import React from "react";
import { createRoot } from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { createDesktopAdapter, mockAdapter } from "@skills-manager/platform";
import { SkillsManagerApp } from "@skills-manager/ui";
import "@skills-manager/ui/styles.css";

const adapter = "__TAURI_INTERNALS__" in window ? createDesktopAdapter({ invoke }) : mockAdapter;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SkillsManagerApp adapter={adapter} repositorySources={[{ id: "desktop-local", label: "Desktop local cache" }]} />
  </React.StrictMode>
);
