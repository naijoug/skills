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
4. If the run is unattended or scheduler-delivered, apply `references/unattended-delivery.md` before planning so missing context is resolved by lookup, safe assumptions, or a safer slice rather than questions.
5. Gather selection inputs before choosing the task:
   - If candidate selection is unclear, compare options against `references/selection-examples.md`.
   - If several repos are already dirty, apply `references/dirty-worktree-selection.md` before choosing a target.
   - If the previous notebook entry names a next step, apply `references/continuation-slice-choice.md` to decide whether to continue, shrink once, or switch assets.
   - If that continuation repo already has uncommitted files on the handoff path, apply `references/uncommitted-continuation-triage.md` before editing or staging anything.
   - If the actual schedule is not hourly, apply `references/cadence-sizing.md` before selecting scope; quarter-hour runs should bias toward tiny continuation slices and focused verification.
   - If web/current-trend scanning is considered, apply `references/trend-scan-to-action.md` first so the scan produces a concrete artifact or is skipped.
   - If several recent runs have expanded the same validation or outreach chain, apply `references/validation-chain-stop-rules.md` before adding another template; stop expanding once the chain is executable and blocked on real evidence.
6. Form planning that answers:
   - What is the previous/current state?
   - What candidate work exists?
   - What is selected this run?
   - Why select it?
   - What should the next run do?
7. Execute one selected small task if there is a safe candidate.
8. If any status check, build, search, or validation output fails or contradicts the plan, apply `references/failure-output-changes-plan.md` before continuing so the failure changes scope, order, target, or handoff.
9. Verify with the strongest cheap check available; use `references/verification-command-matrix.md` to choose the narrowest reliable command set for docs, skills, tests, product code, config, data, or dependency changes, and to name a focused fallback when broad checks are unsafe or polluted by unrelated state.
10. Before committing, run the scope, relative-path, metadata, commit-boundary, report-order, and handoff checks in `references/pre-commit-checks.md`; use `references/handoff-quality-checklist.md` to make the next slice specific enough to execute.
11. Before staging or reporting, apply `references/final-report-evidence-chain.md` so each claim has a change, evidence, and commit/readback link.
12. Commit target repo changes first, then append the notebook entry with the real target hash using `references/notebook-template.md`.
13. Commit `summaries/...` changes separately; use `references/commit-report-patterns.md` for safe staging, commit message, and hash-reporting patterns.
14. Final response: summarize selection, actual progress, notebook path, read-back commit hash(es), and next handoff point.

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
2. **Running unattended:** if the scheduler says no user is present or delivery is automatic, use `references/unattended-delivery.md` to avoid questions, unsafe assumptions, and separate delivery tools.
3. **Handling handoffs:** when the previous notebook suggests a continuation, use `references/continuation-slice-choice.md` to continue, shrink once, or explicitly switch assets instead of blindly following stale or overlarge handoffs.
4. **Triage uncommitted continuations:** if the continuation repo already has dirty files on the suggested handoff path, use `references/uncommitted-continuation-triage.md` before editing or staging, and switch to a clean adjacent slice when authorship is unclear.
5. **Sizing to cadence:** when the schedule is quarter-hourly, hourly, or daily rather than the default expectation, use `references/cadence-sizing.md` to choose a slice small enough to finish and verify.
6. **Using current information:** if a web/current-trend scan is tempting, use `references/trend-scan-to-action.md` to require a question, a bounded search, and one concrete artifact.
7. **Stopping validation-chain sprawl:** when several recent runs expanded one outreach or validation chain, use `references/validation-chain-stop-rules.md` to decide whether the next useful step is real evidence or a different asset.
8. **Incorporating failures:** when a command or observation fails or contradicts the plan, use `references/failure-output-changes-plan.md` so the failure changes scope, order, target, or handoff instead of being ignored.
9. **Scoping verification:** after selecting the slice, use `references/verification-command-matrix.md` to pick the cheapest reliable focused, structural, and broad checks.
10. **Writing the notebook:** use `references/notebook-template.md` for the required sections and `references/handoff-quality-checklist.md` to make the next action specific.
11. **Checking final evidence:** use `references/final-report-evidence-chain.md` to ensure each notebook/final-response claim has a change, evidence, and commit/readback link.
12. **Preparing the commit:** use `references/pre-commit-checks.md` for scope, path, metadata, diff, and handoff checks before staging.
13. **Reporting the result:** use `references/commit-report-patterns.md` to keep target repo commits separate from `summaries` and to report commit hashes clearly.

## Final Response Shape

Keep the final response short. Include:

- 本轮选择
- 实际推进
- Notebook 路径
- Commit hash（如有，分别列出 repo）
- 下一段接力点
