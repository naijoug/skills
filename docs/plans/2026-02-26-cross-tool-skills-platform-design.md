# Cross-Tool Skills Platform Design

**Date:** 2026-02-26

## Goal

Build a personal skills platform that can be reused across multiple AI coding tools (Codex, Claude Code, Amp, Trae, Antigravity, Cursor, VSCode) with a single source of truth, consistent runtime behavior, and tool-specific adapters.

## Design Summary

Use a three-layer architecture:

1. Source layer: `skills/<skill>/SKILL.md` remains the canonical human-authored skill content, with optional machine-readable metadata (`skill.yaml`) and tool-specific overrides under `agents/`.
2. Build layer: Python adapters export tool-specific rule/config/install artifacts into `dist/<tool>/`.
3. Runtime layer: Python CLI + MCP server expose a stable execution surface for "prompt + runtime" skills, with CLI fallback for tools that do not support MCP.

## Architecture

### Source Layer

- Canonical content: `skills/<skill>/SKILL.md`
- Optional metadata: `skills/<skill>/skill.yaml`
- Tool overrides: `skills/<skill>/agents/<tool>.yaml`
- References/assets remain colocated with each skill

### Build Layer

- `skills export --target <tool>` renders:
  - `dist/<tool>/rules/`
  - `dist/<tool>/config/`
  - `dist/<tool>/install/`
- Adapters share a common interface and differ only in rendering and installation output conventions.

### Runtime Layer

- CLI commands (`skills list/show/run/render/validate/doctor`)
- MCP server exposing generic tools:
  - `skills.list`
  - `skills.describe`
  - `skills.run`
  - `skills.render`
  - `skills.validate`
- Unified error model and structured results across CLI/MCP

## Compatibility Strategy

### Preferred execution path

1. MCP (when supported by the client)
2. CLI invocation (when command execution is supported)
3. Prompt-only exported rules (manual fallback)

### Tool coverage

- Codex / Claude Code: rules + CLI/MCP config snippets
- Cursor / VSCode: rule files + command/task snippets + MCP config snippets
- Amp / Trae / Antigravity: adapter-generated config/install notes with MCP-first and CLI fallback

## Data Model (MVP)

`skill.yaml` (simple YAML subset for zero-dependency parser) should include:

- `id`
- `version`
- `title`
- `summary`
- `kind` (`prompt_only` or `prompt_plus_runtime`)
- `tags`
- `triggers`
- `inputs`
- `outputs`
- `compatibility`
- `runtime` (optional)

MVP implementation should also support discovery from `SKILL.md` frontmatter when `skill.yaml` is absent.

## Safety and Operational Constraints

- Workspace path guard for runtime file access
- Structured errors with remediation hints
- `doctor` command for environment checks
- `validate` command for metadata and source integrity

## Incremental Rollout

### Phase 1 (this implementation)

- Python package scaffold
- Skill discovery + basic validation
- Multi-tool adapters and exporter
- CLI surface
- MCP server skeleton (JSON-RPC-style stdio)
- Tests and sample metadata

### Phase 2 (later)

- Richer skill runtime plugins
- Full MCP protocol compliance improvements
- Platform-specific installers and one-command bootstrap
- More metadata validation and schema evolution

