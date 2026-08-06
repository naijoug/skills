# Skills Collection

Personal collection of AI coding skills. Skills are classified by directory under `skills/`.

## Project Structure

```text
.
├── scripts/
│   ├── start-local.sh             # Recommended local startup/lifecycle entrypoint
│   ├── preview.sh                 # Browser preview lifecycle entrypoint
│   ├── debug.sh                   # Isolated Tauri debug entrypoint
│   └── skills-manager-*           # Lower-level Skills Manager startup/debug helpers
├── apps/
│   ├── skills-manager-tui/        # Install/uninstall skills CLI, fzf TUI, trigger eval tools
│   └── scripts/                   # Skills Manager check and smoke verification scripts
└── skills/
    ├── cron/
    │   ├── daily-til/
    │   ├── daily-trending/
    │   └── weekly-retro/
    ├── auto/
    │   ├── in-english/
    │   └── skill-smith/
    └── manual/
        ├── plan/
        │   ├── create/
        │   ├── review/
        │   ├── teaching/
        │   ├── code-reading/
        │   └── test-case/
        ├── review/
        │   ├── pr/
        │   ├── api-design/
        │   ├── agent-release-gate/
        │   ├── audit-evidence-boundary/
        │   ├── bounded-probe-before-workaround/
        │   ├── error-boundary/
        │   ├── handoff-receipt/
        │   ├── monorepo-test-entrypoint-drift/
        │   ├── next-safe-command-ladder/
        │   └── refactor/
        ├── growth/
        │   ├── personal-coach/
        │   ├── engineering/
        │   └── debugging-kata/
        ├── tool/
        │   ├── ref/
        │   ├── search/
        │   ├── debug-loom/
        │   ├── openclaw/
        │   └── who-am-i/
        └── meta/
            └── example/
```

## Skill Categories

Category comes from the directory path, not `skill.yaml`:

| Category | Meaning | Typical examples |
|----------|---------|------------------|
| `skills/auto/<skill>` | Auto-injected via `inject.md`; activates always-on or on noticed conditions | `in-english`, `skill-smith` |
| `skills/cron/<skill>` | Installed normally; driven by external scheduled triggers, not manual invocation | `daily-til`, `daily-trending`, `weekly-retro` |
| `skills/manual/<group>/<skill>` | Only runs when explicitly selected or invoked via its full skill id, e.g. `/ng-plan-create` | most task skills |

Behavior:

- `auto` skills are auto-injected by `skills-linker` when they provide `inject.md` (writes into `~/.claude/CLAUDE.md` / `~/.codex/AGENTS.md`)
- `cron` skills are installed normally but intentionally not auto-injected; fire from `/cron`, `launchd`, or system `cron`
- `manual` skills are the ones exposed by `./apps/skills-manager-tui/ng` and `--with-slash-commands`
- manual subgroup comes from the second directory level under `skills/manual/`

> Note: the `global/` category was deprecated and merged into `auto/`. The script still recognizes `global` for backward compatibility, but new skills should use `auto/`.

Recommended manual subdirectories:

- `plan` for planning, mapping, and decomposition skills
- `review` for review, critique, and safe-change skills
- `growth` for practice, coaching, and retrospectives
- `tool` for local tools and service operations
- `meta` for skill-authoring or self-profile skills

## Installation

### Supported Tools

| Tool | Global | Project |
|------|--------|---------|
| Codex | `~/.codex/skills` | `{project}/.codex/skills` |
| ChatGPT (alias to Codex) | `~/.codex/skills` | `{project}/.codex/skills` |
| Claude Code | `~/.claude/skills` | `{project}/.claude/skills` |
| Amp | `~/.agents/skills` | `{project}/.agents/skills` |

### Interactive TUI (recommended)

