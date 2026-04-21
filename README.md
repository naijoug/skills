# Skills Collection

Personal collection of AI coding skills. Skills are classified by directory under `skills/`.

## Project Structure

```text
.
├── scripts/
│   ├── skills-linker              # Install/uninstall skills (CLI + fzf TUI)
│   └── tui                        # Shortcut for `skills-linker tui`
└── skills/
    ├── global/
    │   └── in-english/
    ├── cron/
    │   ├── daily-til/
    │   ├── daily-trending/
    │   └── weekly-retro/
    ├── auto/
    │   └── skill-smith/
    └── manual/
        ├── plan/
        │   ├── teaching/
        │   ├── code-reading/
        │   └── test-case/
        ├── review/
        │   ├── pr/
        │   ├── api-design/
        │   └── refactor/
        ├── research/
        │   └── web-search/
        ├── growth/
        │   ├── personal-coach/
        │   ├── engineering/
        │   └── debugging-kata/
        ├── tooling/
        │   ├── openclaw/
        │   └── who-am-i/
        └── meta/
            └── example/
```

## Skill Categories

Category comes from the directory path, not `skill.yaml`:

| Category | Meaning | Typical examples |
|----------|---------|------------------|
| `skills/global/<skill>` | Install globally and auto-inject into agent instructions | `in-english` |
| `skills/cron/<skill>` | Trigger from recurring automation or heartbeat jobs, not manual invocation | `daily-til`, `daily-trending`, `weekly-retro` |
| `skills/auto/<skill>` | Auto-trigger helper that activates after installation | `skill-smith` |
| `skills/manual/<group>/<skill>` | Only runs when explicitly selected or clearly requested | most task skills |

Behavior:

- `global` and `auto` skills are auto-injected by `skills-linker` when they provide `inject.md`
- `cron` skills are installed normally but are intentionally not auto-injected; they are driven by scheduled triggers
- `manual` skills are the ones exposed by `./scripts/ng`
- manual subgroup comes from the second directory level under `skills/manual/`

Recommended manual subdirectories:

- `plan` for planning, mapping, and decomposition skills
- `review` for review, critique, and safe-change skills
- `research` for search, trends, and information synthesis
- `growth` for practice, coaching, and retrospectives
- `tooling` for local tools and service operations
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
./scripts/tui
# Or allow auto-install via Homebrew when fzf is missing
./scripts/tui --auto-install-fzf
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
./scripts/skills-linker tools

# List available skills
./scripts/skills-linker list

# List only manual skills
./scripts/skills-linker list --category manual

# Install to Claude Code global skills
./scripts/skills-linker install --tool claude --scope global \
  pr personal-coach

# Install to project-level
./scripts/skills-linker install --tool codex --scope project --project-root .

# Uninstall
./scripts/skills-linker uninstall --tool claude --scope global pr

# Check status
./scripts/skills-linker status --tool claude --scope global
```

Options:

- `--tool NAME` — codex | chatgpt | claude | amp | custom (default: codex)
- `--scope SCOPE` — global | project (default: global)
- `--mode MODE` — symlink | copy (default: symlink)
- `--auto-install-fzf` — allow `tui` to install fzf via Homebrew when missing
- `--force` — replace conflicting targets
- `--with-slash-commands` — also install slash command wrappers for manual skills
- `--json` — JSON output

### Slash Commands

`--with-slash-commands` writes one wrapper file per `manual` skill into the
agent's slash command directory, so you can trigger the skill by typing
`/<skill-name>` in the chat:

| Tool | Global | Project |
|------|--------|---------|
| Claude Code | `~/.claude/commands/<skill>.md` | `{project}/.claude/commands/<skill>.md` |
| Codex / ChatGPT | `~/.codex/prompts/<skill>.md` | `{project}/.codex/prompts/<skill>.md` |

Each wrapper file contains a marker comment so the linker can refresh or
remove only the files it created — pre-existing files with the same name are
left alone unless `--force` is passed. Uninstall always cleans up matching
managed wrappers.

Notes:

- `global` skills are best installed in `global` scope so every agent can see them.
- `global` and `auto` categories may inject extra instructions into `AGENTS.md` / `CLAUDE.md`.
- `global` scope is usually more convenient because you don't need to reinstall in each project.

### Manual Entry Point

`manual` skills now have a dedicated helper. It groups skills by their directory under `skills/manual/`:

```bash
# Show the category plan
./scripts/ng plan

# List manual skills
./scripts/ng list

# Pick a manual skill interactively (fzf if installed)
./scripts/ng

# Show how to trigger one specific skill
./scripts/ng pr
```

## Creating a New Skill

```bash
mkdir -p skills/my-skill
mkdir -p skills/manual/plan/my-skill
cat > skills/manual/plan/my-skill/SKILL.md << 'EOF'
---
name: my-skill
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
id: my-skill
version: 1.0.0
title: My Skill
summary: Use when [specific trigger conditions]
kind: prompt_only
```

## Trigger Evaluation

This repo includes a trigger evaluation workflow for testing skill trigger recall/precision.

- Per-skill examples: `skills/**/references/trigger-examples.md`
- Export + scoring: `scripts/trigger_examples_tool.py`
- Runner: `scripts/run_trigger_eval.sh`
- HTML report: `scripts/trigger_eval_report.py`

```bash
# Smoke test (perfect predictor)
./scripts/run_trigger_eval.sh --mode perfect --no-details

# Include non-manual skills in dataset when needed
python3 ./scripts/trigger_examples_tool.py --include-non-manual summary

# Custom predictor
./scripts/run_trigger_eval.sh --mode custom \
  --predict-cmd 'python3 "$ROOT_DIR/scripts/predictor_adapter_template.py" --input "$CASES_FILE" --output "$PREDS_FILE"'
```
