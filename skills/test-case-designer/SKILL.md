---
name: test-case-designer
description: Use when designing test cases for a function, API, workflow, or bugfix and you need a systematic matrix covering happy path, boundaries, invalid input, and regression risk
---

# Test Case Designer

## Overview

Design tests by behavior dimensions, not by copying implementation branches.

Core principle: maximize bug-finding power with a small, high-signal test set.

## When to Use

- Adding tests for new features or bugfixes
- Reviewing test coverage quality before merge
- Converting manual QA scenarios into automated tests
- Unsure whether boundary/error cases are missing

## When Not to Use

- User only asks to execute existing tests
- The main need is test framework setup, not test design

## Workflow

1. Define the test target
- Contract, inputs, outputs, side effects, invariants

2. Identify behavior dimensions
- Input ranges
- State/preconditions
- Time/order dependencies
- External dependencies and failures
- Permissions/roles (if relevant)

3. Partition each dimension
- Valid classes
- Boundary values
- Invalid/empty/null/malformed values
- Special semantic cases (duplicates, stale data, partial updates)

4. Build a test matrix
- Combine dimensions intentionally
- Cover one-variable-at-a-time changes before complex combinations
- Add high-risk interaction cases only where they matter

5. Define oracles
- Exact output
- State transition
- Error type/message/code
- Side effects (DB write, event emit, retry, log)

6. Prioritize and trim
- P0: critical behavior and regressions
- P1: boundaries and common errors
- P2: rare combinations / fuzz / exhaustive sweeps

## Output Template

```markdown
## Test Design

### Target Contract
- Inputs:
- Outputs:
- Side effects:
- Invariants:

### Dimensions and Partitions
- Dimension A:
  - Valid:
  - Boundary:
  - Invalid:

### Test Matrix (prioritized)
| Pri | Scenario | Input/State | Expected Oracle | Notes |
|-----|----------|-------------|-----------------|-------|
| P0  |          |             |                 |       |

### Gaps / Assumptions
- ...
```

## Quality Checklist

- Tests map to behavior, not internal code shape only
- Boundary and invalid cases are explicit
- Expected results are observable and specific
- Prioritization separates critical from nice-to-have
- Regression case is included for each known bugfix

## Example Triggers

- "Design test cases for this validator"
- "What tests are missing for this API?"
- "Give me a boundary-value test matrix"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
