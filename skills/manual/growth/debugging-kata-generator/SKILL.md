---
name: debugging-kata-generator
description: Use when creating deliberate debugging exercises, bug drills, or practice incidents and you need realistic failure scenarios, clues, and an optional answer key with escalating difficulty
---

# Debugging Kata Generator

## Overview

Generate practice debugging scenarios that train diagnosis, not memorization.

Core principle: the exercise should contain enough evidence to investigate, but not an obvious spoiler.

## When to Use

- Personal debugging practice sessions
- Mentoring/debugging workshops
- Team training on incident triage and root-cause analysis

## When Not to Use

- A real production incident is happening now (use real debugging workflow)
- User wants a solved tutorial instead of a practice scenario

## Scenario Design Dimensions

- Domain: API, frontend state bug, async race, data pipeline, DB query, CI failure
- Difficulty: beginner / intermediate / advanced
- Failure mode: crash, wrong result, timeout, flaky test, memory leak, stale cache
- Evidence type: logs, stack trace, failing test, metrics, repro steps, code diff

## Generation Workflow

1. Pick learning objective
- Example: isolate race conditions
- Example: distinguish validation vs persistence bug

2. Create realistic symptoms
- What the learner observes first
- Frequency and impact
- Constraints (env-specific, data-specific, timing-specific)

3. Seed clues and noise
- 2-4 useful clues
- 1-2 misleading but plausible distractions

4. Define solution path
- Root cause mechanism
- Expected debugging steps
- Minimal fix and verification

5. Package exercise
- Prompt shown to learner
- Optional hints (tiered)
- Answer key (hidden unless requested)

## Output Template

```markdown
## Debugging Kata

### Scenario Prompt (for learner)
- Context:
- Symptoms:
- Available evidence:
- Goal:

### Hints (tiered)
1. High-level direction
2. Intermediate clue
3. Concrete nudge

### Answer Key (reveal on request)
- Root cause:
- Why symptoms match:
- Recommended fix:
- Verification:
```

## Quality Checklist

- Scenario is solvable from provided evidence
- Root cause is specific and technically plausible
- Hints escalate gradually
- Exercise trains reasoning, not trivia

## Example Triggers

- "Generate a debugging kata about flaky tests"
- "Create a backend incident practice exercise"
- "Make a debugging drill with hints and answer key"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
