---
name: ng-tool-debug-loom
description: Use when creating or improving project debugging workflows — per-service debug.sh, multi-service local orchestration, centralized logs, health checks, and doctor diagnostics
---

# Debug Loom

## Overview

Weave a project's services and launch modes into a repeatable local debugging stack.

Core abstraction: a **service × mode matrix**. Services (warp) are debuggable targets; modes (weft) are launch variants. Each run picks one mode per service — the resulting matrix is the running stack.

| service \ mode | default | local | dev | online | prod | skip |
|----------------|---------|-------|-----|--------|------|------|
| backend        | *       | o     | o   | o      | o    | o    |
| web            | o       | *     | o   | o      | o    | o    |
| desktop        | o       | *     | o   | o      | o    | o    |

`skip` means do not start that service. Profiles are saved matrices, not a separate abstraction.

## When to Use

- Automate local debugging across backend / web / desktop / admin services.
- Generate or improve per-service `debug.sh` scripts.
- Replace manual terminal tabs with unified logs and diagnostics.
- Add a repo-level `scripts/debug-loom` with `start`, `stop`, `status`, `logs`, `doctor`.
- Define project-specific launch modes (`default`, `local`, `dev`, `online`, `prod`).
- Let AI inspect logs, patch code, restart, retest.

## When Not to Use

- Running one existing command once.
- Production deployment or runtime operations.
- The project has no repeatable local workflow and only needs high-level advice.

## Workflow

1. **Inventory** services, entry points, ports, existing `debug.sh`, health endpoints, log paths.
2. **Model** services and modes. Always include synthetic `skip`. Use `default` when plain `./debug.sh` is meaningful.
3. **Generate or improve per-service `debug.sh`** — see `references/debug-sh-patterns.md`.
4. **Generate repo-level `scripts/debug-loom`** — see `references/debug-loom-design.md`.
5. **Centralize logs and state** under `.var/debug-loom/current/`.
6. **Add doctor diagnostics** — see `references/doctor-rules.md`.
7. **Verify**: `bash -n` generated scripts, run `status` and `doctor`, start the smallest relevant matrix first.

## Naming Rules

```bash
./scripts/debug-loom start
./scripts/debug-loom stop
./scripts/debug-loom restart <profile-or-matrix>
./scripts/debug-loom status
./scripts/debug-loom logs [service] [--follow]
./scripts/debug-loom doctor
```

Prefer `start/stop` over `up/down`. Use `skip` as the no-start mode; accept aliases only if helpful (`off`, `none`, `no`).

## Reference Files

- Matrix, CLI, config, runtime state: `references/debug-loom-design.md`
- Per-service `debug.sh` patterns: `references/debug-sh-patterns.md`
- Doctor rules and log diagnosis: `references/doctor-rules.md`
- Trigger examples: `references/trigger-examples.md`

Load only the reference needed for the current task.

## Output Checklist

- [ ] Service inventory is explicit.
- [ ] Modes are project-specific, not hard-coded to `local/dev`.
- [ ] `skip` is supported.
- [ ] Existing `debug.sh` scripts are read before modification.
- [ ] Repo-level `scripts/debug-loom` can start a matrix.
- [ ] Logs are centralized under `.var/debug-loom/current/`.
- [ ] `doctor` output is profile-aware and separates noise from actionable errors.
- [ ] Generated shell scripts pass `bash -n`.
