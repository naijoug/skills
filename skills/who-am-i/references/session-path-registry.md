# Session Path Registry

This registry defines where session data may be discovered and how confident each path is.

## Evidence Levels

- `official_explicit`: official docs provide concrete local path
- `official_partial`: official docs state local storage but not a full path
- `community_candidate`: pragmatic candidate path; not officially guaranteed

## Sources

### Claude Code
- Level: `official_partial`
- Docs: https://docs.anthropic.com/en/docs/claude-code/cli-reference
- Paths:
  - `~/.claude/projects/**/*.jsonl`
  - `~/.config/claude/projects/**/*.jsonl` (Linux candidate shape)

### Codex
- Level: `official_explicit`
- Docs:
  - https://developers.openai.com/codex/app/troubleshooting/
  - https://developers.openai.com/codex/cli/commands#slash-commands
- Paths:
  - `~/.codex/sessions/**/*.jsonl`
  - `~/.codex/archived_sessions/**/*.jsonl`
  - `~/.codex/history.jsonl`

### OpenClaw
- Level: `official_explicit`
- Docs: https://docs.openclaw.im/getting-started/installation
- Paths:
  - `~/.openclaw/sessions/**/*.jsonl`
  - `~/.openclaw/agents/**/*.jsonl`
  - `~/.openclaw/sessions.json`

### Cursor
- Level: `official_partial`
- Docs: https://docs.cursor.com/privacy/data-privacy
- Paths:
  - `~/.cursor/projects/**/agent-transcripts/**/*.jsonl`
  - `~/.cursor/projects/**/agent-transcripts/**/*.txt`
  - `~/Library/Application Support/Cursor/**/agent-transcripts/**/*.jsonl`

### Windsurf
- Level: `official_partial`
- Paths:
  - `~/.codeium/windsurf/**/*.jsonl`
  - `~/.windsurf/**/*.jsonl`
  - `~/Library/Application Support/Windsurf/**/*.jsonl`
  - `~/Library/Application Support/Codeium/Windsurf/**/*.jsonl`

### Antigravity
- Level: `community_candidate`
- Paths:
  - `~/Library/Application Support/Antigravity/**/*.json`
  - `~/.gemini/antigravity/**/*.json`

### ChatGPT Export
- Level: `official_explicit`
- Docs: https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data
- Paths:
  - `~/Desktop/chatgpt_history/**/conversations*.json`
  - `~/Downloads/**/conversations*.json`

## Strict Official Mode

When `--strict-official` is enabled, only `official_explicit` and `official_partial` sources are scanned. `community_candidate` paths are skipped.
