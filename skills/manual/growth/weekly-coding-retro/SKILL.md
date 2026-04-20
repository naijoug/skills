---
name: weekly-coding-retro
description: Use when doing a weekly engineering retrospective to identify recurring mistakes, debugging patterns, review feedback themes, and concrete improvement experiments for the next week
---

# Weekly Coding Retro

## Overview

Turn a week of coding work into specific improvement loops.

Core principle: reflect on repeated patterns, not isolated frustrations.

## When to Use

- Weekly personal learning review
- After a week with repeated bugs, rework, or slow delivery
- To convert PR feedback and incidents into practice goals

## When Not to Use

- User wants a project status report only
- There is no source material (commits, notes, PR feedback, incidents) and no recall

## Inputs (any subset)

- Commits / PRs
- Review comments
- Bugs and incidents
- Time sinks / blockers
- Notes from daily work

## Retro Workflow

1. Collect evidence
- What was shipped, fixed, or attempted
- Where time went (implementation, debugging, waiting, rework)

2. Spot patterns
- Repeated bug class (null handling, async races, off-by-one, schema mismatch)
- Repeated workflow friction (unclear requirements, weak tests, slow code reading)
- Repeated feedback theme (naming, API design, missing edge cases)

3. Find root causes
- Knowledge gap
- Process gap
- Tooling gap
- Habit/attention gap

4. Choose 1-3 experiments for next week
- Small, observable, and time-boxed
- Example: "Add test matrix before coding validators"
- Example: "Use root-cause template for every bug over 30 min"

5. Define success signals
- Fewer review comments of a type
- Faster bug time-to-root-cause
- Fewer regressions in changed modules

## Output Template

```markdown
## Weekly Coding Retro

### Wins
- ...

### Repeated Frictions / Mistakes
- Pattern:
- Evidence:
- Impact:

### Root Cause Hypotheses
- ...

### Next Week Experiments (1-3)
1. ...
2. ...

### Success Signals
- ...
```

## Quality Checklist

- Uses evidence from real work, not vibes only
- Focuses on repeated patterns
- Experiments are concrete and measurable
- Keeps improvement scope small for one week

## Example Triggers

- "Help me do a coding retrospective for this week"
- "Summarize my recurring engineering mistakes"
- "Turn review feedback into next-week practice goals"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
