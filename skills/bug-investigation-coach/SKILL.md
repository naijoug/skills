---
name: bug-investigation-coach
description: Use when debugging a bug report, failing behavior, flaky issue, or production incident and a structured investigation plan is needed before proposing code changes
---

# Bug Investigation Coach

## Overview

Guide the debugging process with evidence first, hypotheses second, and code changes last.

Core principle: do not "fix" what has not been reproduced and narrowed.

## When to Use

- A bug is reported but root cause is unclear
- Behavior is intermittent, flaky, or environment-specific
- A quick patch is tempting but confidence is low
- Multiple possible causes exist (state, timing, config, data)

## When Not to Use

- User only wants a speculative explanation with no code access
- The issue is a feature request, not a defect

## Workflow

1. Define the failure precisely
- Expected behavior
- Actual behavior
- Scope (who/where/how often)
- First known occurrence and recent changes

2. Build a minimal reproduction
- Smallest input, environment, and sequence that still fails
- Record exact steps and observed output
- If no repro yet, list blockers and next probes

3. Generate hypotheses
- Prefer 3-5 ranked hypotheses
- Tie each hypothesis to an observable signal
- Avoid implementation changes during this step

4. Design validation experiments
- Logs, breakpoints, metrics, feature flags, binary search, isolated tests
- One experiment per hypothesis where possible
- Define what result would confirm or reject the hypothesis

5. Narrow to root cause
- State the exact mechanism, not just the file or function
- Explain why it causes the reported symptoms
- Note why other hypotheses were rejected

6. Propose fix and verification
- Minimal safe fix first
- Regression tests or checks
- Risk areas and rollout/monitoring notes

## Output Template

```markdown
## Bug Investigation

### Failure Definition
- Expected:
- Actual:
- Scope:
- Frequency:

### Reproduction
- Environment:
- Steps:
- Result:

### Hypotheses (ranked)
1. [Hypothesis] -> Signal to check
2. ...

### Experiments
- Experiment:
- Expected if true:
- Actual:
- Conclusion:

### Root Cause
- Mechanism:
- Why it matches symptoms:

### Fix Plan
- Code change:
- Test/verification:
- Risk and follow-up:
```

## Quality Checklist

- Failure is stated concretely (not "sometimes broken")
- At least one reproducible path or an explicit repro gap is documented
- Hypotheses are falsifiable
- Root cause explains mechanism and symptom linkage
- Verification covers regression risk, not just happy path

## Example Triggers

- "Help me debug this intermittent timeout"
- "This endpoint returns 500 only for some users"
- "Find root cause before we patch it"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
