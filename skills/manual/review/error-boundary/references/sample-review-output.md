# Sample Review Output

This reference is a compact eval case for `ng-review-error-boundary`. Use it to calibrate whether the skill catches three common misses:

1. leaking SQL / SDK internals to public responses;
2. losing the root cause chain while adding context;
3. hidden retry/degrade ownership, especially when a low-level adapter silently chooses fallback behavior.

## Input Snippet

```ts
async function getProfileResponse(userId: string): Promise<Response> {
  try {
    const row = await db.query("select display_name from profiles where user_id = $1", [userId]);
    return json({ displayName: row.display_name });
  } catch (error) {
    const message = String(error);

    if (message.includes("timeout")) {
      return json({ displayName: "Anonymous" });
    }

    return json({
      code: "DB_ERROR",
      message,
    }, 500);
  }
}
```

## Expected Skill Output Shape

```markdown
## Error Boundary Review

### Scope
- Module / boundary: profile query + HTTP handler
- Caller(s): frontend profile view
- External dependency: SQL database

### Decision Table
| 底层错误 | 领域错误 | 调用方动作 | 重试/降级策略 | 对外消息 | 证据/测试 |
|---|---|---|---|---|---|
| row not found | `ProfileMissing` | degrade to placeholder if product accepts it | handler-owned degrade, no retry | `{ code: "PROFILE_UNAVAILABLE" }` | missing-profile fixture returns safe placeholder |
| timeout / pool exhausted | `ProfileTemporaryUnavailable` | retry then degrade | bounded retry with backoff; degrade only after exhausted | `{ code: "PROFILE_TEMPORARY_UNAVAILABLE" }` | retry exhaustion test; no raw timeout text in response |
| SQL syntax / driver bug | `ProfileInternalFailure` | escalate | no degrade; preserve cause for logs | `{ code: "INTERNAL" }` | redaction test for SQLSTATE, table, host, driver class |

### Findings
| Priority | Checkpoint | Finding | Risk | Recommended fix |
|---|---|---|---|---|
| P0 | Public error safety | `message: String(error)` sends raw database text to clients. | Clients may see SQLSTATE, table names, hostnames, driver classes, or stack fragments. | Translate to domain codes/messages before response; log raw cause separately. |
| P1 | Classification / recovery | Timeout detection parses strings and returns fallback immediately inside the handler catch. | Different driver wording breaks behavior; retry/degrade policy is implicit and untested. | Introduce typed adapter errors and a decision table that names retryable/degradable cases. |
| P2 | Context / typing | The catch block discards the original cause when creating the response. | Operators cannot trace which query or dependency failed from the public error path alone. | Wrap with context and preserve `cause` / `inner` for logs/traces. |

### PR Comment Form
When this review becomes a PR comment, convert the top finding into the same short form used by `books/tech-cards-handbook/chapters/error-boundary-review-checklist.md`. If the PR needs multiple comments, keep each one focused on one failure mode and use P0 for public leakage, P1 for classification/recovery ownership, and P2 for context preservation:

```text
[error-boundary][P0] profile handler exposes raw database errors to API callers

Evidence: profile query + HTTP handler returns `{ code: "DB_ERROR", message: String(error) }` from the catch block.
Risk: API clients may see SQLSTATE, table/index names, hostnames, driver classes, or stack fragments; replacing the message later may also erase the root cause unless diagnostics are preserved separately.
Expected decision-table row:
- Underlying error/signal: row not found; timeout / pool exhausted; SQL syntax / driver bug
- Classification: typed adapter errors, not `message.includes("timeout")`
- Domain error: `ProfileMissing` / `ProfileTemporaryUnavailable` / `ProfileInternalFailure`
- Caller action: degrade only for approved missing-profile cases; retry bounded temporary failures; escalate internal failures
- Public code/message: `PROFILE_TEMPORARY_UNAVAILABLE` or `INTERNAL`, with no SQL/host/path/driver text
- Diagnostics location: `cause` / `inner`, structured log, trace span
Suggested tests: assert public responses do not contain `SQLSTATE`, table names, hostnames, driver classes, or stack fragments; assert logs/traces retain the original driver error as `cause` / `inner`; assert retry/degrade ownership is explicit.
```

```text
[error-boundary][P1] timeout recovery is classified by string parsing and owned by the handler catch block

