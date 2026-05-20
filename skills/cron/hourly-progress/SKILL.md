---
name: hourly-progress
description: Use when a scheduled hourly job should review a workspace, decide the next valuable small task, execute it safely, record a durable notebook entry, and commit only this run's changes
---

# Hourly Autonomous Progress Beat

## Overview

This skill turns a scheduled cron trigger into a productive work rhythm. It was originally shaped around an hourly cadence, but can also be used for quarter-hour or daily beats when the work slice is sized deliberately. It is not a reporting-only task: each run must first plan, then choose a low-risk valuable slice, execute it when feasible, verify it, and leave a handoff note for the next run.

The intended stance is: an AI-era programmer steadily building assets — code, writing, reusable skills, experiments, and income options — while avoiding random edits in a dirty multi-repo workspace.

## When to Use

- A scheduled hourly job asks for planning and continuous work progress.
- The user wants an agent to maintain a durable notebook while advancing a workspace.
- Multiple repositories may be dirty, so the run must avoid mixing unrelated changes.
- The desired output is a concise final report plus a structured notebook entry.

## Core Rules

1. **Plan before doing.** The notebook is not the result; it records the reasoning and outcome.
2. **Prefer clear, low-risk, verifiable slices.** Examples: add one small doc section, one reusable skill, one test-backed feature tweak, one structure cleanup.
3. **Inspect repository state before modification.** Never include existing user/agent changes in commits.
4. **Use the correct output location.**
   - Book manuscript: `books/...`
   - Tutorials/docs: `docs/...`
   - Reusable skills: `skills/skills/...`
   - Hermes notebook: `summaries/hermes/YYYY-MM-DD.md`
5. **Use relative paths in all notebook content.** Do not write local absolute paths.
6. **Commit only this run's related files.** If the target repo has unrelated dirty files, either choose another repo or stage paths explicitly.
7. **No empty commits.** If no substantial work was done, still record planning only when the schedule requires a notebook update, but do not fake project progress.

## Run Flow

1. Get current date/time from the host.
2. Check git status for the workspace root and relevant sub-repos.
3. Browse the recent notebook entry and likely target directories.
4. Form planning that answers:
   - What is the previous/current state?
   - What candidate work exists?
   - What is selected this run?
   - Why select it?
   - What should the next run do?
5. Execute one selected small task if there is a safe candidate.
6. Verify with the strongest cheap check available; use `references/verification-command-matrix.md` to choose the narrowest reliable command set for docs, skills, tests, product code, config, data, or dependency changes.
7. If candidate selection is unclear, compare options against `references/selection-examples.md`; if several repos are already dirty, apply `references/dirty-worktree-selection.md` before choosing a target.
8. If the actual schedule is not hourly, apply `references/cadence-sizing.md` before selecting scope; quarter-hour runs should bias toward tiny continuation slices and focused verification.
9. If web/current-trend scanning is considered, apply `references/trend-scan-to-action.md` first so the scan produces a concrete artifact or is skipped.
10. If several recent runs have expanded the same validation or outreach chain, apply `references/validation-chain-stop-rules.md` before adding another template; stop expanding once the chain is executable and blocked on real evidence.
11. Before committing, run the scope, relative-path, metadata, and handoff checks in `references/pre-commit-checks.md`; use `references/handoff-quality-checklist.md` to make the next slice specific enough to execute.
12. Append the notebook entry using the template in `references/notebook-template.md`.
13. Commit target repo changes, then commit `summaries/...` changes separately; use `references/commit-report-patterns.md` for safe staging, commit message, and hash-reporting patterns.
14. Final response: summarize selection, actual progress, notebook path, commit hash(es), and next handoff point.

## Selection Heuristics

Prefer work that is:

- **Asset-building:** reusable skills, evergreen docs, book sections, product code, validated experiments.
- **Composable:** leaves the next run a clear continuation point.
- **Bounded:** can be completed and verified within one run.
- **Non-invasive:** avoids repos with broad unrelated dirty states unless a path-level edit is obviously isolated.

Avoid work that is:

- Purely performative notebook writing.
- Large refactors without a test plan.
- Mixing with existing uncommitted changes from other work.
- Trend summaries that do not produce a concrete asset or decision.

## Reference Map

Use the references in the order that matches the run's current decision point:

1. **Choosing the work:** start with `references/selection-examples.md`; when multiple neighboring repos are already dirty, apply `references/dirty-worktree-selection.md` before editing.
2. **Sizing to cadence:** when the schedule is quarter-hourly, hourly, or daily rather than the default expectation, use `references/cadence-sizing.md` to choose a slice small enough to finish and verify.
3. **Using current information:** if a web/current-trend scan is tempting, use `references/trend-scan-to-action.md` to require a question, a bounded search, and one concrete artifact.
4. **Stopping validation-chain sprawl:** when several recent runs expanded one outreach or validation chain, use `references/validation-chain-stop-rules.md` to decide whether the next useful step is real evidence or a different asset.
5. **Scoping verification:** after selecting the slice, use `references/verification-command-matrix.md` to pick the cheapest reliable focused, structural, and broad checks.
6. **Writing the notebook:** use `references/notebook-template.md` for the required sections and `references/handoff-quality-checklist.md` to make the next action specific.
7. **Preparing the commit:** use `references/pre-commit-checks.md` for scope, path, metadata, diff, and handoff checks before staging.
8. **Reporting the result:** use `references/commit-report-patterns.md` to keep target repo commits separate from `summaries` and to report commit hashes clearly.

## Final Response Shape

Keep the final response short. Include:

- 本轮选择
- 实际推进
- Notebook 路径
- Commit hash（如有，分别列出 repo）
- 下一段接力点
