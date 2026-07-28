---
name: ng-review-handoff-receipt
description: Use when finishing or receiving an agent task in a dirty or multi-repo workspace and you need a compact handoff that names owned changes, avoided paths, verified facts, open risks, and the next safe command
---

# Handoff Receipt

## Overview

Turn an agent handoff into a short, verifiable receipt. The goal is not to retell the whole session; it is to make the next agent or reviewer able to continue without guessing which files were owned, which dirty paths were avoided, and which facts were actually checked.

Core principle: a handoff is only useful if it separates `Owned changes` from `Avoided dirty paths` and names one `Next safe command` that will not accidentally absorb someone else's work.

## When to Use

- Finishing a cron, coding-agent, review-agent, or documentation-agent turn in a workspace with existing uncommitted changes
- Receiving another agent's changes and deciding what can be safely continued
- Preparing a PR summary, reviewer note, or final response where verification scope matters
- Narrowing a large handoff into a 30-second continuation card
- Recording why a dirty path was deliberately not touched or not committed

## When Not to Use

- The task has no files, no command results, and no continuation risk; a normal final answer is enough
- The user requested a full audit report; use `ng-review-audit-evidence-boundary` for claim classification first
- You still have not run the required verification; run or name the missing command before writing the receipt
- You plan to commit every dirty file without confirming ownership; stop and triage ownership first

## Procedure

1. **Snapshot before summarizing.**
   - Run the narrowest available status command for each repo you might mention.
   - Capture staged and unstaged paths separately when that distinction changes ownership.
   - Do not infer ownership from modification time alone.

2. **Declare owned scope.**
   - List only paths you created or intentionally edited in this task.
   - If you committed, include the commit hash and still list the relevant paths.
   - If a file was already dirty before you touched it, say whether you avoided it, patched only a named section, or stopped.

3. **Declare avoided scope.**
   - List dirty paths that existed but were not part of this task.
   - Include the reason in one phrase: `existing dirty path`, `unknown owner`, `large unrelated diff`, `requires user authorization`, or `different repo`.

4. **Name verified facts, not hopes.**
   - Record commands with working directory, target files, and result.
   - If verification was manual, name the exact review standard.
   - If a command could not be run, list it under `Open risks`, not `Verified facts`.

5. **End with one next safe command.**
   - Prefer a command scoped to owned files, for example `git diff --check -- path-a path-b`.
   - If no command is safe, write the next safe observation step, such as `git status --short` or `read docs/...`.
   - Choose `Decision: Continue / Narrow / Stop / Switch` so the receiver knows whether to proceed or change track.

## Receipt Template

```markdown
## Handoff Receipt

- Handoff title:
- Repo / area:
- Owned changes:
  -
- Avoided dirty paths:
  -
- Verified facts:
  -
- Commands run:
  - `...` -> result
- Open risks:
  -
- Next safe command:
- Decision: Continue / Narrow / Stop / Switch
```

## Decision Guide

| Decision | Use when | Next action |
| --- | --- | --- |
| `Continue` | Owned changes are verified and the next task has a safe scoped command | Run the named command or extend the owned slice |
| `Narrow` | Verification supports only a smaller claim than the handoff originally implied | Ask for or collect the missing evidence before broadening |
| `Stop` | Ownership, authorization, or proof is unclear enough that action may mix unrelated work | Do not edit or commit; request clarification or preserve state |
| `Switch` | The current track is blocked but another clean, valuable track exists | Move to the clean track and record why |

## Large Dirty Diff Intake

Use this mini-procedure when the next task is a large pre-existing dirty diff, such as a chapter rewrite, generated migration, or broad formatting pass.

1. **Measure before deciding.** Record `git diff --stat -- <paths>` and, when useful, `git diff --numstat -- <paths>` before reading the content. A 300-line insert/delete pattern is already an ownership signal.
2. **Sample the diff shape.** Read enough hunks to classify the change as `content addition`, `format-only rewrite`, `mixed content + formatting`, `generated output`, or `unknown`.
3. **Separate repair from ownership.** A small validation repair inside an already dirty file can be verified, but do not commit it unless you can isolate it from the pre-existing diff or you explicitly own the whole file.
4. **Check companions.** If README, appendix, index, lockfile, or generated files changed with the main file, treat them as one ownership set until proven otherwise.
5. **Pick the receipt decision.** Use `Continue` only when you can own and verify the whole set; use `Narrow` for read-only assessment or a non-committed local repair; use `Stop` when the diff would require user authorization; use `Switch` when a cleaner valuable task is available.

Receipt add-on:

```markdown
- Dirty diff size: `<insertions>/<deletions>` across `<paths>`
- Diff shape: content addition / format-only rewrite / mixed / generated / unknown
- Companion paths:
- Safe to commit now: yes / no, because
- Smallest next safe command:
```

## Quality Checklist

- `Owned changes` contains relative paths only
- `Avoided dirty paths` includes every relevant pre-existing dirty path or explicitly says none
- `Verified facts` contains command results or a concrete manual review standard
- `Open risks` names missing proof instead of hiding it in optimistic prose
- `Next safe command` is scoped enough that a different agent can run it without taking ownership of unrelated files
- The receipt can be read in 30 seconds

## References

- Filled example: `references/filled-example.md`
- Dirty worktree boundary: `docs/documents/trending/ai/agent-cron-dirty-worktree-boundary.md`
- Handoff receipt template: `docs/documents/trending/ai/agent-handoff-receipt-template.md`
- Related evidence skill: `skills/skills/manual/review/audit-evidence-boundary/`
- Related command ladder skill: `skills/skills/manual/review/next-safe-command-ladder/`
