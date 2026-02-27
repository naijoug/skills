# Trigger Examples

Use these prompts to test whether `api-design-review` triggers correctly.

## Positive (Chinese)

- 帮我 review 这个新接口设计，重点看语义、错误码、兼容性和幂等性。
- 这是一个 SDK 方法签名草案，帮我检查长期可维护性和易用性。
- 我们要加分页和过滤参数，先做 API contract review 再实现。
- 这个接口返回结构是否合理？请从客户端兼容和演进角度评审。

## Positive (English)

- Review this API contract before implementation, especially semantics, errors, and backward compatibility.
- I drafted a new endpoint. Check idempotency, pagination, and operability risks.
- Evaluate this SDK method design for maintainability and evolution.
- Is this response schema safe to extend later? Please do an API design review.

## Negative / Near Miss

- Show me how to define a FastAPI route. (Framework syntax, not contract review)
- Implement this endpoint in Go. (Implementation request, not design review)
- Fix this API integration bug from a 400 response. (Debugging/integration troubleshooting, not design review)
- Explain REST vs GraphQL at a high level. (Concept comparison, no concrete contract to review)
