---
name: design-pattern-application-coach
description: Use when practicing or reviewing software design patterns in real code and you need help deciding whether a pattern fits, what trade-offs it brings, and when to avoid it
---

# Design Pattern Application Coach

## Overview

Coach pattern usage as a decision exercise, not a memorization exercise.

Core principle: start from forces and constraints, then choose (or reject) a pattern.

## When to Use

- Learning when to apply design patterns in practice
- Reviewing a refactor proposal that introduces a pattern
- Comparing multiple patterns for the same problem
- Avoiding overengineering in object-oriented or modular designs

## When Not to Use

- User only wants textbook definitions of patterns
- The problem is too small and no abstraction decision is needed

## Coaching Workflow

1. Frame the design pressure
- What changes frequently?
- What must stay stable?
- What variation points exist?
- What pain is current code causing?

2. Generate options
- No pattern / simpler refactor
- Pattern A
- Pattern B

3. Evaluate trade-offs
- Complexity cost
- Testability
- Readability for the team
- Extension flexibility
- Runtime/perf implications (if relevant)

4. Decide and scope
- Minimum patternized solution
- Clear non-goals to avoid framework creep

5. Reflect after implementation (optional)
- Did the pattern reduce pain?
- What signs would justify removing or simplifying it later?

## Output Template

```markdown
## Pattern Coaching

### Problem Pressure
- Current pain:
- Variations to support:
- Constraints:

### Options Compared
1. Simpler/no-pattern option
2. Pattern option A
3. Pattern option B

### Recommendation
- Choice:
- Why:
- Trade-offs accepted:
- Non-goals:

### Review Checklist
- Overengineering risks:
- Naming and boundaries:
- Tests to add:
```

## Pattern Prompts to Encourage

- "What pattern, if any, fits this problem?"
- "Convince me not to use a pattern here"
- "Compare Strategy vs State for this case"

## Example Triggers

- "Help me decide whether to use Observer here"
- "Practice applying design patterns with trade-offs"
- "Review this refactor idea for overengineering"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
