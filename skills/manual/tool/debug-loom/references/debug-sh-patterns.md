# debug.sh Patterns

## Principles

- Each service normally owns its own `debug.sh`; use repo-level `scripts/debug-<service>.sh` when the user or repository already prefers that layout.
- `debug.sh` modes are project-specific.
- Preserve existing scripts; patch in place only after reading them.
- Print resolved environment at startup.
- Make failures actionable.

## Required Interface

Every generated or improved full Debug Loom `debug.sh` should support:

```bash
./debug.sh --help
./debug.sh --modes
```

`--modes` prints one mode per line:

```text
default
local
dev
```

If plain `./debug.sh` is a valid mode, expose it as `default`.

For an explicitly requested lightweight two-launcher workflow, preserve the requested interface instead of adding `--modes` or a repo-level orchestrator. Read `frontend-backend-launchers.md`.

## Common Features

- `set -euo pipefail`
- `cd "$(dirname "$0")"`
- load `.env.local` when present
- print:
  - app directory
  - selected mode
  - loaded env files
  - port(s)
  - API/web base URLs
  - log path(s)
- clean only service-owned ports/processes
- install dependencies only when stale or missing

## Mode Semantics

Do not assume every project has `local` and `dev`.

Typical meanings:

- `default`: service default, often local backend or project default
- `local`: force local dependencies
- `dev`: remote dev backend/services
- `online`: shared online service
- `prod`: production-like config; only include if the project supports it safely

## Desktop/Electron Additions

When a service is Electron desktop:

- Print main process log path.
- Clean stale Electron main and helper processes owned by the project.
- Support `DESKTOP_OPEN_DEVTOOLS=1`.
- Support `DESKTOP_VERBOSE=1`.
- Detect and repair missing native addons if deterministic.
- Preserve crash report locations in doctor output.

Example output:

```text
[debug] app dir:       /path/project/frontend/desktop
[debug] mode:          local
[debug] renderer port: 5173
[debug] api base:      http://localhost:8080/api/v1
[debug] web base:      http://localhost:3000
[debug] main log:      ~/Library/Logs/App/desktop-main.log
```

## Validation

Run:

```bash
bash -n path/to/debug.sh
./debug.sh --help
./debug.sh --modes
```

Do not run long-lived servers during script generation unless the user asked for validation.