Evidence: the handler checks `message.includes("timeout")` and immediately returns `{ displayName: "Anonymous" }` without a typed adapter error, retry budget, or decision-table row.
Risk: driver wording changes can skip the fallback or misclassify non-timeout failures; retry/degrade policy is hidden in ad hoc catch logic instead of being reviewable by callers.
Expected decision-table row:
- Underlying error/signal: timeout / pool exhausted from the profile database adapter
- Classification: typed `ProfileTemporaryUnavailable` or discriminated adapter error, not substring matching
- Domain error: `ProfileTemporaryUnavailable`
- Caller action: retry with bounded backoff, then degrade only if the profile view owns that business tolerance
- Public code/message: `PROFILE_TEMPORARY_UNAVAILABLE` or explicit degraded profile response with `degraded=true`
- Diagnostics location: original driver error as `cause` / `inner`, retry attempt count in structured logs/traces
Suggested tests: assert timeout and pool exhaustion map to the same retryable domain error; assert unknown driver messages do not silently degrade; assert retry exhaustion is observable and fallback ownership is tested.
```

```text
[error-boundary][P2] profile error response path discards the root cause chain

Evidence: the catch block converts the thrown value to `String(error)` and returns a response, but no wrapped error, `cause`, `inner`, trace attribute, or structured log keeps the original dependency failure attached to the profile lookup context.
Risk: after public redaction is fixed, operators may lose the query name, user id scope, retry attempts, and original driver exception needed to debug incidents.
Expected decision-table row:
- Underlying error/signal: any profile query failure after adapter classification
- Classification: preserve adapter error type while adding handler/service context
- Domain error: `ProfileInternalFailure` or the classified profile domain error
- Caller action: escalate or degrade according to the decision table, without dropping diagnostics
- Public code/message: stable domain code only; no raw dependency text
- Diagnostics location: `cause` / `inner`, trace span, structured log fields for query name and safe user identifier
Suggested tests: assert wrapping preserves the original driver error as `cause` / `inner`; assert logs/traces include profile lookup context; assert public response redaction does not remove operator diagnostics.
```

### Suggested Tests
- [ ] Classification test: row-not-found maps to `ProfileMissing`, timeout maps to `ProfileTemporaryUnavailable`, syntax error maps to `ProfileInternalFailure`.
- [ ] Retry/degrade test: temporary database failure retries with bounded backoff, then handler-owned fallback is explicit.
- [ ] Public response redaction test: response body never includes `SQLSTATE`, table/index names, hostnames, driver class names, or raw stack text.
- [ ] Cause/context preservation test: logs/traces retain query name, user id, and original driver error as `cause` / `inner`.
```

## Eval Rubric

A good review should:

- include a decision table before broad refactor advice;
- separate public response safety from operator diagnostics;
- flag string parsing of errors as unstable classification;
- distinguish retryable temporary failures from degradable not-found cases;
- require a redaction test and a cause-preservation test;
- include a PR comment form for the highest-priority finding when the review is meant to be pasted into code review, and split P0/P1/P2 comments when leakage, recovery ownership, and cause preservation need separate owners.

A weak review usually:

- only says "add better error messages";
- recommends catching all errors and returning `500` without stable codes;
- accepts fallback inside the database adapter without naming caller ownership;
- removes the raw error entirely instead of preserving it for logs/traces;
- gives a long narrative finding but no paste-ready `[error-boundary][P0/P1/P2]` comment with evidence, risk, expected decision row, and tests.
- collapses classification/recovery and cause preservation into the P0 leakage comment, making it unclear which owner should fix P1 retry/degrade policy versus P2 diagnostics.
