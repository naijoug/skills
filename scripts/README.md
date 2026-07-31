# Skills Manager Scripts

This directory contains local startup, preview, and debugging scripts. Prefer
`start-local.sh` for normal local runs; it stops previous Skills Manager
preview/desktop dev processes before starting a new one, so Vite does not drift
to alternate ports with multiple previews open.

Run commands from the repository root.

## Recommended Startup

```bash
cd apps
pnpm install
cd ..
./scripts/start-local.sh
```

`start-local.sh` starts the Tauri desktop app by default, using
`http://127.0.0.1:5191` as the desktop dev URL.

Available commands:

```bash
./scripts/start-local.sh desktop   # Start the Tauri desktop app. This is the default.
./scripts/start-local.sh web       # Start the browser preview.
./scripts/start-local.sh status    # Show current preview/desktop dev status.
./scripts/start-local.sh stop      # Stop preview/desktop dev processes from this repository.
```

## Browser Preview

```bash
./scripts/preview.sh start
```

Default addresses:

```text
Web: http://127.0.0.1:5173/
API: http://127.0.0.1:8787
```

Available commands:

```bash
./scripts/preview.sh start     # Start preview, stopping old preview/dev processes first.
./scripts/preview.sh restart   # Same as start.
./scripts/preview.sh status    # Show preview status.
./scripts/preview.sh stop      # Stop preview.
```

Default configuration:

```text
Web port: 5173
API port: 8787
PID:      /tmp/skills-manager-preview.pid
Log:      /tmp/skills-manager-preview.log
API log:  /tmp/skills-manager-api.log
Web log:  /tmp/skills-manager-web.log
```

Override ports and logs with environment variables:

```bash
SKILLS_MANAGER_WEB_PORT=5174 ./scripts/preview.sh start
SKILLS_MANAGER_API_PORT=8788 ./scripts/preview.sh start
SKILLS_MANAGER_WEB_HOST=0.0.0.0 ./scripts/preview.sh start
SKILLS_MANAGER_PREVIEW_LOG=/tmp/my-skills-manager-preview.log ./scripts/preview.sh start
```

Do not change ports unless you explicitly need a temporary alternate. Normal
development and verification should use stable ports.

## Debug Entrypoint

```bash
./scripts/debug.sh
```

`debug.sh` starts a temporary Tauri debug run on an isolated desktop port. The
default port is `15191`.

Override it when needed:

```bash
PORT=15192 HOST=127.0.0.1 ./scripts/debug.sh
```

Use `debug.sh` only when you need an isolated debug port or temporary Tauri dev
URL override. For normal local startup, use `./scripts/start-local.sh`.

## Signed macOS DMG

```bash
./scripts/package-macos.sh
```

The packaging script requires the configured Developer ID Application identity
in the macOS Keychain, builds an Apple Silicon DMG, signs both the app and disk
image, and verifies the image checksum. Public certificate metadata and setup
notes are stored in
`apps/skills-manager-desktop/src-tauri/certificates/README.md`.

Notarization is automatic when the supported Apple notarization environment
variables are available. Without those credentials, the output is Developer ID
signed but not notarized.

## Lower-Level Entrypoints

These scripts are kept for direct local debugging and are used by the higher
level entrypoints:

- `./scripts/skills-manager-start` starts/stops/statuses Skills Manager previews.
- `./scripts/skills-manager-desktop` starts the Tauri desktop app.
- `./scripts/skills-manager-dev` starts the API and web app together.
- `./scripts/skills-manager-api` starts only the API.
- `./scripts/skills-manager-web` starts only the web app.

## Usage Rules

- Stop the previous UI preview before starting a new one.
- Prefer `./scripts/start-local.sh` for normal local runs.
- Prefer `./scripts/start-local.sh web` or `./scripts/preview.sh start` for browser preview.
- Run `./scripts/start-local.sh stop` after verification.
- Keep smoke and check scripts under `apps/scripts/`, not in this directory.
