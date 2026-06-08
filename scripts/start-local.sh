#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'USAGE'
Usage: ./scripts/start-local.sh [desktop|web|stop|status]

Commands:
  desktop  Start the Tauri desktop app in the foreground. This is the default.
  web      Start the browser preview in the background.
  stop     Stop Skills Manager preview/dev processes from this repository.
  status   Show current preview/dev process status.
USAGE
}

case "${1:-desktop}" in
  desktop)
    exec "${ROOT_DIR}/scripts/skills-manager-start" desktop
    ;;
  web)
    exec "${ROOT_DIR}/scripts/preview.sh" start
    ;;
  stop)
    "${ROOT_DIR}/scripts/preview.sh" stop >/dev/null 2>&1 || true
    "${ROOT_DIR}/scripts/skills-manager-start" stop >/dev/null 2>&1 || true
    echo "Skills Manager local dev stopped"
    ;;
  status)
    "${ROOT_DIR}/scripts/preview.sh" status || true
    "${ROOT_DIR}/scripts/skills-manager-start" status
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
