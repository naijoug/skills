---
name: ng-review-multi-session-control-ledger
description: Use when multiple agent sessions, cron jobs, remote coding agents, or reviewers may touch related repos and you need to assign one outcome, owned paths, permission boundary, evidence, and next safe handoff per session before continuing
---

# Multi-Session Control Ledger

## Overview

Keep multiple agent sessions from silently competing for the same files, permissions, or release gate. Before starting another session or taking over an existing one, write a small ledger that separates session ownership, permission boundary, evidence, and handoff.

Core principle: concurrency is only useful when every session has exactly one outcome, explicit owned paths, a permission ceiling, and a next safe command. Without those fields, opening another agent is just adding ambiguity.

## When to Use

- A workspace has local, remote, cron, IDE, or review agent sessions active at the same time.
- A repo is already dirty and you do not know which session owns which path.
- One agent is implementing while another is reviewing, writing docs, preparing release notes, or drafting publish instructions.
- A session asks for elevated actions such as credential use, MCP approval, external publishing, customer contact, or money movement.
- You need a handoff that can be resumed without reading the full chat transcript.

## When Not to Use

- There is only one clean session, one clean repo, and one low-risk local edit; use a normal task plan plus verification instead.
- The immediate problem is committing owned files in a dirty repo; use `ng-review-path-scoped-commit-boundary` after the ledger identifies ownership.
- The handoff is already complete but needs final packaging; use `ng-review-handoff-receipt`.
- The next action is destructive or externally visible and lacks explicit user authorization; stop at the ledger and ask for authorization rather than proceeding.

## Procedure

1. **Snapshot the shared state.**
   - Run `git status --short` for every involved repo.
   - Check staged paths separately if there may be an interrupted commit.
   - Record active background processes or remote sessions when they affect the same outcome.

2. **List sessions before assigning work.**
   - Give each session an identifier: `local-coding`, `cron-docs`, `remote-review`, `publish-prep`, etc.
   - Write exactly one primary outcome per session.
   - If two sessions have the same outcome, merge them or split the outcome into implementation / review / docs / release-prep.

3. **Declare owned and excluded paths.**
   - Owned paths are files the session may edit, verify, stage, or commit.
   - Excluded paths are dirty, sensitive, generated, or externally owned paths the session must not touch.
   - If ownership is unknown, mark the path `needs triage` instead of guessing.

4. **Set a permission ceiling.**
   - Use explicit levels: `read-only`, `local edit`, `test`, `path-scoped commit`, `network`, `credential`, `publish`, `customer`, `money`.
   - A session may not escalate from one level to another just because tests pass.
   - External effects need an authorization question bound to version, account, channel, and command.

5. **Attach evidence to each claim.**
   - Evidence is command output, exit code, diff path, log line, source URL, commit hash, or explicit authorization.
   - Do not write `verified` unless the ledger names how it was verified.
   - Put failed or skipped checks under `Open risks`, not under evidence.

6. **End each session with one next safe command.**
   - The command should not broaden ownership or permissions.
   - Prefer path-scoped checks such as `git diff --check -- <owned-path>` or a single targeted test.
   - If no command is safe, the next safe action is an observation step such as `git status --short` or reading the existing diff.

## Ledger Template

```markdown
## Multi-session control ledger

- Snapshot time:
- Repos checked:

### Session: `<id>`

- Outcome:
- Repo / branch:
- Owned paths:
  -
- Excluded paths:
  -
- Permission ceiling: read-only / local edit / test / path-scoped commit / network / credential / publish / customer / money
- Evidence:
  - `command or source` -> result
- Open risks:
  -
- Next safe command:
- Decision: Continue / Narrow / Stop / Switch
```

## Decision Guide

| Decision | Use when | Next action |
| --- | --- | --- |
| `Continue` | Ownership, permission, and evidence are clear for the next small command | Run the named command or edit only owned paths |
| `Narrow` | The goal is useful but the current scope overlaps another session or lacks proof | Shrink to a read-only review, one file, or one test |
| `Stop` | Authorization, ownership, or external effect boundary is unclear | Do not edit, commit, publish, or contact externally |
| `Switch` | The current track is blocked but another independent valuable task is clean | Move to the clean task and record why |

## Red Flags

- Two sessions both list the same owned path without a handoff.
- A review session starts changing implementation files without updating its outcome and verification duty.
- A publish-prep session treats dry-run success as authorization to publish.
- The final report mentions a commit hash but not the cached path list that went into it.
- The ledger says `next: continue` instead of a concrete command or observation step.
- Absolute local paths appear in a handoff that should be portable across sessions.

## References

- Related docs: `docs/documents/trending/ai/multi-session-agent-control-plane.md`
- Related book card: `books/tech-cards-handbook/chapters/ai-agent/multi-session-control-plane-needs-ledger.md`
- Related skill: `skills/skills/manual/review/path-scoped-commit-boundary/`
- Related skill: `skills/skills/manual/review/handoff-receipt/`
