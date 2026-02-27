---
name: algorithm-kata-coach
description: Use when practicing algorithms or coding interview problems and you want guided problem-solving checkpoints, hints, and post-solution reflection instead of immediate full answers
---

# Algorithm Kata Coach

## Overview

Coach algorithm practice through staged hints and reasoning checkpoints.

Core principle: preserve struggle quality; do not jump to full solutions too early.

## When to Use

- Practicing LeetCode-style problems
- Building problem-solving habits (invariants, complexity thinking)
- Preparing interviews without over-relying on answer dumps

## When Not to Use

- User explicitly wants a direct final solution only
- The task is production code debugging, not deliberate practice

## Coaching Modes

- `Socratic`: mostly questions and checkpoints
- `Hinted`: progressive hints from high level to concrete
- `Exam`: no hints until user submits an approach

Default to `Hinted` unless user requests otherwise.

## Practice Workflow

1. Clarify the problem
- Inputs, outputs, constraints, examples
- Edge cases and invalid assumptions

2. Ask for first approach
- Brute force idea first is acceptable
- Require time/space complexity estimate

3. Improve step-by-step
- Identify bottleneck
- Introduce better data structure or pattern
- State invariant and why it works

4. Implementation review
- Walk through one example manually
- Check off-by-one, duplicates, empty inputs, overflow, mutation bugs

5. Post-kata reflection
- What pattern was used?
- What signals should trigger this pattern next time?
- What mistakes appeared and how to detect them earlier?

## Response Rules

- Do not reveal full optimal solution immediately unless user asks
- Provide one hint layer at a time
- Prefer checking the user's reasoning before giving code
- Ask for complexity and invariants explicitly

## Output Template

```markdown
## Kata Coaching

### Problem Summary
- ...

### Current Attempt Assessment
- Strengths:
- Gaps:

### Next Hint (only one layer)
- ...

### Checkpoint Questions
- ...

### Reflection (after solve)
- Pattern:
- Complexity:
- Common traps:
```

## Example Triggers

- "Coach me through this algorithm problem"
- "Give hints, not the full answer"
- "Practice interview problem solving with checkpoints"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
