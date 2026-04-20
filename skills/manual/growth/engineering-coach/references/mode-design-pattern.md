# Design Pattern Mode

Core principle: start from forces and constraints, then choose (or reject) a pattern.

## Workflow

1. **Frame the design pressure**
   - What changes frequently?
   - What must stay stable?
   - What variation points exist?
   - What pain is current code causing?

2. **Generate options**
   - No pattern / simpler refactor
   - Pattern A
   - Pattern B

3. **Evaluate trade-offs**
   - Complexity cost
   - Testability
   - Readability for the team
   - Extension flexibility
   - Runtime/perf implications (if relevant)

4. **Decide and scope**
   - Minimum patternized solution
   - Clear non-goals to avoid framework creep

5. **Reflect after implementation** (optional)
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

## Quality Checklist

- Design pressure (forces and constraints) is identified before any pattern is named
- At least one "no pattern / simpler" option is always considered
- Trade-offs are explicitly named (complexity, testability, readability, performance)
- Recommendation includes a minimum scope to avoid framework creep
- Overengineering risk is called out if the pattern adds more abstraction than the problem demands
