# Debug Loom Design

## Core Abstraction

A **service × mode matrix**.

Services are debuggable targets:

- `backend`
- `web`
- `desktop`
- `admin`
- `worker`
- `mobile`

Modes are project-specific launch variants:

- `default` = plain service default, usually `./debug.sh`
- `local` = connect to local dependencies
- `dev` = connect to remote dev services
- `online` = connect to online/shared services
- `prod` = production-like config when intentionally supported
- `skip` = synthetic no-start mode

Columns are not fixed. Render the union of all service modes plus `skip`.

## Commands

```bash
./scripts/debug-loom start
./scripts/debug-loom start desktop-local
./scripts/debug-loom start backend=default web=local desktop=skip
./scripts/debug-loom stop
./scripts/debug-loom restart backend=default web=local
./scripts/debug-loom status
./scripts/debug-loom logs
./scripts/debug-loom logs web --follow
./scripts/debug-loom doctor
```

Use `start/stop`, not `up/down`.

## Interactive Start

When `start` has no profile or matrix, show a chooser. Prefer graceful fallback:

1. `gum` if available.
2. `fzf` if available.
3. Plain numbered shell prompt.

The TUI should let each service select one mode. Do not require all services to share the same mode.

## Configuration

Generate `.debug-loom.yml` when useful:

```yaml
services:
  backend:
    cwd: backend
    modes:
      default:
        command: ./debug.sh
        health:
          type: http
          url: http://localhost:8080/health
      local:
        command: ./debug.sh local
      dev:
        command: ./debug.sh dev

  web:
    cwd: frontend/web
    modes:
      local:
        command: ./debug.sh local
        health:
          type: http
          url: http://localhost:3000
      dev:
        command: ./debug.sh dev

profiles:
  web-dev:
    backend: skip
    web: dev
  web-local:
    backend: default
    web: local
  desktop-local:
    backend: default
    web: local
    desktop: local
```

Profiles are saved matrices.

## Runtime State

```text
.var/debug-loom/current/
├── matrix.json
├── profile.json
├── pids/
├── backend.log
├── web.log
├── desktop.log
├── external-logs/
└── summary.md
```

Keep current run simple. Historical run directories are optional.

## Process Ownership

Only kill:

- Processes whose pid files are under `.var/debug-loom/current/pids`.
- Processes clearly owned by generated debug scripts for the same project.
- Ports explicitly owned by the service being restarted.

Avoid broad `pkill node` or `pkill Electron`.
