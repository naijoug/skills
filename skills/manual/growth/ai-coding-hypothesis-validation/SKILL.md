---
name: ng-growth-ai-coding-hypothesis-validation
description: Use when an AI-era programmer needs to turn a code change, bug investigation, or documentation fix into a deliberate practice loop by writing a falsifiable human hypothesis before asking an agent to act, then deciding from real verification output
---

# AI Coding Hypothesis Validation

## Overview

Use this skill when you are about to let an agent change code, tests, docs, or workflow assets and you want the work to improve your own engineering judgment instead of becoming passive delegation.

The core rule is simple: write the human hypothesis before the agent acts, then let real failure output or proof output decide whether to continue, narrow, stop, or switch.

This is useful for AI-era programmers who want reusable practice, not just faster diffs.

## When to Use

- You have a small bug, flaky command, confusing failure output, review finding, or documentation gap.
- You can verify the result with a command, test, fixture, build, checker, or explicit human-review checklist.
- You want to preserve what the human noticed before the agent proposed a fix.
- You are turning a one-off task into a reusable tutorial, card, skill, or review pattern.

## When Not to Use

- The task is a rote edit with no uncertainty and no useful learning signal.
- You cannot run or define any verification method.
- The next step depends on private data, publishing permission, or user feedback that is not available.
- You would need to invent failure output, demand signal, maintainer feedback, or customer evidence.

## Workflow

### 1. Freeze the human hypothesis

Before asking the agent to edit, write four lines:

```text
Observation:
Human hypothesis before agent:
What would change my mind:
Verification command or checklist:
```

Make the hypothesis falsifiable. Good hypotheses predict which file, boundary, command, or behavior should change. Weak hypotheses say only "improve this" or "make it cleaner".

### 2. Bound the agent task

Give the agent a narrow task:

- target path or path pattern;
- files that must not be touched;
- smallest acceptable change;
- verification command;
- what to do if verification fails.

If the worktree is dirty, explicitly list the dirty paths you are not taking over. Do not let the agent normalize unrelated changes.

### 3. Compare proposal to hypothesis

After the agent proposes or edits, record:

| Question | Answer |
| --- | --- |
| Did the proposal address the original observation? |  |
| Did it preserve the ownership boundary? |  |
| Did it add a smaller proof than the implementation? |  |
| What did the agent assume that the human did not verify? |  |

This prevents a plausible-looking diff from replacing the reasoning step.

### 4. Let output change the plan

Run the planned verification. Then choose one decision:

| Decision | Use when | Next action |
| --- | --- | --- |
| Continue | The output supports the hypothesis and the artifact is useful | Commit the narrow slice and record next drill |
| Narrow | The output supports only a smaller claim | Rewrite the claim and keep the smaller artifact |
| Stop | Verification is unavailable, unrelated, or too expensive | Revert the speculative slice or leave only notes |
| Switch | The reusable learning is real but the original task is blocked | Move the learning into a doc, card, or skill and choose a new task |

Do not expand the tool or framework just because a failure output exists. First ask whether the existing output is already enough to locate the issue.

### 5. Preserve the learning asset

At the end, write a short practice note using this structure:

```markdown
## AI Coding Hypothesis Validation Note

### Observation
-

### Human hypothesis before agent
-

### Agent proposal summary
-

### Verification output
- Command/check:
- Result:
- Did the output change the plan? yes/no, because ...

### What I learned that the agent did not own
-

### Decision: Continue / Narrow / Stop / Switch
-

### Next drill
-
```

Store the note where it becomes useful: `docs/` for tutorials, `books/` for durable cards, or `skills/skills/` for repeatable operational workflows.

## Quality Bar

- The hypothesis is written before the agent changes the artifact.
- The verification is real, not inferred from the agent's explanation.
- The final decision names `Continue`, `Narrow`, `Stop`, or `Switch`.
- The record separates facts from inferences and avoids absolute local paths.
- The next drill is smaller than the current ambition, not a vague promise to keep improving.

## Quick Prompt

```text
We are doing AI coding hypothesis validation.

Observation: <what I saw>
Human hypothesis before agent: <falsifiable explanation>
What would change my mind: <output or counterexample>
Verification command/checklist: <command>

Please propose the smallest change. Do not touch: <paths>. If verification fails, summarize the failure and choose Continue / Narrow / Stop / Switch instead of expanding scope automatically.
```

## Related Assets

- `docs/documents/trending/ai/human-hypothesis-validation-ai-coding.md`
- `docs/documents/trending/ai/failure-output-driven-ai-coding-drill.md`
- `books/tech-cards-handbook/chapters/ai-agent/human-hypothesis-before-agent.md`
- `books/tech-cards-handbook/chapters/ai-agent/failure-output-must-change-plan.md`
