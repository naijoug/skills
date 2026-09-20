# Repository Instructions

## Task-specific guidance

- For skill authoring or routing changes, use `docs/skill-authoring.md`; read only the target skill and references governing the changed behavior.
- For skill/tooling verification, run `bash apps/scripts/skills-quality-check`. It uses disposable local fixtures and needs no network or production access. Run affected checks again after fixing failures caused by the change.
- For application changes, use `apps/docs/skills-manager.md` for package checks and runtime boundaries. Broaden verification only when the change or observed failures justify it.
- Complete authorized local edits and validation without an extra confirmation step. If a skill rule causes a pause, cite that rule and identify the missing decision or authority.

## Skills Manager Preview Lifecycle

- Use the same preview entrypoint for each run instead of launching ad-hoc Vite or Tauri commands.
- For one-command local startup and preview lifecycle management, prefer `./scripts/start-local.sh [desktop|web|stop|status]` from the repository root.
- For the Skills Manager browser preview, prefer `./scripts/preview.sh start` or `./scripts/start-local.sh web` from the repository root.
- For isolated temporary Tauri debugging, use `./scripts/debug.sh`; for normal desktop startup, use `./scripts/start-local.sh desktop`.
- Before starting a new Skills Manager preview, check for existing Skills Manager API, web, Vite, dev-script, and desktop processes from this repository and stop them first.
- Do not leave multiple `skills-manager-dev`, `skills-manager-api`, `skills-manager-web`, Vite preview, Tauri dev, or `skills-manager-desktop` instances running at the same time.
- Keep preview ports stable within a task. Use the script defaults when available; if a port is occupied by another project, pick one alternate port for the task, reuse it consistently, and mention it in the handoff.
- Do not kill unrelated projects' servers just because they use common dev ports such as `5173`, `5174`, or `5177`.
