---
name: ng-review-handoff-receipt
description: Prepare or receive a verifiable task handoff, including change ownership and coordination between existing sessions when needed.
---


# Task Handoff

Give the receiver enough evidence to continue without guessing what changed,
what was verified, or which actions are authorized. Use a normal short response
when there is no continuation risk; a ledger is not required for every edit.

## Choose the relevant detail

- Dirty files, staged changes or a requested scoped commit: read
  [change ownership](references/change-ownership.md).
- Multiple existing sessions touch related work: read
  [session ledger](references/session-ledger.md). This does not request additional
  agents, tasks or messages.
- For output calibration: [filled example](references/filled-example.md).

## Prepare or receive the handoff

Use the request, current diff and observed verification to distinguish owned
changes, excluded work and unresolved questions. Existing authorization remains
valid; ask only about a missing decision that affects the next action. Continue
independent authorized work while that decision is pending.

For a large pre-existing diff, inspect its size, representative hunks and companion
files before taking ownership. A small local repair does not authorize committing
the rest of that diff. Read-only review does not require ownership of every file.

Record only commands actually run and results actually observed. Describe a
missing check as unverified. Choose a concrete next action tied to the remaining
work; if the task is complete, say so instead of inventing a continuation.

## Deliver

Use as many of these fields as the receiver needs:

- Outcome and relevant files.
- Owned changes and material excluded changes.
- Verification: command, working directory, result and limits.
- Commit hash, only if a commit was authorized and made.
- Remaining issue, next action and responsible session/person if known.

Keep routine receipts short. Do not stage, commit, contact others or publish just
because the handoff is ready. For routing maintenance, use
[trigger examples](references/trigger-examples.md).
