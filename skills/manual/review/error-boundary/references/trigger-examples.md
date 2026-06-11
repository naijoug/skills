# Trigger Examples

Use these prompts to test whether `error-boundary` triggers correctly.

## Positive (Chinese)

- 帮我审查这个 service 的错误处理，重点看重试、降级和对外错误码。
- 这个 repository 会不会把数据库错误泄漏到 API response？请做错误边界 review。
- 我们的 SDK adapter catch 后直接返回默认值，帮我判断调用方是否还能正确决策。
- 检查这段 handler 是否把 SQL state、索引名或底层异常 message 暴露给用户。

## Positive (English)

- Review this module's error boundary: classification, retry policy, fallback, and public error codes.
- Check whether this handler leaks database or SDK errors to clients.
- Design a decision table for these service errors and decide which ones retry, degrade, or escalate.
- Audit this catch block for lost cause chains and unsafe public messages.

## Negative / Near Miss

- Show me how to write try/catch in TypeScript. (Syntax tutorial, no boundary review)
- Explain Rust Result at a high level. (Concept explanation, no concrete module)
- Review this entire API design for pagination and idempotency. (Use `ng-review-api-design` first)
- Fix this failing test. (Debugging request unless the failure is specifically about error contracts)
