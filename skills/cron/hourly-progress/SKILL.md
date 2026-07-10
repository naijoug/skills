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
3. Apply `references/startup-status-snapshot.md` to preserve a pre-edit boundary between startup-dirty paths and this run's work.
4. Browse the recent notebook entry and likely target directories.
5. If the run is unattended or scheduler-delivered, apply `references/unattended-delivery.md` before planning so missing context is resolved by lookup, safe assumptions, or a safer slice rather than questions.
6. Gather selection inputs before choosing the task:
   - If candidate selection is unclear, compare options against `references/selection-examples.md`.
   - If several repos are already dirty, apply `references/dirty-worktree-selection.md` before choosing a target.
   - If the previous notebook entry names a next step, apply `references/continuation-slice-choice.md` to decide whether to continue, shrink once, or switch assets.
   - If that continuation repo already has uncommitted files on the handoff path, apply `references/uncommitted-continuation-triage.md` before editing or staging anything.
   - If the actual schedule is not hourly, apply `references/cadence-sizing.md` before selecting scope; quarter-hour runs should bias toward tiny continuation slices and focused verification.
   - If web/current-trend scanning is considered, apply `references/trend-scan-to-action.md` first so the scan produces a concrete artifact or is skipped.
   - If several recent runs have expanded the same validation or outreach chain, apply `references/validation-chain-stop-rules.md` before adding another template; stop expanding once the chain is executable and blocked on real evidence.
   - If a product, content, service, or income experiment still lacks a real payment/signup/sample/contact link or channel authorization, apply `references/no-link-validation-before-launch.md` before writing more launch material or implying an external publish.
   - If a code/project repo has just been brought back to a green baseline and the next step may be asset work, apply `references/green-baseline-before-asset-switch.md` before deciding whether to keep coding or switch.
7. Form planning that answers:
   - What is the previous/current state?
   - What candidate work exists?
   - What is selected this run?
   - Why select it?
   - What should the next run do?
8. Execute one selected small task if there is a safe candidate.
9. If any status check, build, search, or validation output fails or contradicts the plan, apply `references/failure-output-changes-plan.md` before continuing so the failure changes scope, order, target, or handoff.
10. Verify with the strongest cheap check available; use `references/verification-command-matrix.md` to choose the narrowest reliable command set for docs, skills, tests, product code, config, data, or dependency changes, and to name a focused fallback when broad checks are unsafe or polluted by unrelated state.
11. Before committing, run the scope, relative-path, metadata, commit-boundary, report-order, and handoff checks in `references/pre-commit-checks.md`; use `references/handoff-quality-checklist.md` to make the next slice specific enough to execute.
12. Before staging or reporting, apply `references/final-report-evidence-chain.md` so each claim has a change, evidence, and commit/readback link; keep its final response skeleton open as the checklist for the delivered response.
13. If any dirty repo or handoff path was intentionally not touched, apply `references/excluded-boundary-reporting.md` so the notebook and final response name the boundary without claiming it as this run's work.
14. Commit target repo changes first, then append the notebook entry with the real target hash using `references/notebook-template.md`.
15. Commit `summaries/...` changes separately; use `references/commit-report-patterns.md` for safe staging, commit message, and hash-reporting patterns.
16. Final response: fill the skeleton from `references/final-report-evidence-chain.md`, using the read-back hashes and subjects collected with `references/commit-report-patterns.md`. Include verification evidence and intentionally excluded dirty boundaries, not just the completed change.

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

1. **Capturing startup state:** begin with `references/startup-status-snapshot.md` so startup-dirty paths, clean candidates, and the previous handoff are distinguishable before any edit.
2. **Choosing the work:** continue with `references/selection-examples.md`; when multiple neighboring repos are already dirty, apply `references/dirty-worktree-selection.md` before editing.
3. **Running unattended:** if the scheduler says no user is present or delivery is automatic, use `references/unattended-delivery.md` to avoid questions, unsafe assumptions, and separate delivery tools.
4. **Handling handoffs:** when the previous notebook suggests a continuation, use `references/continuation-slice-choice.md` to continue, shrink once, or explicitly switch assets instead of blindly following stale or overlarge handoffs.
5. **Triage uncommitted continuations:** if the continuation repo already has dirty files on the suggested handoff path, use `references/uncommitted-continuation-triage.md` before editing or staging, and switch to a clean adjacent slice when authorship is unclear.
6. **Sizing to cadence:** when the schedule is quarter-hourly, hourly, or daily rather than the default expectation, use `references/cadence-sizing.md` to choose a slice small enough to finish and verify.
7. **Using current information:** if a web/current-trend scan is tempting, use `references/trend-scan-to-action.md` to require a question, a bounded search, and one concrete artifact.
8. **Stopping validation-chain sprawl:** when several recent runs expanded one outreach or validation chain, use `references/validation-chain-stop-rules.md` to decide whether the next useful step is real evidence or a different asset.
9. **Handling no-link launches:** when an income/content/service experiment lacks a real payment, signup, sample, contact link, or channel authorization, use `references/no-link-validation-before-launch.md` to stop fake-launch language and choose link replacement, manual validation, readiness proof, or a different asset.
10. **Switching after green baseline:** when a code repo has just been made green, use `references/green-baseline-before-asset-switch.md` to confirm the baseline, stop mechanical polishing, and capture one reusable asset.
11. **Incorporating failures:** when a command or observation fails or contradicts the plan, use `references/failure-output-changes-plan.md` so the failure changes scope, order, target, or handoff instead of being ignored.
12. **Scoping verification:** after selecting the slice, use `references/verification-command-matrix.md` to pick the cheapest reliable focused, structural, and broad checks.
13. **Writing the notebook:** use `references/notebook-template.md` for the required sections and `references/handoff-quality-checklist.md` to make the next action specific.
14. **Checking final evidence:** use `references/final-report-evidence-chain.md` to ensure each notebook/final-response claim has a change, evidence, and commit/readback link, and keep its final response skeleton as the send-time checklist.
15. **Reporting excluded boundaries:** use `references/excluded-boundary-reporting.md` when startup-dirty repos or unclear handoff paths were intentionally left untouched, so the notebook/final response names the boundary without claiming it.
16. **Preparing the commit:** use `references/pre-commit-checks.md` for scope, path, metadata, diff, and handoff checks before staging.
17. **Reporting the result:** use `references/commit-report-patterns.md` to keep target repo commits separate from `summaries`, read back hashes and subjects, and check its consistency map when report-field expectations seem duplicated; then complete the `final-report-evidence-chain.md` skeleton before sending.

## Final Response Shape

Keep the final response short, but do not shorten away evidence. Use the `references/final-report-evidence-chain.md` skeleton and the hash-readback commands in `references/commit-report-patterns.md`. Include:

- 本轮选择（repo/path + 小任务）
- 实际推进（具体变更，不写泛泛“已优化”）
- Notebook 路径
- Commits（分别列出 target repo 与 `summaries` 的 read-back hash 和 subject；无项目提交时说明原因）
- 验证（命令 + 结果摘要）
- 未接管边界（启动前 dirty path 或“无”）
- 下一段接力点（相对路径 + 第一条动作）
