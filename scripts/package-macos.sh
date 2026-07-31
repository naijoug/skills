#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_ROOT="$PROJECT_ROOT/apps/skills-manager-desktop"
TAURI_ROOT="$DESKTOP_ROOT/src-tauri"
SIGNING_IDENTITY="${APPLE_SIGNING_IDENTITY:-Developer ID Application: Honoululu Inc. (N7VU72TZB8)}"

if ! security find-identity -v -p codesigning | rg -F "\"$SIGNING_IDENTITY\"" >/dev/null; then
  echo "Required macOS signing identity is not available in the Keychain: $SIGNING_IDENTITY" >&2
  echo "Import the matching encrypted .p12 and retry." >&2
  exit 1
fi

(
  cd "$DESKTOP_ROOT"
  APPLE_SIGNING_IDENTITY="$SIGNING_IDENTITY" pnpm exec tauri build --bundles dmg "$@"
)

DMG_PATH="$(find "$TAURI_ROOT/target/release/bundle/dmg" -maxdepth 1 -type f -name '*.dmg' -print | sort | tail -n 1)"
if [[ -z "$DMG_PATH" ]]; then
  echo "Tauri completed without producing a DMG." >&2
  exit 1
fi

hdiutil verify "$DMG_PATH" >/dev/null
echo "$DMG_PATH"
