# Skills Collection

Personal collection of AI coding skills. Each skill lives in `skills/<skill-name>/SKILL.md`.

## Project Structure

```text
.
├── scripts/
│   ├── skills-linker              # Install/uninstall skills (CLI + fzf TUI)
│   └── tui                        # Shortcut for `skills-linker tui`
└── skills/
    ├── pr-self-review/
    │   ├── SKILL.md
    │   ├── skill.yaml             # optional metadata
    │   ├── inject.md              # always-on injection content (optional)
    │   └── references/
    │       └── trigger-examples.md
    └── ...
```

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

# Install to Claude Code global skills
./scripts/skills-linker install --tool claude --scope global \
  pr-self-review personal-growth-coach

# Install to project-level
./scripts/skills-linker install --tool codex --scope project --project-root .

# Uninstall
./scripts/skills-linker uninstall --tool claude --scope global pr-self-review

# Check status
./scripts/skills-linker status --tool claude --scope global
```

Options:

- `--tool NAME` — codex | chatgpt | claude | amp | custom (default: codex)
- `--scope SCOPE` — global | project (default: global)
- `--mode MODE` — symlink | copy (default: symlink)
- `--auto-install-fzf` — allow `tui` to install fzf via Homebrew when missing
- `--force` — replace conflicting targets
- `--json` — JSON output

Notes:

- Skills with `activation: always_on` can be installed in both `global` and `project` scope.
- `global` is usually more convenient because you don't need to reinstall in each project.

## Creating a New Skill

```bash
mkdir -p skills/my-skill
cat > skills/my-skill/SKILL.md << 'EOF'
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

## Trigger Evaluation

This repo includes a trigger evaluation workflow for testing skill trigger recall/precision.

- Per-skill examples: `skills/*/references/trigger-examples.md`
- Export + scoring: `scripts/trigger_examples_tool.py`
- Runner: `scripts/run_trigger_eval.sh`
- HTML report: `scripts/trigger_eval_report.py`

```bash
# Smoke test (perfect predictor)
./scripts/run_trigger_eval.sh --mode perfect --no-details

# Include always_on skills in dataset when needed
python3 ./scripts/trigger_examples_tool.py --include-always-on summary

# Custom predictor
./scripts/run_trigger_eval.sh --mode custom \
  --predict-cmd 'python3 "$ROOT_DIR/scripts/predictor_adapter_template.py" --input "$CASES_FILE" --output "$PREDS_FILE"'
```
