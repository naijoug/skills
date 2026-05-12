---
name: ng-plan-review
description: Use when reviewing an existing implementation plan document against the latest code state — checks correctness, completeness, sequencing, and outdated assumptions; designed for multi-agent cross-review
---

# Plan Review

## Overview

Validate a written plan against the **current** code, not the code that existed when the plan was drafted. Plans rot fast.

Core principle: every claim in the plan is a hypothesis to be verified — files mentioned should exist, dependencies should hold, sequencing should still be feasible.

This skill is intentionally deterministic so multiple agents can run it independently and their findings can be intersected/unioned. See `references/multi-agent-review.md`.

## When to Use

- A plan doc exists (typically under `docs/plans/`) and needs validation before execution
- Code has changed since the plan was written and you want to check if it's still valid
- You want a second / third opinion via different coding agents (Claude / Codex / Cursor / Amp)
- A plan is about to be executed and you want to catch gaps now, not mid-implementation

## When Not to Use

- No plan document exists yet — use `ng-plan-create`
- The user wants a code review of a PR — use `pr`
- The user wants architecture critique without a plan — use `api-design` or general review
- The plan is trivially scoped (single file, < 1 hour) — review inline, no skill needed

## Inputs

- **Required**: path to the plan document (e.g. `docs/plans/2026-04-21-foo.md`)
- **Implicit**: the current state of the repo at HEAD

## Workflow

1. **Read the plan**
   - Capture: goal, non-goals, milestones, tasks, risks, verification
   - Note any references to files / functions / modules / commits

2. **Re-inventory current code**
   - For every file/symbol the plan names: does it still exist? Same shape?
   - Has anything in the touched area changed since the plan's date?
   - Use `git log --since=<plan-date>` on relevant paths if available

3. **Verify each task**
   - Pre-conditions still hold?
   - Dependencies still ordered correctly?
   - Outcome still observable / verifiable?

4. **Find gaps**
   - Missing dependency steps
   - Untested assumptions stated as facts
   - Edge cases the plan ignores
   - Verification missing or vague

5. **Find redundancy / over-spec**
   - Tasks that can be merged
   - Steps that are no longer needed (already done, or obsoleted)

6. **Find outdated context**
   - File renamed / deleted / refactored since plan
   - API or contract changed
   - Dependency upgraded

7. **Render verdict + findings**
   - Use the output template below
   - Verdict ∈ `good-as-is` | `minor-tweaks` | `needs-rework`

## Output Template

```markdown
# Plan Review — <plan filename>

- **Reviewed**: YYYY-MM-DD by <agent name>
- **Plan date**: YYYY-MM-DD
- **Verdict**: good-as-is | minor-tweaks | needs-rework

## Plan Summary
<2–4 sentences. Goal, scope, milestone count.>

## Code Delta Since Plan
- Files changed under touched area: <list or "none observed">
- Renames / deletions affecting the plan: <list>
- New code that overlaps with the plan: <list>

## Findings

| # | Severity | Location in plan | Issue | Suggestion |
|---|----------|------------------|-------|------------|
| 1 | blocker  | M2 task 2.3 | References `legacy/auth.ts` which was deleted in commit abc123 | Retarget to `auth/session.ts`; merge into task 2.2 |
| 2 | major    | M1 task 1.1 | Verification step missing | Add: `bash -n` + `pnpm test auth.spec.ts` |
| 3 | minor    | Risks section | Doesn't mention DB lock during migration | Add risk row with mitigation |
| 4 | nit      | Goal wording | "Improve perf" not observable | Tighten to "p95 < 200ms on /login" |

Severity levels:
- **blocker** — plan cannot execute as written
- **major** — plan will execute but produce wrong/incomplete result
- **minor** — quality / clarity issue
- **nit** — preference / wording

## Recommended Adjustments
1. <Concrete edit to plan, in order>
2. <…>

## Open Questions for Author
- [ ] <question that requires author decision before finalizing>
```

## Quality Checklist

- [ ] Every file/symbol the plan names was actually checked against current code
- [ ] Code-delta section is filled in (or "none observed" with evidence)
- [ ] Findings include severity + location + suggestion (not just complaints)
- [ ] Verdict matches the highest-severity finding
- [ ] No new plan was written — feedback only

## Multi-Agent Cross-Review

For high-stakes plans, run this skill in 2–3 different agents independently. See `references/multi-agent-review.md` for the convergence protocol.

## Example Triggers

- "review 最新代码，看看这个计划是否正确？/path/to/plan.md"
- "Help me check whether this plan is still valid after the recent refactor"
- "Cross-review this plan with current code state"

## References

- Multi-agent convergence protocol: `references/multi-agent-review.md`
- Trigger examples for recall/precision testing: `references/trigger-examples.md`
