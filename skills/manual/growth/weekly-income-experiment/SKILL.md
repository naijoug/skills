---
name: ng-growth-weekly-income-experiment
description: Use when an AI-era programmer needs to choose one bounded weekly income experiment, avoid overbuilding, produce a verifiable artifact, and decide Continue / Narrow / Stop / Switch from evidence
---

# Weekly Income Experiment

## Overview

Use this skill to convert a broad AI-era programmer ambition into one week of concrete work. The goal is not to brainstorm many possible products; the goal is to choose one small experiment, ship one proof artifact, verify it, and record the next evidence needed.

This skill is especially useful after several sessions have produced documents, templates, or offer ideas but no new real-world signal. It forces a switch from asset accumulation to evidence-seeking.

## When to Use

- You have several possible content, tooling, open-source, template, or service ideas and need to pick one for the week.
- A previous experiment is blocked on external feedback, publishing access, private samples, or a buyer conversation.
- You want a small deliverable that can be locally verified before distribution.
- You need to decide whether to continue, narrow, stop, or switch a direction.

## When Not to Use

- The task is already a specific implementation request with a clear acceptance test.
- You have a paying customer or maintainer request that should be delivered directly.
- The only missing piece is routine project management, not experiment selection.
- The idea would require inventing feedback, users, case studies, or demand signals.

## Workflow

### 1. State this week's constraints

Write four lines before choosing the experiment:

```text
Available time:
Reachable audience: self / existing readers / open-source maintainers / friends' team / paying customer
Delivery boundary: doc / script / PR / template / service sample / small tool
Cannot do: no publishing access / no private-code access / no fabricated feedback / no long support tail
```

Treat constraints as filters. If there is no external channel, choose a local script, reproducible tutorial, fixture-backed template, or open-source contribution. If there is a real reachable person, choose the smallest artifact they can inspect.

### 2. Build the candidate board

Score each candidate with `Yes / Weak / No`.

| Candidate | Real input exists? | 30-120 min deliverable? | Locally verifiable? | Reusable next week? | Natural distribution? | Stop risk |
| --- | --- | --- | --- | --- | --- | --- |
| Workflow asset |  |  |  |  |  |  |
| Content asset |  |  |  |  |  |  |
| Open-source contribution |  |  |  |  |  |  |
| Automation tool |  |  |  |  |  |  |
| Template pack |  |  |  |  |  |  |
| Fixed-scope service offer |  |  |  |  |  |  |

Prefer the candidate with the most real input and the cheapest credible verification. Do not choose a candidate whose value depends on pretending that external feedback already happened.

### 3. Pick one proof artifact

Choose exactly one artifact for this run or week:

- **Workflow asset**: checklist, handoff template, review rubric, failure-recovery ladder.
- **Content asset**: tutorial with real commands, build output, screenshots, or reproducible diffs.
- **Open-source contribution**: documentation fix, failing-test reproduction, small PR, issue triage note.
- **Automation tool**: CLI, dry-run checker, fixture, smoke test, report generator.
- **Template pack**: prompt, report skeleton, example input, expected output, usage note.
- **Service sample**: fixed-scope intake form, sample report, audit checklist, delivery boundary.

The artifact must have one verification method: command output, test result, fixture comparison, accepted PR feedback, or a human-review checklist.

### 4. Write the experiment card

```markdown
## Weekly Experiment Card

### Hypothesis
For [audience], [artifact/service] helps with [pain] by producing [measurable outcome].

### Evidence already available
- Real input:
- Repeated pain:
- Existing workaround or failed attempt:

### Smallest deliverable
- Artifact:
- Path or URL:
- Explicit non-goals:

### Verification
- Command/check:
- Expected result:
- Failure response:

### Distribution
- Primary channel:
- One-sentence hook:
- Call to action:

### Decision rule
- Continue if:
- Narrow if:
- Stop if:
- Switch if:

### Next evidence needed
-
```

### 5. Execute the smallest slice

A good weekly experiment can be sliced into one cron/session-sized action:

1. Create or revise the artifact.
2. Add the narrowest useful verification.
3. Run the verification.
4. Record what evidence is still missing.
5. Commit only the artifact and its direct notes.

If execution reveals the artifact is too large, shrink once. If it still cannot be verified, stop and choose a different candidate.

### 6. Decide from evidence

Use this decision table at the end of the week or after the first meaningful signal:

| Decision | Use when | Next action |
| --- | --- | --- |
| Continue | The artifact produced a concrete reply, reuse, PR review, signup, or repeated self-use | Improve delivery and ask for the next stronger signal |
| Narrow | People care about one subproblem, or verification only supports one narrow claim | Rewrite the audience, pain, and artifact around that subproblem |
| Stop | No real input, no local verification, or no distribution path appears | Archive the artifact and do not add more supporting docs |
| Switch | The work produced useful assets but the original demand hypothesis remains blocked | Move the reusable part into a different experiment |

## Quality Bar

- One week has one primary experiment, not a portfolio of half-started ideas.
- The artifact is useful even if nobody responds externally.
- The verification result is reproducible from the repository, fixture, PR, or checklist.
- Distribution asks for one behavior, not generic attention.
- The final note names the next evidence needed instead of claiming validation too early.

## Output Template

```markdown
## Weekly Income Experiment Plan

### Selected experiment
-

### Why this over the alternatives
-

### Artifact
-

### Verification run
-

### Distribution or handoff
-

### Decision
Continue / Narrow / Stop / Switch because ...

### Next evidence needed
-
```

## References

- Use `references/trigger-examples.md` to distinguish good triggers from premature product-building.
- Pair with `ng-growth-income-asset-validation` when the user needs deeper buyer, offer, price, or outreach design.
