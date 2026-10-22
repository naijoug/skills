# Skills Collection

Personal collection of AI coding skills. Skills are classified by directory under `skills/`.

Skills Manager is being migrated to Loom. Content checks now run independently
with `bash scripts/skills-quality-check`; existing application and CLI entrypoints
remain available until Loom passes replacement acceptance. See
[the migration record](docs/skills-manager-migration.md).

## Project Structure

```text
.
├── scripts/          # Content quality tools and transitional local startup
├── apps/             # Skills Manager (migration to Loom in progress)
├── archive/skills/   # Disabled source packages; not installable entries
└── skills/
    ├── auto/
    │   ├── in-english/
    │   └── skill-smith/
    ├── cron/
    │   ├── daily-til/
    │   ├── daily-trending/
    │   ├── hourly-progress/
    │   └── weekly-retro/
    └── manual/
        ├── design/
        │   ├── inline-command-palette-minimum/
        │   └── ui-mockup-prompt-brief/
        ├── growth/
        │   ├── engineering/
        │   ├── evidence-card-loop/
        │   ├── income-asset-validation/
        │   └── personal-coach/
        ├── plan/
        │   ├── create/
        │   └── teaching/
        ├── review/
        │   ├── agent-preflight-script-test/
        │   ├── agent-release-gate/
        │   ├── audit-evidence-boundary/
        │   ├── content-only-docs-proof-gate/
        │   ├── deployed-is-not-public-go/
        │   ├── error-boundary/
        │   └── handoff-receipt/
        └── tool/
            ├── debug-loom/
            ├── openclaw/
            ├── ref/
            └── who-am-i/
```


The 2026-10-15 consolidation leaves **25 active skills**: eight generic entries
are disabled, eight duplicate entries are merged into five existing workflows,
and two diagnostics are now ordinary reference documents. Original packages are
preserved in `archive/skills/2026-10-15/` without discoverable entrypoint filenames.
See the [migration and restore map](docs/skills-consolidation-2026-10-15.md).

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
- `manual` skills are the ones exposed by Loom’s `ng` entrypoint and `--with-slash-commands`
- manual subgroup comes from the second directory level under `skills/manual/`

Manual skills are explicit-only in Codex: each one carries
`agents/openai.yaml` with `policy.allow_implicit_invocation: false`. Invoke them
with `$skill-id` or a generated slash-command wrapper. Auto skills may be
injected only when they provide `inject.md`; Loom CLI `doctor` reports stale
or malformed managed blocks. It checks the installed version: an unchanged copy
can remain healthy while its source has updates. Read `update_available` and
`source_available` from status/doctor JSON to distinguish updates and missing
sources; do not use the doctor exit code as an update detector.

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

### Loom management entrypoint

Use the Loom application or its bundled CLI for new/v2-managed installations.
Run the following from this content repository. Point the variable at the installed
binary (or an explicitly built Loom binary); content checks do not need Loom.
Existing v1/TSV installations remain protected until explicit data migration.
Legacy application instructions and the current cutover boundary remain in
[the migration record](docs/skills-manager-migration.md).

```bash
LOOM_SKILLS_CLI="/Applications/Loom.app/Contents/MacOS/loom-skills"
```

### Interactive TUI (recommended)

