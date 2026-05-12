---
name: ng-plan-create
description: Use when drafting an implementation plan document for a non-trivial feature, refactor, or migration — produces a dated plan file with goal, scope, milestones, tasks, risks, and verification strategy
---

# Plan Create

## Overview

Turn a fuzzy requirement into a written, reviewable implementation plan before any code is touched.

Core principle: a good plan is **independently executable and independently reviewable** — each task names concrete files/functions and has a verifiable outcome.

## When to Use

- Non-trivial feature work spanning multiple files / modules / services
- Refactor or migration with ordered steps and rollback risk
- Multi-day work where alignment with self / teammates / future-you matters
- Before invoking `ng-plan-review` — a written plan is the input to review

## When Not to Use

- Single-file edit or one-shot fix (just do it)
- The plan already exists — use `ng-plan-review` instead
- The user wants test design only — use `test-case`
- The user wants codebase orientation — use `code-reading`

## Workflow

1. **Clarify the goal**
   - What success looks like (1-2 sentences)
   - Explicit non-goals (what we are NOT doing this round)
   - Success criteria that are observable

2. **Inventory current state**
   - Existing modules, entry points, related files
   - What is reusable vs what needs new code
   - Cite paths: `path/to/file.ts:42`, `Module.ClassName`

3. **Decompose into milestones**
   - Each milestone is a coherent, shippable slice
   - Order milestones by dependency, not by file
   - Prefer 3–7 milestones; split if more

4. **Break milestones into tasks**
   - Each task: one concrete outcome, named files/functions, ≤ ~1 day of work
   - Mark dependencies between tasks explicitly

5. **Risks and open questions**
   - What could break (existing behavior, perf, contracts)
   - What you don't know yet — list as questions, not assumptions

6. **Verification strategy**
   - How each milestone will be verified (test, manual check, metric)
   - What rollback looks like if a milestone fails

7. **Write to disk**
   - Path: `docs/plans/YYYY-MM-DD-<topic>.md` (or follow project convention if one exists)
   - Use the output template below

## Output Template

```markdown
# <Topic> — Plan

- **Date**: YYYY-MM-DD
- **Author**: <name or agent>
- **Status**: draft | reviewed | in-progress | done

## Goal

<1-2 sentence outcome.>

## Non-Goals

- <Explicit exclusion 1>
- <Explicit exclusion 2>

## Success Criteria

- <Observable check 1>
- <Observable check 2>

## Current State

- <Existing module / file>: <what it does, what's relevant here>
- Reusable: <list>
- New code needed: <list>

## Milestones

### M1 — <slice name>
**Outcome**: <what's true after this milestone>

| # | Task | Files / Symbols | Depends on | Verification |
|---|------|-----------------|------------|--------------|
| 1.1 | <task> | `path/file.ts:func` | — | <check> |
| 1.2 | <task> | `path/file.ts` | 1.1 | <check> |

### M2 — <slice name>
…

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| <e.g. breaking API contract> | M | H | <e.g. version-gate via flag> |

## Open Questions

- [ ] <question requiring decision before / during work>

## Verification Strategy

- Per-milestone: <tests / manual / metrics>
- End-to-end: <integration check>
- Rollback: <how to back out if a milestone fails>
```

## Quality Checklist

- [ ] Goal is observable, not aspirational
- [ ] Non-goals are explicit
- [ ] Each task names concrete files / functions
- [ ] Each task has a verification step
- [ ] Dependencies between tasks are explicit
- [ ] Risks and open questions are separated from facts
- [ ] Plan file is dated and lives under `docs/plans/`

## Example Triggers

- "为这个新功能写一份实施计划"
- "Draft an implementation plan for migrating X to Y"
- "把这个重构拆成可执行的步骤，写到 docs/plans/"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
