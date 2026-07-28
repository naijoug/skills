---
name: ng-review-next-safe-command-ladder
description: Use when an AI-assisted coding, PR review, audit, or handoff needs the next smallest safe verification sequence instead of a vague "run tests" instruction
---

# Next Safe Command Ladder

## Overview

Convert a change or finding into a short ladder of verification steps. Each step should be cheap, local when possible, and explain what it proves before escalating to heavier checks.

Core principle: do not ask for more testing in general. Name the next safest command, why it comes first, what pass/fail means, and when to stop.

## When to Use

- Reviewing an AI-generated diff or PR and the evidence chain is unclear
- Writing a final report, handoff, PR description, or audit note that needs concrete verification guidance
- Deciding whether to run focused checks, full build, smoke tests, or CI next
- Narrowing a failed build/test into a smaller reproducible command

## When Not to Use

- The user explicitly asked for a full test suite and already accepted the cost
- The next action is destructive, production-impacting, or requires credentials not present in the session
- The workspace has unowned dirty changes and you cannot isolate this task's files

## Procedure

1. Classify the change before choosing a command.
   - Examples: docs links, UI state, API schema, data migration, script behavior, CI config, dependency bump.
   - Write the main risk in one sentence.

2. Choose the smallest command or check that answers that risk.
   - Smallest means cheapest *and* explanatory, not necessarily shortest.
   - Prefer focused checks before global checks when they can isolate the risk.

3. Define pass and fail meanings.
   - Pass means what you are allowed to believe after this step.
   - Fail means what to narrow to before running heavier commands.
   - Label the resulting claim as `confirmed`, `dismissed`, or `unknown` when the ladder is used for PR review, audit, or handoff work.

4. Attach evidence boundaries before recommending escalation.
   - Record the exact command shape and repo-relative paths that produced the evidence.
   - Downgrade `tests passed`, `no regression`, or `safe to merge` to a next check if you do not have real output.
   - Use `ng-review-audit-evidence-boundary` when the result will become a PR note, release note, final report, or public artifact.

5. Add escalation conditions.
   - Only move to build, smoke, integration, or CI after cheaper evidence supports it.
   - Tie every escalation to a specific remaining risk.

6. Add stop conditions.
   - Stop if the first failure already points to this change.
   - Stop if continuing would mix unrelated dirty worktree changes.
   - Stop if missing credentials, external services, or production permissions would make the command unsafe.

## Command Selection Patterns

| Change type | First safe check | Escalate to | Stop when |
| --- | --- | --- | --- |
| Markdown / docs links | `git diff --check` plus relative-link target check | site build | a new broken link/frontmatter error appears |
| VuePress docs | targeted diff/link assertions | `docs:build` | build failure is unrelated and cannot be isolated |
| React state logic | focused reducer/selector tests | typecheck, visual smoke | unit failure identifies the state branch |
| CLI / script | `--help`, dry-run, fixture directory | sample real input, integration | dry-run touches unexpected files |
| API/schema | schema validation and contract fixture | service test, client smoke | migration or compatibility risk is unresolved |
| CI config | local equivalent command or config parser | remote CI rerun | local config cannot reproduce remote-only environment |

## Output Template

```markdown
## Next Safe Command Ladder

Change type:
Main risk:
Current evidence:
Evidence boundary:

| Step | Command / check | Why this first | Pass means | Fail means |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

### Escalation
- If step 1 passes, run:
- If step 2 passes, run:

### Stop conditions
-

### Unverified after this ladder
-

### Evidence status
| Claim | Status | Evidence | Next check |
| --- | --- | --- | --- |
|  | confirmed / dismissed / unknown | repo-relative command or diff |  |

### Continue / Narrow / Stop
- Continue:
- Narrow:
- Stop:
```

## Example

```markdown
## Next Safe Command Ladder

Change type: VuePress documentation article and README link update
Main risk: new relative links or frontmatter break the docs site
Current evidence: files are isolated and `docs/` was clean before this task
Evidence boundary: only repo-relative paths from `documents/trending/ai/...` and portable command output should appear in the PR note

| Step | Command / check | Why this first | Pass means | Fail means |
| --- | --- | --- | --- | --- |
| 1 | `git -C docs diff --check -- documents/trending/ai/example.md documents/trending/ai/README.md` | cheapest check for whitespace/conflict damage in touched files | patch is structurally clean | fix formatting before broader validation |
| 2 | script or manual check that every new relative link target exists | links are the most likely regression | readers can navigate the new path | fix paths before build |
| 3 | `cd docs/web/vuepress && npx -y pnpm@8.15.9 run docs:build` | only after local structure is clean | VuePress integration passes | record exact warning/error and narrow |

### Stop conditions
- `docs/` has unowned dirty files outside this task;
- build fails with a new broken link from this patch.

### Evidence status
| Claim | Status | Evidence | Next check |
| --- | --- | --- | --- |
| whitespace is clean | unknown until run | `git -C docs diff --check -- documents/trending/ai/example.md documents/trending/ai/README.md` | run step 1 |
| links are navigable | unknown until run | relative-link target check | run step 2 |

### Continue / Narrow / Stop
- Continue: all three checks pass and remaining warnings are pre-existing.
- Narrow: link check fails; repair only paths touched in this task.
- Stop: failure requires changing unrelated docs or external build config.
```

## Quality Checklist

- The first step is cheaper than a full build or full test suite unless no focused check exists
- Every command has a reason tied to a named risk
- Pass/fail meanings are concrete enough for the next agent or reviewer to act on
- PR/audit/handoff ladders label claims as `confirmed`, `dismissed`, or `unknown` after real evidence exists
- Validation notes use repo-relative paths and do not expose machine-local absolute paths
- Stop conditions protect unowned worktree changes and external side effects
- Remaining unverified risks are stated honestly

## References

- Trigger examples: `references/trigger-examples.md`
- AI coding audit example: `references/ai-coding-audit-example.md`
- Related evidence boundary skill: `skills/skills/manual/review/audit-evidence-boundary/`
- Related PR self-review skill: `skills/skills/manual/review/pr/`
- Public mock report path: `docs/documents/trending/ai/ai-coding-audit-mock-report.md`
- Observation-to-skill checklist: `docs/documents/trending/ai/ai-coding-audit-observation-to-skill-checklist.md`
