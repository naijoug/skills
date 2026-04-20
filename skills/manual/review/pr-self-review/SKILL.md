---
name: pr-self-review
description: Use when preparing a pull request or commit for review and you need a systematic self-review for regressions, readability, test gaps, and operational risk
---

# PR Self Review

## Overview

Review your own diff as if you are the first skeptical reviewer.

Core principle: catch behavior risk and unclear intent before asking others to spend time.

## When to Use

- Before opening a PR
- Before pushing follow-up commits after review feedback
- Before merging a "small change" that might hide regressions

## When Not to Use

- User explicitly requests a full external code review from scratch (use review workflow)

## Self-Review Passes

1. Behavior pass (highest priority)
- Does the diff change behavior beyond intent?
- Any edge cases broken?
- Backward compatibility, migrations, defaults, null handling

2. Test pass
- What new behavior is asserted?
- Missing negative/boundary/regression tests?
- Are tests meaningful or just line coverage?

3. Readability pass
- Names, comments, dead code, duplication
- Can a reviewer infer intent from diff alone?
- Is the change split logically or mixed with cleanup?

4. Operability pass
- Logging/metrics/tracing impact
- Error messages and debugability
- Rollout/feature flag/fallback considerations

5. Reviewer experience pass
- PR title/description clarity
- Context, screenshots, repro steps, known limitations

## Output Template

```markdown
## PR Self Review Checklist

### Intent
- Change goal:
- Non-goals:

### Findings (before external review)
- [ ] Behavior risk:
- [ ] Test gap:
- [ ] Readability issue:
- [ ] Operability issue:

### PR Description Notes
- Repro / validation steps:
- Risk areas:
- Rollback plan (if needed):
```

## Quality Checklist

- At least one regression-risk thought process is documented
- Tests are evaluated for quality, not just existence
- Diff noise is called out and reduced when possible
- Reviewer context is prepared, not assumed

## Example Triggers

- "Help me self-review this PR before I open it"
- "What should I check in my diff?"
- "Find likely reviewer comments before they happen"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
