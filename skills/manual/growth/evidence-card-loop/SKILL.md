---
name: ng-growth-evidence-card-loop
description: Use when an AI-era programmer wants to turn learning, coding, writing, workflow, portfolio, or income experiments into evidence-backed capability assets instead of vague progress notes
---

# Evidence Card Loop

## Overview

Use this skill when a task is worth doing with AI, but the real goal is not only the immediate output. The goal is to leave a reusable capability asset: a task card, prompt, test output, review note, SOP, portfolio fragment, or next experiment that another person can inspect.

Core rule: every meaningful AI-assisted session should answer six questions:

```text
真实任务是什么？
输入材料是什么？
AI 被允许和禁止做什么？
人做了哪些判断？
验证证据是什么？
沉淀成了什么可复用资产？
```

This skill is useful for programmers entering the AI era who need compound growth, not just faster single-use output.

## When to Use

- You are learning a tool, framework, domain, or workflow with AI assistance.
- You are shipping a code, documentation, writing, automation, product, portfolio, or income experiment.
- You need a weekly review that distinguishes real progress from chat volume or tool novelty.
- You want to decide whether to continue, narrow, switch, or stop an experiment based on evidence.
- You are converting a one-off agent run into a reusable tutorial, checklist, template, skill, or public-safe case.

## When Not to Use

- The task is too small to justify a record and has no reusable learning signal.
- You cannot name any verification method or human-review standard.
- The work depends on private, employer, customer, or regulated data that cannot be summarized safely.
- You would have to invent users, metrics, feedback, command output, or demand evidence.

## Workflow

### 1. Pick one real task

Avoid starting from `learn AI`, `improve workflow`, or `make money`. Rewrite the task into one observable slice:

```text
For <who / which workflow>, use AI to improve <one concrete task>, and prove it with <one evidence type>.
```

Examples:

- `For my weekly blog workflow, use AI to turn one rough note into a publishable outline, and prove it with a before/after outline plus source links.`
- `For a small repo, use AI to fix one failing test, and prove it with the failing and passing command output.`
- `For a service idea, use AI to produce one audit sample, and prove it with a redacted checklist plus one real reviewer comment.`

### 2. Write the boundary before asking AI to act

Record what the agent can and cannot touch:

```text
Allowed inputs:
Disallowed inputs:
Allowed actions:
Disallowed actions:
Human approval points:
Failure rollback:
```

For code tasks, include paths, commands, and forbidden side effects. For writing or business tasks, include copyright, privacy, publication, payment, and external-contact boundaries.

### 3. Capture the evidence card

Use one card per meaningful session:

```markdown
## Evidence Card

### Task
- Real task:
- Intended user / workflow:
- Success standard:

### Inputs and boundary
- Input materials:
- Redacted / excluded materials:
- Allowed AI actions:
- Disallowed AI actions:
- Human approval points:
- Failure rollback:

### AI participation
- What AI generated, changed, searched, summarized, reviewed, or executed:
- What AI assumed that remains unverified:

### Human judgment
- What I accepted:
- What I rejected or rewrote:
- Final decision I own:

### Verification evidence
- Command / checklist / review method:
- Result:
- Remaining uncertainty:

### Asset created
- Reusable prompt / checklist / script / SOP / card / portfolio fragment:
- Where it lives:
- Next smaller experiment:
```

Keep evidence concrete. `Tests passed`, `reader liked it`, or `saved time` are claims; the card should point to the command, reviewer note, diff, timing comparison, source link, or artifact that supports the claim.

### 4. Decide from evidence, not enthusiasm

End with one decision:

| Decision | Use when | Next action |
| --- | --- | --- |
| Continue | Evidence shows the task improved and the asset can be reused | Repeat once on a similar task and compare results |
| Narrow | Evidence supports only a smaller claim | Shrink the task, boundary, or target user |
| Switch | The reusable learning is real, but the original path is weak | Move the asset into `docs/`, `books/`, or `skills/skills/` and test another path |
| Stop | Verification is missing, unsafe, or not worth the cost | Preserve the lesson and stop expanding the experiment |

Do not upgrade an experiment to a product, service, chapter, or workflow until at least one card has external evidence or repeated internal verification.

### 5. Review weekly for compounding assets

At the end of a week, review the cards with this rubric:

| Question | Good evidence | If missing, shrink next week to |
| --- | --- | --- |
| Did I work on real tasks? | Cards name actual code, documents, users, workflows, or decisions | One email, one bug, one note, one checklist |
| Did I bound AI clearly? | Inputs, allowed actions, disallowed actions, and approval points are explicit | Summary-only or draft-only AI use |
| Did I keep human judgment visible? | Accepted, rejected, and final-owned decisions are recorded | One decision point I must make manually |
| Did verification happen? | Command output, review note, source links, diff, or user feedback exists | One cheap check before any expansion |
| Did an asset compound? | Prompt, SOP, script, template, portfolio fragment, or skill was created or improved | One reusable template from the best card |

## Quality Bar

- The record uses relative paths when it names local files.
- The card separates AI participation from human judgment.
- The verification evidence is real and inspectable, not inferred from the agent's confidence.
- Private material is redacted or excluded before it becomes a public asset.
- The next experiment is smaller and sharper than the ambition that produced the current card.

## Quick Prompt

```text
Use the Evidence Card Loop.

Real task:
Input materials:
Allowed AI actions:
Disallowed AI actions:
Human approval points:
Verification method:

Help me complete the smallest useful slice, then produce an evidence card with: AI participation, human judgment, verification evidence, reusable asset, and Continue / Narrow / Switch / Stop decision. Do not invent results or feedback.
```

## Related Assets

- `skills/skills/manual/growth/ai-coding-hypothesis-validation/`
- `skills/skills/manual/review/audit-evidence-boundary/`
- `books/ai-personal-growth/chapters/10-30-day-action-handbook.md`
- `books/ai-personal-growth/chapters/08-ai-era-career-planning.md`
