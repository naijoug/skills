#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_ROOT="$PROJECT_ROOT/apps/skills-manager-desktop"
TAURI_ROOT="$DESKTOP_ROOT/src-tauri"
SIGNING_IDENTITY="${APPLE_SIGNING_IDENTITY:-Developer ID Application: Honoululu Inc. (N7VU72TZB8)}"
ALLOW_UNNOTARIZED=0
if [[ "${1:-}" == "--allow-unnotarized" ]]; then
  ALLOW_UNNOTARIZED=1
  shift
fi

if [[ "$ALLOW_UNNOTARIZED" != "1" ]] &&
   ! { [[ -n "${APPLE_ID:-}" && -n "${APPLE_PASSWORD:-}" && -n "${APPLE_TEAM_ID:-}" ]] ||
       [[ -n "${APPLE_API_KEY:-}" && -n "${APPLE_API_ISSUER:-}" && -n "${APPLE_API_KEY_PATH:-}" ]]; }; then
  echo "Public release requires Apple notarization credentials. Configure them in the environment." >&2
  echo "For a signed test candidate only, use --allow-unnotarized." >&2
  exit 1
fi

if ! security find-identity -v -p codesigning | rg -F "\"$SIGNING_IDENTITY\"" >/dev/null; then
  echo "Required macOS signing identity is not available in the Keychain: $SIGNING_IDENTITY" >&2
  echo "Import the matching encrypted .p12 and retry." >&2
  exit 1
fi

BUILD_MARKER="$(mktemp "${TMPDIR:-/tmp}/skills-manager-package.XXXXXX")"
trap 'rm -f "$BUILD_MARKER"' EXIT
(
  cd "$DESKTOP_ROOT"
  APPLE_SIGNING_IDENTITY="$SIGNING_IDENTITY" pnpm exec tauri build --bundles app,dmg --ci "$@"
)

DMG_PATH="$(find "$TAURI_ROOT/target/release/bundle/dmg" -maxdepth 1 -type f -name '*.dmg' -newer "$BUILD_MARKER" -print | sort | tail -n 1)"
if [[ -z "$DMG_PATH" ]]; then
  echo "Tauri completed without producing a DMG." >&2
  exit 1
fi

APP_PATH="$TAURI_ROOT/target/release/bundle/macos/Skills Manager.app"
codesign --verify --deep --strict "$APP_PATH"
codesign --verify --strict "$DMG_PATH"
hdiutil verify "$DMG_PATH" >/dev/null
python3 "$PROJECT_ROOT/apps/scripts/skills-manager-bundle-smoke" "$APP_PATH"
if [[ "$ALLOW_UNNOTARIZED" != "1" ]]; then
  xcrun stapler validate "$APP_PATH"
  spctl --assess --type execute --verbose "$APP_PATH"
else
  echo "Signed test candidate only: notarization has not been required or certified." >&2
fi
(
  cd "$(dirname "$DMG_PATH")"
  shasum -a 256 "$(basename "$DMG_PATH")" > "$(basename "$DMG_PATH").sha256"
)
echo "$DMG_PATH"
