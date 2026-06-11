# Near-Miss Eval for Error Boundary Review

Use this file to keep `ng-review-error-boundary` from triggering on adjacent requests that mention errors but do not ask for a boundary review. The goal is not to suppress useful help; it is to route the first answer to the right skill or response shape.

## Decision Rule

Trigger `ng-review-error-boundary` only when the request has **both**:

1. A concrete module, diff, design, or error flow to review.
2. A boundary concern: classification, retry, fallback/degradation, cause preservation, public error code/message safety, or dependency error translation.

If either side is missing, answer directly or route to a broader skill first.

## Should Trigger

| Prompt shape | Why it triggers | Expected first move |
|---|---|---|
| "Review this service error handling: DB timeout, retry, fallback, and API error codes." | Concrete service plus classification/recovery/public response concerns. | Map the dependency-to-caller boundary and build a decision table. |
| "这个 repository 会不会把 SQL state 泄漏到 handler response？" | Concrete repository/handler boundary plus public error leakage. | Inspect adapter translation and response shaping. |
| "Here is a diff that catches SDK errors and returns default profile data; is fallback owned by the right layer?" | Concrete diff plus degradation ownership. | Identify caller-owned degradation vs adapter-owned silent defaults. |
| "Our CLI wraps filesystem errors; check whether users see safe messages while logs keep root causes." | Concrete CLI boundary plus public/operator split and cause preservation. | Trace public output and diagnostic chain separately. |

## Should Not Trigger

| Prompt shape | Why it should not trigger | Better route |
|---|---|---|
| "Show me TypeScript try/catch syntax." | Syntax tutorial only; no module or boundary contract. | Explain syntax directly. |
| "Explain Rust `Result` vs exceptions." | Concept explanation; no review target or recovery policy. | Give conceptual comparison. |
| "Fix this failing test." | Debugging request unless the failure concerns error contracts. | Debug the test first; trigger only if root cause is boundary design. |
| "Review my whole API for pagination, idempotency, and naming." | Broad API design, not specifically error handling. | Use API design review first, then this skill for the error model. |
| "What is an HTTP 500?" | General knowledge, no concrete boundary. | Answer directly. |

## Ambiguous: Ask or Narrow Before Triggering

| Prompt shape | Risk | Narrowing question or assumption |
|---|---|---|
| "Check our errors." | Too broad; may be logs, syntax, UX, or monitoring. | Ask for the module and whether the concern is classification/retry/fallback/public response. |
| "The app returns DB_ERROR sometimes." | Could be production debugging or boundary design. | Ask for handler/repository paths and whether public response safety should be reviewed. |
| "Improve error messages in this SDK." | Could be copywriting or boundary translation. | Clarify whether internal SDK details must be hidden from callers. |
| "Should this fallback live here?" | Likely relevant, but missing call chain. | Ask for caller, adapter, and allowed degradation policy. |

## Eval Rubric

A routing/eval pass is acceptable when it can label each prompt as one of:

- `TRIGGER`: run the full error-boundary workflow and produce a decision table.
- `NO_TRIGGER`: answer directly or route to a non-error-boundary skill.
- `NARROW_FIRST`: request the missing module, call chain, or boundary concern before running the workflow.

For `TRIGGER`, the expected answer should mention at least two of: classification, retry, degradation/fallback, cause/context preservation, or public error code safety. For `NO_TRIGGER`, the answer should not force a decision table. For `NARROW_FIRST`, the answer should ask for relative paths or the concrete dependency-to-caller chain rather than inventing implementation details.
