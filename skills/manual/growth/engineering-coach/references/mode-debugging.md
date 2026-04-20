# Debugging Mode

Core principle: do not "fix" what has not been reproduced and narrowed.

## Workflow

1. **Define the failure precisely**
   - Expected behavior
   - Actual behavior
   - Scope (who/where/how often)
   - First known occurrence and recent changes

2. **Build a minimal reproduction**
   - Smallest input, environment, and sequence that still fails
   - Record exact steps and observed output
   - If no repro yet, list blockers and next probes

3. **Generate hypotheses**
   - Prefer 3-5 ranked hypotheses
   - Tie each hypothesis to an observable signal
   - Avoid implementation changes during this step

4. **Design validation experiments**
   - Logs, breakpoints, metrics, feature flags, binary search, isolated tests
   - One experiment per hypothesis where possible
   - Define what result would confirm or reject the hypothesis

5. **Narrow to root cause**
   - State the exact mechanism, not just the file or function
   - Explain why it causes the reported symptoms
   - Note why other hypotheses were rejected

6. **Propose fix and verification**
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
