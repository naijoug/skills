---
name: refactor-safely
description: Use when improving code structure without changing behavior and you need small reversible refactor steps, regression protection, and verification checkpoints
---

# Refactor Safely

## Overview

Refactor in small behavior-preserving steps with a safety net.

Core principle: separate structural changes from behavioral changes.

## When to Use

- Code smells reduce readability or maintainability
- Feature work is blocked by messy structure
- Duplicate logic needs consolidation
- Function/class/module is too large or tightly coupled

## When Not to Use

- Behavior needs to change (split into refactor + feature steps)
- There is no practical way to verify behavior equivalence yet

## Workflow

1. Define the refactor target
- Smell(s): duplication, long function, mixed concerns, hidden state, naming drift
- Desired end state (what becomes clearer/simpler)

2. Create a safety net
- Existing tests to rely on
- Add characterization tests for current behavior
- Capture before/after samples or snapshots if tests are weak

3. Slice into reversible steps
- Rename for clarity
- Extract pure functions
- Introduce seams/interfaces
- Move code without logic changes
- Replace duplication with shared abstraction

4. Verify at each slice
- Run focused tests
- Sanity-check logs/output
- Keep diffs small and reviewable

5. Stop before over-abstraction
- Prefer one obvious improvement over a framework
- Leave TODOs for future design changes instead of speculative cleanup

## Output Template

```markdown
## Refactor Plan

### Current Problems
- ...

### Safety Net
- Existing tests:
- New characterization tests:
- Manual checks:

### Step Plan (small/reversible)
1. ...
2. ...
3. ...

### Verification Per Step
- Command/check:
- Expected:

### Risks / Non-Goals
- ...
```

## Quality Checklist

- Behavioral changes are explicitly out of scope
- Characterization coverage exists for risky areas
- Steps are reversible and independently verifiable
- Abstraction is justified by current duplication/complexity

## Example Triggers

- "Help me refactor this without changing behavior"
- "Break down this giant function safely"
- "How should I sequence this cleanup?"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