Requires [fzf](https://github.com/junegunn/fzf).

```bash
"$LOOM_SKILLS_CLI" tui --skills-root "$PWD/skills"
# Or allow auto-install via Homebrew when fzf is missing
"$LOOM_SKILLS_CLI" tui --skills-root "$PWD/skills" --auto-install-fzf
```

TUI flow:

1. Enter a unified control panel (persistent, does not exit after one action)
2. Adjust: `action`, `target`, `policy`, `skills`
3. Select `execute now`, review the saved plan, then choose `Apply reviewed changes`
4. After execution, stay in the panel for further operations
5. Select `quit` to exit

Use `preview selected skills` to read `SKILL.md` without executing it. Install starts with all matching skills selected; cancel/back never applies a preview.

### CLI

```bash
# List supported tools
"$LOOM_SKILLS_CLI" tools --skills-root "$PWD/skills"

# List available skills
"$LOOM_SKILLS_CLI" list --skills-root "$PWD/skills"

# List only manual skills
"$LOOM_SKILLS_CLI" list --skills-root "$PWD/skills" --category manual

# Install to Claude Code global skills
"$LOOM_SKILLS_CLI" install --skills-root "$PWD/skills" --tool claude --scope global \
  error-boundary personal-coach

# Install to project-level
"$LOOM_SKILLS_CLI" install --skills-root "$PWD/skills" --tool codex --scope project --project-root .

# Uninstall
"$LOOM_SKILLS_CLI" uninstall --skills-root "$PWD/skills" --tool claude --scope global error-boundary

# Check status
"$LOOM_SKILLS_CLI" status --skills-root "$PWD/skills" --tool claude --scope global
```

Options:

- `--tool NAME` — codex | chatgpt | claude | amp | custom (default: codex)
- `--scope SCOPE` — global | project (default: global)
- `--mode MODE` — symlink | copy (default: symlink)
- `--auto-install-fzf` — allow `tui` to install fzf via Homebrew when missing
- `--force` — explicitly replace verified managed installations; unowned content and user-modified uninstalls remain protected
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

Loom records wrapper ownership and fingerprints in the installation manifest.
Unowned files and user edits are preserved even when replacement is requested.
Shared instruction blocks remain while another verified installation needs them.
Legacy wrappers and v1 manifests are adopted only through explicit migration.

Notes:

- `global` skills are best installed in `global` scope so every agent can see them.
- `global` and `auto` categories may inject extra instructions into `AGENTS.md` / `CLAUDE.md`.
- `global` scope is usually more convenient because you don't need to reinstall in each project.

### Manual Entry Point

`manual` skills now have a dedicated helper. It groups skills by their directory under `skills/manual/`:

```bash
# Show the category plan
"$LOOM_SKILLS_CLI" ng --skills-root "$PWD/skills" plan

# List manual skills
"$LOOM_SKILLS_CLI" ng --skills-root "$PWD/skills" list

# Pick a manual skill interactively (fzf if installed)
"$LOOM_SKILLS_CLI" ng --skills-root "$PWD/skills"

# Show how to trigger one specific skill
"$LOOM_SKILLS_CLI" ng --skills-root "$PWD/skills" error-boundary
```

## Creating a New Skill

```bash
mkdir -p skills/manual/plan/my-skill/agents
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
tags:
  - planning
triggers:
  keywords:
    - implementation plan
compatibility:
  tools:
    - codex
```

Manual skills also need `agents/openai.yaml`:

```yaml
policy:
  allow_implicit_invocation: false
```

Before publishing or committing a new manual skill, run the lightweight metadata
check so `skills-linker list` and slash-command installation do not fall back to
blank titles or incomplete summaries. The check discovers directories containing
either `SKILL.md` or `skill.yaml` and requires both files, so unfinished
metadata-only skills cannot silently pass. Metadata needs non-empty `id`, `version`, `title`,
`summary`, `kind`, `tags`, `triggers.keywords`, and `compatibility.tools`:

```bash
python3 scripts/quality/check-skill-metadata.py
```

The checker also requires manual skills to declare the explicit-only invocation
policy as a boolean under `policy`, and checks frontmatter names, matching IDs,
semantic versions, duplicate IDs and bundled Markdown links. Metadata uses the
repository's block-style YAML subset (two-space indentation, scalars and block
lists); this lightweight checker is not a general YAML parser.

Use [skill authoring guidance](docs/skill-authoring.md) for scope, completion criteria,
conditional references and routing fixtures. Run the full local skill check with
`bash scripts/skills-quality-check`; it does not start the application.

Use `--category all` when intentionally auditing auto and cron skills too.

## Trigger Evaluation

The routing tools evaluate capability selection among explicitly offered skill
candidates. Host activation policy and end-to-end model task quality are separate
checks. See [the evaluation contract](docs/skill-authoring.md#routing-evaluation).

- Per-skill examples: `skills/**/references/trigger-examples.md`
- Export + scoring: `scripts/quality/trigger_examples_tool.py`
- Runner: `scripts/quality/run_trigger_eval.sh`
- HTML report: `scripts/quality/trigger_eval_report.py`

```bash
# Smoke test (perfect predictor)
./scripts/quality/run_trigger_eval.sh --mode perfect --no-details

# Include non-manual skills in dataset when needed
python3 ./scripts/quality/trigger_examples_tool.py --include-non-manual summary

# Fail if a skill has no routing examples
python3 ./scripts/quality/trigger_examples_tool.py --include-non-manual --require-coverage summary

# Custom predictor
./scripts/quality/run_trigger_eval.sh --mode custom \
  --predict-cmd 'python3 "$ROOT_DIR/scripts/quality/predictor_adapter_template.py" --input "$CASES_FILE" --output "$PREDS_FILE"'
```

`perfect` reads the answer labels to test the scorer. The supplied custom adapter
uses demonstration keywords; neither measures a model. Real predictors receive
blind `id`/`prompt` records plus `CATALOG_FILE`, and must not inspect gold examples.
