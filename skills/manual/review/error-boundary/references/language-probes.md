# Language-Specific Error Boundary Probes

Use this reference after the generic workflow in `SKILL.md` when the reviewed diff is mostly one language. The goal is not to enforce one style, but to quickly find whether callers get stable decisions while operators keep root-cause diagnostics.

## Universal probe

For each boundary, ask for one concrete path and fill this row before giving findings:

| 底层错误 | 领域错误 | 调用方动作 | 重试/降级策略 | 对外消息 | 证据/测试 |
|---|---|---|---|---|---|
| dependency failure | domain classification | retry / degrade / escalate / ask user | owner + limits | safe code/message | test/log assertion |

If a row cannot be filled because the code only exposes strings, booleans, nulls, or raw exceptions, that is usually the first finding.

## Go

Probe for:

- `fmt.Errorf("...: %w", err)` or equivalent wrapping whenever context is added.
- `errors.Is` / `errors.As` over string matching.
- Sentinel/domain errors at repository or service boundaries rather than exported driver errors.
- Retry code that checks typed retryability and has max attempts/backoff/exhausted behavior.
- HTTP/CLI adapters that translate domain errors to stable public codes without printing raw SQL/SDK messages.

Red flags:

- `fmt.Errorf("...: %v", err)` losing unwrap support.
- `if strings.Contains(err.Error(), "timeout")` for policy decisions.
- Returning `sql.ErrNoRows`, driver-specific errors, or connection strings directly to handlers.

## Python

Probe for:

- Custom domain exceptions with stable attributes such as `code`, `retryable`, or `safe_message`.
- `raise DomainError(...) from exc` when translating lower-level failures.
- Caller-owned fallback for degradable paths; libraries should not silently return empty data unless that is their contract.
- Tests asserting both public redaction and `__cause__` preservation.

Red flags:

- Bare `except Exception: return None` or `{}`.
- Re-raising with `raise DomainError(str(exc))` and losing `from exc`.
- Public responses that include file paths, DSNs, hostnames, SDK class names, or traceback text.

## Rust

Probe for:

- Domain `enum` variants that carry source errors or context where useful.
- `thiserror` / `anyhow` boundaries used intentionally: typed errors for callers, rich context for operators.
- `Result<T, E>` signatures that expose recoverable cases to the owning caller.
- Retry/degrade policy matching enum variants rather than parsing messages.

Red flags:

- Collapsing all failures into `anyhow::Error` before a caller must decide retry/degrade/escalate.
- `unwrap` / `expect` across service, CLI, job, or adapter boundaries.
- Public JSON built from `error.to_string()` when the source is a database, filesystem, or SDK error.

## TypeScript

Probe for:

- Discriminated unions or custom `AppError` classes with stable `code` values.
- `cause` / `inner` preservation when translating dependency errors.
- `satisfies Record<ErrorCode, RecoveryDecision>` or equivalent coverage checks for decision tables.
- `unknown` caught errors narrowed before classification.
- API responses produced from domain errors, not raw `Error.message`.

Red flags:

- `catch (error) { return { message: String(error) } }` in a handler.
- `throw new Error(driverError.message)` losing type and cause.
- Retry/fallback controlled by `error.message.includes(...)`.
- Public error codes copied from SQL states, SDK error names, or infrastructure hostnames.

## Minimum suggested tests

- Classification: each dependency failure maps to the expected domain error/code.
- Recovery: retryable, degradable, and escalate paths each execute the documented caller action.
- Redaction: public response excludes SQL state, index names, hostnames, file paths, stack frames, and raw SDK messages.
- Cause preservation: logs/traces or error objects still expose the original cause for operators.
