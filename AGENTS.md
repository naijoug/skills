# Repository Instructions

## Skills Manager Preview Lifecycle

- Use the same preview entrypoint for each run instead of launching ad-hoc Vite or Tauri commands.
- For one-command local startup and preview lifecycle management, prefer `./scripts/start-local.sh [desktop|web|stop|status]` from the repository root.
- For the Skills Manager browser preview, prefer `./scripts/preview.sh start` or `./scripts/start-local.sh web` from the repository root.
- For isolated temporary Tauri debugging, use `./scripts/debug.sh`; for normal desktop startup, use `./scripts/start-local.sh desktop`.
- Before starting a new Skills Manager preview, check for existing Skills Manager API, web, Vite, dev-script, and desktop processes from this repository and stop them first.
- Do not leave multiple `skills-manager-dev`, `skills-manager-api`, `skills-manager-web`, Vite preview, Tauri dev, or `skills-manager-desktop` instances running at the same time.
- Keep preview ports stable within a task. Use the script defaults when available; if a port is occupied by another project, pick one alternate port for the task, reuse it consistently, and mention it in the handoff.
- Do not kill unrelated projects' servers just because they use common dev ports such as `5173`, `5174`, or `5177`.
