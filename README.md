# Skills Collection

Personal collection of local skills, organized under a dedicated `skills/` directory.

This repository now also includes a Python MVP for cross-tool skill reuse:

- unified skill discovery (`SKILL.md` + optional `skill.yaml`)
- multi-target exporters (`codex`, `claude-code`, `amp`, `trae`, `antigravity`, `cursor`, `vscode`)
- CLI workflow (`list/show/validate/render/doctor/run`)
- MCP/JSON-RPC server skeleton for tools that can call local servers

## Project Structure

```text
.
├── README.md
├── src/skills_platform/         # CLI + adapters + MCP server scaffold
├── tests/                       # unit tests + fixtures
├── docs/plans/                  # design / implementation docs
└── skills/
    ├── pr-self-review/
    │   ├── SKILL.md
    │   ├── skill.yaml           # optional machine-readable metadata
    │   └── agents/openai.yaml   # tool-specific override
    └── ...
```

## Installation

### Recommended: Clone and symlink only skill folders

```bash
git clone https://github.com/naijoug/skills.git ~/.config/codex/skills-custom
ln -s ~/.config/codex/skills-custom/skills/* ~/.config/codex/skills/
```

This repo contains docs and metadata at the root, so symlinking `skills/*` is safer than linking the whole repository root.

## Cross-Tool Usage (MVP)

### CLI

All commands assume you run from this repository root and use the local `src/` package path:

```bash
PYTHONPATH=src python3 -m skills_platform list --root skills
PYTHONPATH=src python3 -m skills_platform show pr-self-review --root skills
PYTHONPATH=src python3 -m skills_platform validate --root skills
PYTHONPATH=src python3 -m skills_platform render --root skills --target codex --target cursor --output dist
PYTHONPATH=src python3 -m skills_platform doctor --root skills
```

### MCP / JSON-RPC skeleton server

```bash
PYTHONPATH=src python3 -m skills_platform.mcp_server --root skills
```

Supported methods (MVP):

- `skills.list`
- `skills.describe`
- `skills.validate`
- `skills.render`
- `skills.run`

### Exported target adapters

The exporter currently generates a consistent layout per target under `dist/<target>/`:

- `rules/` (prompt/rule files per skill)
- `config/mcp.json` (MCP + CLI fallback snippet)
- `install/README.md` (target-specific install notes)

Supported targets:

- `codex`
- `claude-code`
- `amp`
- `trae`
- `antigravity`
- `cursor`
- `vscode`

## Skills

Each skill lives in `skills/<skill-name>/SKILL.md`.

Optional metadata can be added at `skills/<skill-name>/skill.yaml` to improve export/runtime behavior.

Current skills:

- `teaching-plan`: Generate detailed Markdown teaching plans/lesson scripts from GitHub URLs or text materials
- `trending`: Collect and summarize daily AI trends/news/topics
- `example-skill`: Template for creating new skills

## Trigger Evaluation (Skills Discovery Quality)

This repo also includes a local evaluation workflow for testing skill trigger recall/precision using curated prompts.

### What is included

- Per-skill trigger examples in `skills/*/references/trigger-examples.md`
  - Positive examples (should trigger)
  - Negative / near-miss examples (should not trigger)
- Export + scoring tool: `scripts/trigger_examples_tool.py`
- End-to-end runner: `scripts/run_trigger_eval.sh`
- HTML report generator: `scripts/trigger_eval_report.py`
- Predictor adapter template (replace with your real trigger logic):
  `scripts/predictor_adapter_template.py`

### Quick Start (Smoke Test)

Perfect predictor (sanity check):

```bash
./scripts/run_trigger_eval.sh --mode perfect --no-details
```

No-op predictor (baseline lower bound):

```bash
./scripts/run_trigger_eval.sh --mode noop --no-details
```

### Run with a Custom Trigger Engine

Use your own predictor that reads exported JSONL and writes predictions JSONL:

```bash
./scripts/run_trigger_eval.sh \
  --mode custom \
  --predict-cmd 'python3 "$ROOT_DIR/scripts/predictor_adapter_template.py" --input "$CASES_FILE" --output "$PREDS_FILE"' \
  --confusion --top 20 \
  --csv-out /tmp/trigger-score-csv \
  --html-report /tmp/trigger-eval-report.html
```

Notes:

- `CASES_FILE` and `PREDS_FILE` are provided to the custom command as environment variables.
- Replace `predictor_adapter_template.py` with your real trigger engine adapter.

### JSONL Formats

Exported cases (one JSON object per line):

```json
{"id":"pr-self-review:positive:en:1","skill":"pr-self-review","prompt":"...","expected_trigger":true}
```

Predictions (accepted by scorer):

```json
{"id":"pr-self-review:positive:en:1","predicted":["pr-self-review"]}
```

Also accepted:

```json
{"id":"pr-self-review:positive:en:1","predicted_skills":["pr-self-review"]}
```

### CSV Outputs (`score --csv-out`)

The scorer can export analysis-friendly CSV files:

- `overall.csv`
- `per_skill.csv`
- `details.csv`
- `positive_miss_confusions.csv`
- `positive_cotriggers.csv`
- `negative_false_trigger_confusions.csv`

### HTML Report

Generate an interactive single-file report from CSV outputs:

```bash
python3 scripts/trigger_eval_report.py \
  --csv-dir /tmp/trigger-score-csv \
  --out /tmp/trigger-eval-report.html
```

The report includes:

- Summary cards (recall, reject rate, counts)
- Per-skill metrics table
- Confusion tables (click rows to filter the details table)
- Filterable error details (`skill`, error type, keyword search)

## Creating a New Skill

```sh
mkdir -p skills/my-skill
cat > skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: Use when [specific trigger conditions for this skill]
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

## Examples
~~~bash
codex command example
~~~
EOF
```

## Maintenance Notes

- Keep one skill per directory
- Prefer `name` + `description` only in frontmatter
- Write `description` as a trigger ("Use when ..."), not a workflow summary
- Add `skill.yaml` for richer cross-tool metadata (kind, tags, compatibility, runtime)
- `agents/<tool>.yaml` should contain only tool-specific overrides, not duplicate core content

## Limitations (current MVP)

- YAML parsing uses a simple built-in subset parser (no anchors / multiline blocks / advanced YAML syntax)
- MCP server is a JSON-RPC-style stdio skeleton meant for integration scaffolding, not full protocol completeness yet
- Runtime plugin execution is scaffolded (`skills run`) but concrete skill runtime modules still need to be implemented per skill
