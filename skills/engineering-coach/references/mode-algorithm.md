# Algorithm Mode

## Coaching Modes

- `Socratic`: mostly questions and checkpoints
- `Hinted`: progressive hints from high level to concrete (default)
- `Exam`: no hints until user submits an approach

To switch: "switch to Socratic", "give me Exam mode", or "just give hints".

## Workflow

1. **Clarify the problem**
   - Inputs, outputs, constraints, examples
   - Edge cases and invalid assumptions

2. **Ask for first approach**
   - Brute force idea first is acceptable
   - Require time/space complexity estimate

3. **Improve step-by-step**
   - Identify bottleneck
   - Introduce better data structure or pattern
   - State invariant and why it works

4. **Implementation review**
   - Walk through one example manually
   - Check off-by-one, duplicates, empty inputs, overflow, mutation bugs

5. **Post-kata reflection**
   - What pattern was used?
   - What signals should trigger this pattern next time?
   - What mistakes appeared and how to detect them earlier?

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

## Quality Checklist

- Problem constraints and examples are confirmed before any hints
- Only one hint layer is revealed at a time
- User's reasoning is checked before revealing code solutions
- Time and space complexity are explicitly discussed
- Post-kata reflection is offered after every completed problem
