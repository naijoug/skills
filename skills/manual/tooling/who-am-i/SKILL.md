---
name: who-am-i
description: Use when generating a local-only personal profile from software/tool inventory and AI session history, with incremental rescans and Markdown plus static web outputs
---

# Who Am I

## Overview

Build a local-only personal profile from the user's tool ecosystem and AI session history.

Core principles:
- Never upload raw data or analysis results.
- Require explicit authorization before scanning.
- Prefer official paths; label candidate paths clearly.
- First run full scan, then incremental updates via local state.

## When to Use

- User asks for "who am I" / personal technical profile.
- User wants a consolidated report from AI session history.
- User wants a shareable static profile page generated locally.

## Workflow

1. Confirm local-only execution and authorization boundaries:
- Level 1: scan HOME (read-only)
- Level 2: sensitive dirs (`Desktop`, `Downloads`, `Library`) confirmation
- Level 3: per-tool toggles

2. Run pipeline (resolve `SKILL_DIR` from the installed skill's location):
```bash
# SKILL_DIR is the directory containing this SKILL.md (resolve symlinks first)
SKILL_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
python3 "$SKILL_DIR/scripts/run_who_am_i.py" --mode full
```

3. Incremental update:
```bash
python3 "$SKILL_DIR/scripts/run_who_am_i.py" --mode incremental
```

4. Re-render only (no rescan):
```bash
python3 "$SKILL_DIR/scripts/run_who_am_i.py" --mode render-only
```

> **Note for AI agents:** When executing these scripts, first resolve the actual path of this SKILL.md (follow symlinks), then use its parent directory as `SKILL_DIR` to locate the `scripts/` folder.

## CLI Options

- `--mode full|incremental|render-only`
- `--since ISO8601`
- `--output-dir PATH`
- `--no-react`
- `--strict-official`

## Outputs

Default local outputs:
- `~/.who-am-i/config.yaml`
- `~/.who-am-i/state.json`
- `~/.who-am-i/output/<timestamp>/data/profile.json`
- `~/.who-am-i/output/<timestamp>/report.md`
- `~/.who-am-i/output/<timestamp>/native/index.html`
- `~/.who-am-i/output/<timestamp>/react-dist/index.html`

## References

- Session path policy: `references/session-path-registry.md`
- Redaction and privacy: `references/privacy-and-redaction.md`
