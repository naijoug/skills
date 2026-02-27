---
name: code-reading-accelerator
description: Use when onboarding to an unfamiliar codebase, tracing a feature flow, or understanding a module quickly and you need a structured reading order and architecture map
---

# Code Reading Accelerator

## Overview

Accelerate understanding by building a map first, then tracing one concrete path end to end.

Core principle: read for decisions and data flow, not line-by-line completeness.

## When to Use

- New repo or legacy module handoff
- Need to modify code safely but context is missing
- Investigating "where does this value come from?" or "who calls this?"
- Preparing for debugging, refactoring, or feature work

## When Not to Use

- User already asks for a focused code change with clear file targets
- The task is pure syntax/library explanation without project context

## Reading Strategy

1. Establish the outer frame
- Repo purpose, runtime model, entry points, build/test commands
- Main apps/services/packages and boundaries

2. Choose one target question
- Example: "How request X becomes response Y"
- Example: "How job scheduling retries work"

3. Trace the execution path
- Entry point -> routing/dispatch -> business logic -> data access -> side effects
- Capture key functions and file paths only

4. Track the data shape
- Request DTOs, domain models, persistence schema, response shape
- Conversions and validation points

5. Identify control points
- Feature flags, config, branching logic, retries, error handling
- Caches, queues, background workers, transactions

6. Summarize a mental model
- What owns what
- Where invariants are enforced
- Safe extension points and risky areas

## Output Template

```markdown
## Code Reading Notes

### Goal Question
- ...

### Module Map
- Entry points:
- Core services/modules:
- Data stores/external deps:

### End-to-End Flow
1. ...
2. ...
3. ...

### Data Flow
- Input shape:
- Internal model(s):
- Output shape:

### Risk / Confusion Points
- ...

### Next Files to Read
- ...
```

## Quality Checklist

- Reading goal is explicit (not "understand everything")
- Flow includes both control path and data path
- Notes distinguish facts vs assumptions
- Summary includes extension/risk hints for future edits

## Example Triggers

- "Help me understand this codebase fast"
- "Map the request flow for this endpoint"
- "Where is this event produced and consumed?"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
