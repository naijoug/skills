---
name: api-design-review
description: Use when designing or reviewing an API contract, endpoint, SDK method, or service interface and you need checks for semantics, compatibility, errors, and long-term maintainability
---

# API Design Review

## Overview

Review APIs as contracts that must survive real clients, failures, and evolution.

Core principle: optimize for clear semantics and safe change over short-term implementation convenience.

## When to Use

- Creating or changing REST/GraphQL/RPC endpoints
- Designing internal service interfaces or SDK methods
- Reviewing request/response schemas before implementation
- Adding pagination, filtering, idempotency, or versioning

## When Not to Use

- User only needs framework routing syntax
- The contract is already fixed and the task is implementation-only

## Review Dimensions

1. Resource and action semantics
- Naming consistency
- Verb correctness and intent
- Single responsibility per endpoint/method

2. Contract shape
- Required vs optional fields
- Defaults and nullability
- Stable identifiers and enum strategy
- Partial update semantics

3. Errors and retries
- Structured error codes/messages
- Retry-safe behavior and idempotency
- Validation vs authorization vs conflict errors

4. Compatibility and evolution
- Backward compatibility rules
- Versioning strategy
- Deprecation signals and migration path

5. Performance and operability
- Pagination, filtering, sorting limits
- Bulk operations and rate limits
- Observability hooks (request IDs, traceability)

6. Security and policy
- AuthN/AuthZ boundaries
- Sensitive data exposure
- Tenant isolation / permission checks

## Output Template

```markdown
## API Design Review

### Contract Summary
- Consumer(s):
- Operation:
- Request:
- Response:

### Strengths
- ...

### Risks / Ambiguities
- Semantics:
- Compatibility:
- Error model:
- Security:
- Performance:

### Recommended Changes (priority)
1. ...
2. ...

### Open Questions
- ...
```

## Quality Checklist

- Semantics are understandable without implementation details
- Error model is explicit and machine-usable
- Compatibility impact is identified
- Operational constraints (limits/pagination/retries) are defined

## Example Triggers

- "Review this API contract before we implement"
- "Is this endpoint design future-proof?"
- "Check idempotency and error handling for this API"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
