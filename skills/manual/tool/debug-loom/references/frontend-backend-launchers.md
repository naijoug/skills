# Lightweight Frontend + Backend Launchers

Use this branch when the user asks for a small pair of startup scripts such as `scripts/debug-backend.sh` and `scripts/debug-web.sh`, and does not ask for centralized logs, profiles, `doctor`, or a full `debug-loom` command.

## Outcome

Produce the smallest coherent local-debug interface. A common contract is:

```bash
./scripts/debug-backend.sh
./scripts/debug-web.sh          # shared or deployed backend
./scripts/debug-web.sh local    # locally started backend
```

Keep names, modes, ports, and defaults supplied by the user. Preserve environment-variable overrides when the repository already has them.

## Discovery

Before editing:

1. Read repository and nested `AGENTS.md` files.
2. Inspect existing launchers, package scripts, frontend dev-server config, Worker/runtime config, environment examples, health endpoints, and ignored runtime-artifact directories.
3. Inspect the worktree and preserve unrelated changes.
4. Determine whether the backend is a local process, Cloudflare Worker, container, or another runtime. Do not replace the project's runtime model.
5. Identify which resources should be local or remote. A remote database request does not imply permission to deploy, migrate, delete, or modify remote resources.

## Port Lifecycle

When the user wants occupied ports cleared automatically:

- Validate each configured port is an integer from `1` through `65535`.
- Check dependencies before stopping a working service; do not kill the old listener only to discover the new launcher cannot run.
- Resolve only listeners bound to the configured port, for example with `lsof -nP -tiTCP:"$port" -sTCP:LISTEN`.
- Print the exact PID list before terminating anything.
- Send `TERM`, wait briefly while re-checking the port, then use `KILL` only for remaining listeners.
- Confirm the port is free before starting the replacement.
- Never use broad commands such as `pkill node`, `killall`, or repository-name substring matches. Never stop a process on a different port merely because it looks related.
- If the listener belongs to another user or cannot be terminated, fail with an actionable error.

Use Bash syntax compatible with the project's target machines. On macOS, do not assume Bash features newer than the system Bash unless the repository explicitly provides a newer runtime.

## Backend Launcher

- Reuse the repository's package manager and local CLI installation.
- Keep secrets in the existing ignored environment file. Generate from a committed example only when missing; never print or commit secret values.
- Derive the local public origin from the selected backend port. If an existing ignored env file may contain a stale public origin, override only that non-secret runtime value through the runtime CLI or another supported mechanism.
- Forward extra backend CLI arguments after the launcher's own arguments.

For a Cloudflare Worker:

- Prefer `wrangler dev` for the local Worker process.
- If the user explicitly wants D1 or another binding to use Cloudflare, configure that binding with `remote: true`; do not switch every binding to remote unless requested.
- Do not use `--local` when it would disable a requested remote binding.
- Do not automatically apply remote D1 migrations as part of startup.
- Use an existing named Wrangler profile when the repo has one, while allowing a project-specific environment override.
- Keep generated bindings and existing Worker configuration authoritative.

## Web Launcher

- Default to the backend mode requested by the user. If plain invocation targets a deployed backend, make `local` an explicit mode for localhost.
- Reject unknown positional modes; continue forwarding recognized dev-server flags.
- Set the frontend port explicitly and enable strict-port behavior after the script has cleared that exact port.
- Proxy the repository's actual backend paths, such as `/api`, `/media`, and `/health`.
- For HTTPS or host-routed remote targets, ensure the proxy rewrites the `Host` header when required (for Vite, this is commonly `changeOrigin: true`).
- Derive the local backend target from the backend port so the two scripts cannot silently drift.

## Configuration Alignment

When ports or origins change, inspect and update only relevant non-secret sources of truth:

- committed environment examples such as `.dev.vars.example`
- frontend proxy configuration
- backend allowed-origin configuration when requests are genuinely cross-origin
- local `PUBLIC_ORIGIN`, callback, or redirect defaults
- durable developer documentation only when it describes the changed interface

Do not edit or commit `.env`, `.dev.vars`, tokens, credentials, generated QA logs, or local runtime state. Prefer a safe runtime override for stale non-secret values in an existing ignored env file.

## Verification

At minimum:

1. Run `bash -n` on both scripts.
2. Run the repository's static check and `git diff --check` when available.
3. Confirm each default port is listening after startup.
4. If a health endpoint exists, verify the backend directly and through the web proxy.
5. Verify both web modes when the script supports local and deployed backends.
6. Exercise occupied-port replacement with a service-owned or isolated test listener; never kill an unrelated user's process for validation.
7. Stop processes started only for verification unless the user asked to keep them running.

Report the resolved ports, mode-to-target mapping, remote-resource behavior, and any checks that could not run.
