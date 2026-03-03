# Privacy and Redaction

## Local-only Guarantee

- All scanning, parsing, analysis, and rendering happen on local machine.
- No network upload is performed by these scripts.
- Outputs are written to `~/.who-am-i/output/`.

## Authorization Model

1. Level-1 authorization: read-only scan under HOME.
2. Level-2 authorization: sensitive folders (`Desktop`, `Downloads`, `Library`).
3. Level-3 authorization: per-tool source toggles.

## Redaction Rules

Applied before any snippet enters Markdown or HTML output:

- Email:
  - Pattern: `user@example.com`
  - Replacement: `[REDACTED_EMAIL]`
- Phone (international/simple local forms):
  - Replacement: `[REDACTED_PHONE]`
- Token/secret-like strings (`api_key`, `token`, `sk-...`):
  - Replacement: `[REDACTED_SECRET]`
- Absolute user path:
  - Replacement: `~/<redacted_path>`
- Human names from home path:
  - Replacement: `<user>` in path segments

## Evidence Handling

- Keep evidence snippets short.
- Store path + source metadata with snippets.
- Never include raw full transcript payload in generated report.
