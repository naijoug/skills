#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${SKILLS_MANAGER_API_PORT:-8787}"
WEB_PORT="${SKILLS_MANAGER_WEB_PORT:-5173}"
HOST="${SKILLS_MANAGER_WEB_HOST:-127.0.0.1}"
PID_FILE="${SKILLS_MANAGER_PREVIEW_PID_FILE:-/tmp/skills-manager-preview.pid}"
LOG_FILE="${SKILLS_MANAGER_PREVIEW_LOG:-/tmp/skills-manager-preview.log}"
API_LOG="${SKILLS_MANAGER_API_LOG:-/tmp/skills-manager-api.log}"
WEB_LOG="${SKILLS_MANAGER_WEB_LOG:-/tmp/skills-manager-web.log}"

stop_pid() {
  local pid="$1"

  if [[ -z "${pid}" ]] || ! kill -0 "${pid}" 2>/dev/null; then
    return
  fi

  kill "${pid}" 2>/dev/null || true

  for _ in {1..30}; do
    if ! kill -0 "${pid}" 2>/dev/null; then
      return
    fi
    sleep 0.1
  done

  kill -9 "${pid}" 2>/dev/null || true
}

stop_existing() {
  if [[ -f "${PID_FILE}" ]]; then
    stop_pid "$(cat "${PID_FILE}")"
    rm -f "${PID_FILE}"
  fi

  "${ROOT_DIR}/scripts/skills-manager-start" stop >/dev/null 2>&1 || true
}

wait_for_url() {
  local url="$1"
  local name="$2"
  local log_file="$3"

  for _ in {1..80}; do
    if curl -L -sS --fail "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done

  echo "Skills Manager ${name} failed to start. Log: ${log_file}" >&2
  sed -n '1,160p' "${log_file}" >&2 2>/dev/null || true
  return 1
}

start_preview() {
  stop_existing
  : > "${LOG_FILE}"
  : > "${API_LOG}"
  : > "${WEB_LOG}"

  (
    cd "${ROOT_DIR}"
    SKILLS_MANAGER_API_PORT="${API_PORT}" \
      SKILLS_MANAGER_WEB_PORT="${WEB_PORT}" \
      SKILLS_MANAGER_WEB_HOST="${HOST}" \
      SKILLS_MANAGER_API_LOG="${API_LOG}" \
      SKILLS_MANAGER_WEB_LOG="${WEB_LOG}" \
      ./scripts/skills-manager-dev >"${LOG_FILE}" 2>&1 &
    echo "$!" > "${PID_FILE}"
  )

  if ! wait_for_url "http://127.0.0.1:${API_PORT}/health" "API" "${API_LOG}"; then
    stop_existing
    exit 1
  fi
  if ! wait_for_url "http://${HOST}:${WEB_PORT}" "Web" "${WEB_LOG}"; then
    stop_existing
    exit 1
  fi

  echo "Skills Manager preview started"
  echo "API: http://127.0.0.1:${API_PORT}"
  echo "Web: http://${HOST}:${WEB_PORT}"
  echo "PID: $(cat "${PID_FILE}")"
  echo "Log: ${LOG_FILE}"
  echo "API log: ${API_LOG}"
  echo "Web log: ${WEB_LOG}"
}

case "${1:-start}" in
  start|restart)
    start_preview
    ;;
  stop)
    stop_existing
    echo "Skills Manager preview stopped"
    ;;
  status)
    if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
      echo "Skills Manager preview running: PID $(cat "${PID_FILE}")"
      echo "API: http://127.0.0.1:${API_PORT}"
      echo "Web: http://${HOST}:${WEB_PORT}"
    else
      echo "Skills Manager preview is not running"
      exit 1
    fi
    ;;
  -h|--help|help)
    echo "Usage: ./scripts/preview.sh [start|restart|stop|status]"
    ;;
  *)
    echo "Usage: ./scripts/preview.sh [start|restart|stop|status]" >&2
    exit 2
    ;;
esac
