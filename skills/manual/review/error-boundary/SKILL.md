---
name: ng-review-error-boundary
description: Use when reviewing service, repository, handler, CLI, or SDK adapter error handling and you need to verify classification, context preservation, retry/degrade policy, and safe public error codes
---

# Error Boundary Review

## Overview

Review error handling as a cross-boundary contract, not as local `catch` / `if err != nil` cleanup.

Core principle: every failure that crosses a service, repository, handler, CLI, or SDK adapter boundary should preserve diagnostics for operators while giving callers stable, domain-level decisions.

## When to Use

- Reviewing error handling in service, repository, handler, CLI command, job worker, or external SDK adapter code
- Checking whether callers can distinguish retry, degrade, user-visible error, and internal failure paths
- Designing or repairing public error responses, error codes, retry policies, or fallback behavior
- Auditing whether SQL state, driver names, file paths, hostnames, or third-party error strings leak outside the adapter boundary

## When Not to Use

- The task is only about syntax for a language's exception or result mechanism
- There is no concrete module, diff, or error-flow design to review
- The user asks for general API contract review rather than error handling specifically; use `ng-review-api-design` first, then this skill for the error model

## Review Workflow

1. **Map the boundary**
   - Identify producer, adapter, domain/service layer, caller, and public response/logging boundary.
   - List the external systems involved: database, filesystem, network API, queue, SDK, cache, or subprocess.
   - Capture the current error path from lowest-level failure to caller-visible behavior.

2. **Check failure typing**
   - Confirm possible failures appear in signatures or documented contract (`Result<T, E>`, Go `error`, typed exceptions, discriminated unions, custom error classes).
   - Flag empty values, booleans, `None`, `{}`, magic strings, or naked `panic`/`throw Error` used as failure signals.

3. **Check context preservation**
   - Verify each layer adds "doing what / for whom" context without discarding the root cause.
   - Look for Go `%w`, Python `raise ... from error`, Rust enum variants with source/context, TypeScript `cause` / `inner` fields, or equivalent structured chaining.
   - When one language dominates the diff, use `references/language-probes.md` for focused red flags and positive patterns.

4. **Check stable classification**
   - Ask whether the caller can classify retryable, degradable, user-correctable, conflict/not-found, and internal failure without parsing strings.
   - Prefer domain errors, sentinel errors, enum variants, custom exception hierarchy, or discriminated unions over `contains("timeout")`-style checks.

5. **Check recovery policy ownership**
   - Retry policy should name retryable errors, max attempts, backoff, and exhausted behavior.
   - Degradation should live at the caller that owns business tolerance, not inside a low-level client silently returning default data.
   - Unknown or non-degradable errors should continue upward with preserved context.

6. **Check public error safety**
   - Public responses should use domain-defined error codes/messages.
   - SQL state, index names, connection strings, hostnames, file paths, SDK class names, stack traces, and raw driver messages belong in logs/traces, not user-visible messages.

7. **Build the decision table**
   - Produce or update a table with these columns: `底层错误`, `领域错误`, `调用方动作`, `重试/降级策略`, `对外消息`, `证据/测试`.
   - If no table exists, create the minimum table for the reviewed module before recommending broad refactors.

8. **Calibrate against the sample output when uncertain**
   - If the review feels too generic, compare it with `references/sample-review-output.md`.
   - Make sure the final review catches the three frequent misses: public SQL/SDK leakage, lost cause chains, and hidden retry/degrade ownership.

9. **Run the lightweight regression check after editing this skill**
   - From this skill directory, run `python3 scripts/validate_error_boundary_skill.py`.
   - The script checks required references, trigger keywords, sample-output markers, language probe sections, version metadata, and accidental absolute user paths.

## Output Template

```markdown
## Error Boundary Review

### Scope
- Module / boundary:
- Caller(s):
- External dependency:

### Decision Table
| 底层错误 | 领域错误 | 调用方动作 | 重试/降级策略 | 对外消息 | 证据/测试 |
|---|---|---|---|---|---|
| | | | | | |

### Findings
| Priority | Checkpoint | Finding | Risk | Recommended fix |
|---|---|---|---|---|
| P0 | Public error safety | | | |
| P1 | Classification / recovery | | | |
| P2 | Context / typing | | | |

### Suggested Tests
- [ ] Classification test:
- [ ] Retry/degrade test:
- [ ] Public response redaction test:
- [ ] Cause/context preservation test:
```

## Priority Guide

- **P0**: public error leaks internal details or makes clients depend on SQL/driver/SDK internals.
- **P1**: callers cannot classify retry/degrade/escalate paths, or retry/degrade behavior is hidden in the wrong layer.
- **P2**: root cause/context is lost, failure is represented by empty values, or tests only cover happy path.
- **P3**: policy knobs exist but are hard-coded or insufficiently observable.

## Quality Checklist

- A concrete error path is mapped from dependency failure to caller-visible behavior.
- Findings distinguish operator diagnostics from public responses.
- Recommendations include stable domain error types/codes, not only better messages.
- Retry and degradation decisions are tied to caller ownership and covered by tests.
- The final answer includes a decision table or explains why the module is too small to need one.

## Example Triggers

- "Review this service's error handling and fallback logic."
- "Check whether this repository leaks database errors to the API."
- "Our handler returns raw SDK errors; design a safer error boundary."
- "帮我审查这段错误处理，重点看重试、降级和错误码是否稳定。"

## References

- Source checklist in this workspace: `books/tech-cards-handbook/chapters/error-boundary-review-checklist.md`
- Language-specific probes and red flags: `references/language-probes.md`
- Sample review output and eval rubric: `references/sample-review-output.md`
- Trigger examples for recall/precision testing: `references/trigger-examples.md`
- Local regression check for this skill: `scripts/validate_error_boundary_skill.py`
