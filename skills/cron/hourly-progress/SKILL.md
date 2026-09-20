---
name: hourly-progress
description: Advance one bounded workspace task during a scheduled run, verify the result, and record a durable handoff with scoped commits.
---

# Hourly Autonomous Progress

Deliver one useful, verifiable work slice within the scheduled run. Use the
previous handoff and current repository state to choose it. A notebook entry
records progress; writing the entry alone does not count as project progress.

## Operating boundaries

- Inspect current time, relevant git status, and the previous notebook entry.
  Distinguish existing changes from this run's changes before editing or staging.
- Work within the schedule's authorized repositories, actions, and time budget.
  Do not claim publication, customer contact, or an external outcome without
  authorization and observed evidence.
- Resolve routine uncertainty through lookup and safe assumptions. In unattended
  runs, choose an independent safe slice when a missing decision blocks the target.
- Commit only this run's related changes, using explicit paths and staged-diff
  inspection. Do not absorb existing user or agent changes. Never make an empty
  commit to simulate progress.
- Use workspace-relative paths in notebook content. Respect the destination:
  manuscripts in `books/...`, tutorials in `docs/...`, skills in `skills/skills/...`,
  and the Hermes notebook in `summaries/hermes/YYYY-MM-DD.md`.

## Complete a run

Choose a slice with an observable outcome and a clear verification method. Execute
it and respond to actual failures by adjusting the plan. Run the narrowest check
that can detect the relevant regression; broaden only when dependencies, failures,
or the change's effects justify it.

Read back the resulting change and verification output. If the schedule authorizes
commits, commit the target changes first, record the real hash in the notebook,
then commit the notebook separately. Preserve an executable next action. If no
safe useful slice exists, report the blocker honestly and update the notebook
only when the schedule requires it.

## Read references at the relevant decision point

Use only the references needed for the current decision; do not read this entire
map before a routine run. Each rule has one entry here.

| Situation | Reference |
| --- | --- |
| Establishing change ownership | [Startup snapshot](references/startup-status-snapshot.md); [dirty worktree selection](references/dirty-worktree-selection.md) when candidate repos are dirty |
| Choosing among tasks | [Selection examples](references/selection-examples.md); [planning loop](references/planning-execution-verification-loop.md) if selection remains unclear |
| Running without a user or on a different cadence | [Unattended delivery](references/unattended-delivery.md); [cadence sizing](references/cadence-sizing.md) |
| Continuing an earlier slice | [Continuation choice](references/continuation-slice-choice.md); [uncommitted continuation](references/uncommitted-continuation-triage.md) if that path is dirty |
| Repeated notes or validation work | [Extracting a reusable asset](references/worklog-asset-extraction.md); [validation stop rules](references/validation-chain-stop-rules.md) |
| Considering research or launch work | [Trend scan to action](references/trend-scan-to-action.md); [missing real links](references/no-link-validation-before-launch.md) |
| Switching away from a repaired codebase | [Green baseline](references/green-baseline-before-asset-switch.md) |
| Tuning an existing trigger | [Trigger tightening](references/trigger-rule-tightening-loop.md) |
| A command contradicts the plan | [Failure changes the plan](references/failure-output-changes-plan.md) |
| Choosing validation | [Verification matrix](references/verification-command-matrix.md) |
| Preparing scoped commits | [Pre-commit checks](references/pre-commit-checks.md); [commit reporting](references/commit-report-patterns.md) |
| Writing the handoff | [Notebook template](references/notebook-template.md); [handoff quality](references/handoff-quality-checklist.md) |
| Reporting claims or excluded work | [Evidence chain](references/final-report-evidence-chain.md); [excluded boundaries](references/excluded-boundary-reporting.md) |

## Result

Report the selected task, actual change, verification result, notebook path,
read-back commit hashes when commits were made, and next actionable step. Identify
excluded dirty paths when relevant. If a result could not be verified or committed,
state the concrete limitation rather than implying completion.
