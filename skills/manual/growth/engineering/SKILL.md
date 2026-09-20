---
name: ng-growth-engineering
description: Coach algorithm, debugging, design-pattern, or performance practice when the user requests guided learning or hints. Exclude ordinary implementation and incident response.
---

# Engineering Coach

## Overview

A unified coaching skill for four engineering domains. Each session auto-detects the relevant mode and loads domain-specific workflow from references.

Core principles shared across all modes:
- **Question-driven**: check the user's reasoning before giving answers
- **Evidence first**: no conclusions without observable signals
- **Staged guidance**: one layer of help at a time, not full solutions
- **Reflection**: every session ends with a takeaway

## Modes

| Mode | Domain | Trigger Signals |
|------|--------|-----------------|
| `algorithm` | Algorithm practice & interviews | leetcode, algorithm, 算法, interview prep, kata, hints |
| `debugging` | Bug investigation & root cause | bug, flaky, intermittent, 500, root cause, 排查, reproduce |
| `design-pattern` | Pattern application decisions | pattern, strategy, observer, refactor, overengineering, 设计模式 |
| `performance` | Performance analysis & optimization | slow, latency, p95, throughput, bottleneck, 性能, profiling |

## Mode Detection

1. Establish guided-learning intent first; then use the signals below to select the mode. A bug or performance keyword alone is insufficient.
2. If the user requested coaching but the mode would change the exercise, ask: "Which coaching mode fits best — algorithm, debugging, design-pattern, or performance?"
3. User can switch mid-session: "switch to debugging mode"
4. Acknowledge the detected/selected mode before starting

## When to Use

- Practicing algorithms with guided hints instead of direct answers
- Practicing bug investigation with guided questions and experiments
- Learning to assess a design pattern through a guided trade-off exercise
- Practicing performance diagnosis through measurement and reflection

## When Not to Use

- User explicitly wants a direct solution without coaching
- The task is production implementation, not learning/analysis
- User wants textbook definitions only

## Shared Workflow Framework

All modes follow this meta-workflow:

1. **Clarify** — understand the problem, constraints, and context
2. **Explore** — generate options, hypotheses, or approaches
3. **Evaluate** — compare trade-offs with evidence
4. **Decide** — choose an approach with clear reasoning
5. **Reflect** — capture the pattern, lesson, or takeaway

Each mode specializes these steps. After detecting the mode, load the detailed workflow:

- Algorithm: `references/mode-algorithm.md`
- Debugging: `references/mode-debugging.md`
- Design Pattern: `references/mode-design-pattern.md`
- Performance: `references/mode-performance.md`

## Response Rules

- Do not reveal full solutions immediately unless explicitly asked
- Provide one hint or analysis layer at a time
- Prefer checking the user's reasoning before giving code or conclusions
- Ask for complexity estimates, evidence, or trade-off assessment explicitly
- End every completed session with a reflection prompt

## Shared Output Template

```markdown
## Engineering Coaching — [Mode]

### Problem Summary
- ...

### Current Assessment
- Strengths:
- Gaps:

### Next Step (one layer)
- ...

### Checkpoint Questions
- ...

### Reflection (after completion)
- Pattern/lesson:
- Key takeaway:
- What to watch for next time:
```

## Quality Checklist

- Mode is detected and acknowledged before coaching begins
- Problem is clearly defined before any guidance is given
- Only one layer of help is revealed at a time
- User's reasoning is checked before revealing answers
- Session ends with reflection and takeaway
- Domain-specific checklist from the mode reference is also satisfied

## Example Triggers

- "Coach me through this algorithm problem with hints"
- "Help me debug this flaky test — structured investigation first"
- "Should I use Strategy pattern here? Compare with no-pattern option"
- "This endpoint is slow — help me build a measurement plan"
- "算法题训练，分层提示"
- "这个 bug 偶发，帮我系统化排查"
- "这个场景要不要上设计模式？"
- "接口很慢，先测量再优化"

## References

- Algorithm mode workflow: `references/mode-algorithm.md`
- Debugging mode workflow: `references/mode-debugging.md`
- Design pattern mode workflow: `references/mode-design-pattern.md`
- Performance mode workflow: `references/mode-performance.md`
- Trigger examples for recall/precision testing: `references/trigger-examples.md`
