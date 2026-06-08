#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${SKILLS_MANAGER_DEBUG_PORT:-${PORT:-15191}}"
HOST="${SKILLS_MANAGER_DEBUG_HOST:-${HOST:-127.0.0.1}}"

kill_port() {
  local port="$1"
  local pids

  pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
  if [[ -z "${pids}" ]]; then
    return 0
  fi

  echo "Killing process(es) on port ${port}: ${pids}"
  kill ${pids} 2>/dev/null || true

  for _ in {1..20}; do
    if [[ -z "$(lsof -ti "tcp:${port}" 2>/dev/null || true)" ]]; then
      return 0
    fi
    sleep 0.1
  done

  pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "Force killing process(es) on port ${port}: ${pids}"
    kill -9 ${pids} 2>/dev/null || true
  fi
}

kill_port "${PORT}"

cd "${ROOT_DIR}/apps/skills-manager-desktop"
export SKILLS_MANAGER_DESKTOP_PORT="${PORT}"
export SKILLS_MANAGER_DESKTOP_HOST="${HOST}"

TAURI_CONFIG="$(
  node -e "const host = process.env.SKILLS_MANAGER_DESKTOP_HOST || '127.0.0.1'; const port = process.env.SKILLS_MANAGER_DESKTOP_PORT || '15191'; console.log(JSON.stringify({ build: { beforeDevCommand: 'SKILLS_MANAGER_DESKTOP_PORT=' + port + ' pnpm dev -- --host ' + host + ' --port ' + port + ' --strictPort', devUrl: 'http://' + host + ':' + port } }));"
)"

echo "Starting Skills Manager desktop debug app at http://${HOST}:${PORT}/"
exec pnpm exec tauri dev --config "${TAURI_CONFIG}"
