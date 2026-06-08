import React from "react";
import { createRoot } from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createDesktopAdapter, mockAdapter } from "@skills-manager/platform";
import { SkillsManagerApp } from "@skills-manager/ui";
import "@skills-manager/ui/styles.css";

const isTauriRuntime = "__TAURI_INTERNALS__" in window;
const adapter = isTauriRuntime ? createDesktopAdapter({ invoke }) : mockAdapter;

if (isTauriRuntime) {
  installWindowDragFallback();
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SkillsManagerApp adapter={adapter} repositorySources={[{ id: "desktop-local", label: "Desktop local cache" }]} />
  </React.StrictMode>
);

function installWindowDragFallback(): void {
  const appWindow = getCurrentWindow();

  document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest("button, input, select, textarea, a, [contenteditable='true'], [data-tauri-drag-region='false']")) {
      return;
    }
    if (!target.closest("[data-tauri-drag-region]")) {
      return;
    }

    event.preventDefault();
    void appWindow.startDragging().catch(() => undefined);
  });
}
