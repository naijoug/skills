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

### PR-comments-only mode

Use this mode when the user explicitly asks for comments to paste into a PR, or when a review tool has already summarized the diff and only needs actionable comments. Do not repeat the full decision table unless the user asks for the complete review; in short, omit the full decision table and output 1–3 focused comments tied to one owner each.

```markdown
## Error Boundary PR Comments

1. `[error-boundary][P0] <public leakage title>`
   - Evidence: <file/function/line or relative path snippet>
   - Risk: <what leaks or what client contract becomes unstable>
   - Expected decision-table row: <underlying signal → domain error → caller action → public code/message → diagnostics location>
   - Suggested tests: <redaction + diagnostics preservation assertions>

2. `[error-boundary][P1] <classification or recovery ownership title>`
   - Evidence: <string parsing, hidden retry, silent fallback, adapter-owned degrade>
   - Risk: <misclassification, retry storm, hidden business policy, untested fallback>
   - Expected decision-table row: <retryable/degradable signal → typed domain error → owner-owned retry/degrade policy>
   - Suggested tests: <retry budget, fallback ownership, unknown-error escalation>

3. `[error-boundary][P2] <context preservation title>`
   - Evidence: <lost cause/source/inner/log context>
   - Risk: <operators lose root cause after public redaction>
   - Expected decision-table row: <classified error → public-safe response + preserved cause/source/inner>
   - Suggested tests: <cause chain and trace/log context assertions>
```

Rules for this short mode:

- Keep `Evidence`, `Risk`, `Expected decision-table row`, and `Suggested tests` in every comment; omit broad background.
- Prefer one P0/P1/P2 comment per distinct owner; merge comments only when the same code owner can fix them in one patch.
- If there is no concrete diff, file, function, or relative path evidence, ask for the missing review target instead of inventing a PR comment.
- If a full error boundary design is still missing, say that PR-comments-only mode is insufficient and fall back to the full review output shape above.

### PR-comments-only mini fixture

Use this mini fixture as the fastest calibration check before producing short PR comments:

```text
Input:
User request: "Only give me PR comments for this diff."
Diff evidence: `services/profile/http.ts` catch block returns `{ code: "DB_ERROR", message: String(error) }`; timeout branch uses `message.includes("timeout")` and returns `{ displayName: "Anonymous" }`; no log, `cause`, `inner`, or trace field keeps the original driver error.

Expected short-mode output:
## Error Boundary PR Comments

1. `[error-boundary][P0] services/profile/http.ts exposes raw database errors to API callers`
   - Evidence: `services/profile/http.ts` returns `{ code: "DB_ERROR", message: String(error) }` from the catch block.
   - Risk: clients may receive SQLSTATE, table names, hostnames, driver class names, or stack fragments; the public API becomes coupled to dependency internals.
   - Expected decision-table row: database row-not-found / timeout / driver bug → typed profile domain error → caller-owned degrade/retry/escalate → stable public code/message → original driver error in `cause` / `inner` / trace.
   - Suggested tests: assert public responses omit SQLSTATE/table/host/driver/stack text and assert logs/traces retain the original driver error.

2. `[error-boundary][P1] services/profile/http.ts owns fallback through string parsing instead of a retry/degrade policy`
   - Evidence: timeout recovery depends on `message.includes("timeout")` and returns an anonymous profile immediately.
   - Risk: driver wording changes can skip fallback or degrade the wrong failure; retry budget and business ownership are not reviewable.
   - Expected decision-table row: timeout / pool exhaustion → `ProfileTemporaryUnavailable` → bounded retry, then caller-owned degrade only if product accepts it → `degraded=true` or stable temporary-unavailable code → retry attempts in logs/traces.
   - Suggested tests: assert timeout and pool exhaustion classify as retryable, unknown driver messages escalate, and fallback ownership is covered by a test.
```

Fixture expectations:

- Output starts with `## Error Boundary PR Comments`, not the full review table.
- It contains 1–3 comments and each comment has concrete relative path evidence.
- It includes at least one P0 public-leakage comment and one P1 classification/recovery comment when both failures are present.
- It does not invent line numbers, hidden implementation details, or logs/traces that are not visible in the diff evidence.
- It still names the expected decision-table row inside each comment so the short mode remains anchored to the same error-boundary contract.

### PR-comments-only insufficient-evidence fixture

Use this anti-fixture when the user asks for PR comments but provides no concrete diff, relative path, function name, or error-flow evidence. Short mode should refuse to invent review comments and should either ask for the missing target or fall back to the full review workflow when enough design context is available.

```text
Input:
User request: "Only give me PR comments about our error handling."
Evidence provided: no diff, no relative path, no function name, no stack trace, no public response contract, no retry/degrade policy.

Expected short-mode output:
I cannot produce paste-ready `[error-boundary][P0/P1/P2]` PR comments yet because there is no concrete relative path, diff hunk, function, or error-flow evidence to cite. Please provide one of:

- a diff hunk or relative path such as `services/profile/http.ts` plus the relevant catch/return code;
- the public response contract and the adapter/service code that maps dependency errors;
- a failing test, log excerpt, or trace span that shows the boundary where raw dependency errors cross outward.

Once the target is concrete, I can output `## Error Boundary PR Comments` with 1–3 focused comments. Until then, I should not invent line numbers, hidden logs, handler names, or implementation details.
```

Anti-fixture expectations:

- It does not output fake `[error-boundary][P0]` comments without evidence.
- It names the missing evidence required for short mode: relative path, diff hunk, function, or error-flow evidence.
- It may offer to run the full error-boundary review only if enough design context is available.
- It preserves the no-hallucination rule: do not invent line numbers, logs, traces, handler names, or hidden implementation details.

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
