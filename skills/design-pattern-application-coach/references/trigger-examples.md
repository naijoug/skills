# Trigger Examples

Use these prompts to test whether `design-pattern-application-coach` triggers correctly.

## Positive (Chinese)

- 这个场景到底要不要上设计模式？请比较方案、trade-off，并给出“不用模式”的选项。
- 帮我判断 Strategy 和 State 哪个更适合这个需求，重点讲约束和复杂度成本。
- 我担心这次重构过度设计，帮我做 pattern application review。
- 做一个设计模式练习：先分析问题压力，再决定用不用模式。

## Positive (English)

- What pattern, if any, fits this problem? Compare options and include a no-pattern alternative.
- Compare Strategy vs State for this design and explain trade-offs in testability and complexity.
- Review this refactor idea for overengineering risk before introducing a pattern.
- Coach me on applying design patterns based on constraints, not textbook definitions.

## Negative / Near Miss

- Define the Observer pattern. (Definition-only request)
- Implement this class exactly as shown in the UML. (Implementation instruction, no pattern decision)
- List all GoF patterns and examples. (Reference/teaching request, not application coaching)
- Refactor this code and choose any pattern you like. (Implementation-first request without decision coaching focus)
