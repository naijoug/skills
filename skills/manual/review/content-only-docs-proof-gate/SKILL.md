---
name: ng-review-content-only-docs-proof-gate
description: Use when a docs repository change is limited to markdown content or catalog entries and you need to prove the owned files without running an unnecessary full site build or absorbing unrelated dirty paths
---

# Content-only Docs Proof Gate

## Overview

Use a small proof gate for documentation changes that only touch markdown content. The goal is to show that the changed pages have valid frontmatter, local links, include targets, catalog coverage, and no local absolute paths before deciding whether a heavier renderer build is necessary.

Core principle: content-only proof is a scoped gate, not a shortcut. It is valid only when the owned paths are markdown/catalog files and the report names which dirty paths were excluded.

## When to Use

- You add or edit one or more docs pages under `documents/`.
- You update a README/catalog so the new page is discoverable.
- The repo is already dirty and you need to avoid unrelated paths.
- The change does not touch renderer code, sidebar logic, workflows, checker code, dependencies, or VuePress config.
- You need a handoff command that another agent can rerun without reading the full conversation.

## When Not to Use

- The change touches `web/vuepress/`, `.github/workflows/`, sidebar/theme/config files, package files, or checker source.
- The page depends on VuePress rendering behavior that markdown proof cannot observe.
- You cannot distinguish owned paths from startup dirty paths.
- You are tempted to exclude a failing file that belongs to the current task.
- The user explicitly asked for a full build, preview, or deployment verification.

## Procedure

1. **Snapshot ownership before editing.**
   - Run `git status --short` in the docs repo.
   - Classify paths as `owned`, `avoided`, or `needs triage`.
   - If a target file is already dirty, inspect the diff before deciding whether to edit it.

2. **Choose the narrowest proof that matches the change.**
   - Single file: run the checker on that file.
   - New page plus catalog: run changed-from-HEAD proof and the catalog checker.
   - Multiple content files: run explicit path proof first, then changed-from-HEAD with `--list-files`.

3. **Use exclusions only for pre-existing dirty paths.**
   - Exclude paths only after recording why they are not part of this task.
   - Do not exclude any owned path.
   - Always inspect the `--list-files` output so the proof scope is visible.

4. **Escalate when the content boundary is broken.**
   - If the change touches rendering, navigation, workflow, dependency, or checker logic, add the project-specific build/test command.
   - If markdown proof fails because of an unrelated dirty file, narrow the command rather than broadening ownership.

5. **Stage and commit by path.**
   - Stage only owned docs paths.
   - Read back `git diff --cached --name-only` before committing.
   - Keep the proof commands and checked file list in the handoff.

## Command Patterns

```bash
# Startup snapshot
git status --short

# Single markdown file
python3 scripts/check-markdown-proof.py documents/trending/ai/new-page.md

# New AI page plus catalog, while avoiding known startup dirty files
python3 scripts/check-markdown-proof.py --changed-from HEAD --exclude AGENTS.md --list-files
python3 scripts/check-ai-catalog.py

# Commit boundary
git diff --check -- documents/trending/ai/README.md documents/trending/ai/new-page.md
git add -- documents/trending/ai/README.md documents/trending/ai/new-page.md
git diff --cached --name-only
```

## Decision Table

| Situation | Decision | Required proof |
| --- | --- | --- |
| One content page changed | Continue | `check-markdown-proof.py <file>` |
| New AI page and README catalog changed | Continue | `check-markdown-proof.py --changed-from HEAD --list-files` plus `check-ai-catalog.py` |
| Startup dirty paths appear in changed-from-HEAD output | Narrow | Record avoided paths, rerun with explicit `--exclude` or explicit owned file list |
| Renderer, sidebar, workflow, dependency, or checker files changed | Escalate | Add `docs:build`, checker tests, or workflow validation as appropriate |
| Ownership is unclear | Stop or switch | Do read-only diff triage or pick a clean independent task |

## Handoff Template

```markdown
## Content-only docs proof gate

- Startup dirty paths:
  - `AGENTS.md` — avoided, pre-existing repo rule edit
- Owned paths:
  - `documents/trending/ai/new-page.md`
  - `documents/trending/ai/README.md`
- Proof:
  - `python3 scripts/check-markdown-proof.py --changed-from HEAD --exclude AGENTS.md --list-files`
    - checked files: `documents/trending/ai/README.md`, `documents/trending/ai/new-page.md`
    - result: markdown proof ok
  - `python3 scripts/check-ai-catalog.py`
    - result: AI catalog proof ok
- Cached paths:
  - `git diff --cached --name-only` -> only owned paths
- Decision: Continue
- Next safe command:
```

## Red Flags

- The report says `checked 2 file(s)` but does not name the two files.
- A full build is skipped after touching VuePress/sidebar/workflow files.
- `--exclude` hides a file created or edited by the current task.
- Catalog proof is skipped after adding an AI directory page.
- The commit contains `AGENTS.md`, plans, or generated files that were not listed as owned paths.
- The notebook or docs contain local absolute paths instead of repo-relative paths.

## References

- Related docs: `docs/documents/trending/ai/content-only-docs-proof-gate.md`
- Related docs: `docs/documents/trending/ai/changed-from-head-docs-preflight.md`
- Related docs: `docs/documents/trending/ai/ai-doc-change-proof-checker.md`
- Related skill: `skills/skills/manual/review/path-scoped-commit-boundary/`
- Related skill: `skills/skills/manual/review/multi-session-control-ledger/`