Requires [fzf](https://github.com/junegunn/fzf).

```bash
./apps/skills-manager-tui/tui
# Or allow auto-install via Homebrew when fzf is missing
./apps/skills-manager-tui/tui --auto-install-fzf
```

TUI flow:

1. Enter a unified control panel (persistent, does not exit after one action)
2. Adjust: `action`, `target`, `policy`, `skills`
3. Select `execute now` to run
4. After execution, stay in the panel for further operations
5. Select `quit` to exit

Skills selection supports right-side `SKILL.md` preview. Install defaults to selecting all skills.

### CLI

```bash
# List supported tools
./apps/skills-manager-tui/skills-linker tools

# List available skills
./apps/skills-manager-tui/skills-linker list

# List only manual skills
./apps/skills-manager-tui/skills-linker list --category manual

# Install to Claude Code global skills
./apps/skills-manager-tui/skills-linker install --tool claude --scope global \
  pr personal-coach

# Install to project-level
./apps/skills-manager-tui/skills-linker install --tool codex --scope project --project-root .

# Uninstall
./apps/skills-manager-tui/skills-linker uninstall --tool claude --scope global pr

# Check status
./apps/skills-manager-tui/skills-linker status --tool claude --scope global
```

Options:

- `--tool NAME` — codex | chatgpt | claude | amp | custom (default: codex)
- `--scope SCOPE` — global | project (default: global)
- `--mode MODE` — symlink | copy (default: symlink)
- `--auto-install-fzf` — allow `tui` to install fzf via Homebrew when missing
- `--force` — replace conflicting targets
- `--with-slash-commands` — also install slash command wrappers for manual skills using the skill id
- `--json` — JSON output

### Slash Commands

`--with-slash-commands` writes one wrapper file per `manual` skill into the
agent's slash command directory, so you can trigger the skill by typing
the skill id, for example `/ng-plan-create` or `/ng-tool-ref`, in the chat:

| Tool | Global | Project |
|------|--------|---------|
| Claude Code | `~/.claude/commands/<skill-id>.md` | `{project}/.claude/commands/<skill-id>.md` |
| Codex / ChatGPT | `~/.codex/prompts/<skill-id>.md` | `{project}/.codex/prompts/<skill-id>.md` |

Each wrapper file contains a marker comment so the linker can refresh or
remove only the files it created — pre-existing files with the same name are
left alone unless `--force` is passed. Uninstall cleans up matching managed
wrappers, including legacy `/<skill-name>` wrappers from older installs.

Notes:

- `global` skills are best installed in `global` scope so every agent can see them.
- `global` and `auto` categories may inject extra instructions into `AGENTS.md` / `CLAUDE.md`.
- `global` scope is usually more convenient because you don't need to reinstall in each project.

### Manual Entry Point

`manual` skills now have a dedicated helper. It groups skills by their directory under `skills/manual/`:

```bash
# Show the category plan
./apps/skills-manager-tui/ng plan

# List manual skills
./apps/skills-manager-tui/ng list

# Pick a manual skill interactively (fzf if installed)
./apps/skills-manager-tui/ng

# Show how to trigger one specific skill
./apps/skills-manager-tui/ng pr
```

## Creating a New Skill

```bash
mkdir -p skills/my-skill
mkdir -p skills/manual/plan/my-skill
cat > skills/manual/plan/my-skill/SKILL.md << 'EOF'
---
name: ng-plan-my-skill
description: Use when [specific trigger conditions]
---

# My Skill

## Overview
What this skill is for.

## When to Use
- Trigger 1
- Trigger 2

## Steps
1. Do X
2. Do Y
EOF
```

Suggested `skills/manual/plan/my-skill/skill.yaml`:

```yaml
id: ng-plan-my-skill
version: 1.0.0
title: My Skill
summary: Use when [specific trigger conditions]
kind: prompt_only
```

## Trigger Evaluation

This repo includes a trigger evaluation workflow for testing skill trigger recall/precision.

- Per-skill examples: `skills/**/references/trigger-examples.md`
- Export + scoring: `apps/skills-manager-tui/trigger_examples_tool.py`
- Runner: `apps/skills-manager-tui/run_trigger_eval.sh`
- HTML report: `apps/skills-manager-tui/trigger_eval_report.py`

```bash
# Smoke test (perfect predictor)
./apps/skills-manager-tui/run_trigger_eval.sh --mode perfect --no-details

# Include non-manual skills in dataset when needed
python3 ./apps/skills-manager-tui/trigger_examples_tool.py --include-non-manual summary

# Custom predictor
./apps/skills-manager-tui/run_trigger_eval.sh --mode custom \
  --predict-cmd 'python3 "$ROOT_DIR/apps/skills-manager-tui/predictor_adapter_template.py" --input "$CASES_FILE" --output "$PREDS_FILE"'
```
