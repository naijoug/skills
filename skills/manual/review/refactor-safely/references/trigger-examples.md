# Trigger Examples

Use these prompts to test whether `refactor-safely` triggers correctly.

## Positive (Chinese)

- 这段函数太长了，帮我拆分成小步骤重构，但不要改变行为。
- 我想清理重复代码，先给我一个可回退的重构计划和每步验证点。
- 这块代码很乱，功能先不变，只做结构优化，怎么分步骤最稳妥？
- 帮我做 behavior-preserving refactor 方案，顺便补必要的特征测试。

## Positive (English)

- Help me refactor this giant function without changing behavior; I want small reversible steps.
- I need a safe cleanup plan for duplicated logic with verification after each step.
- Propose a behavior-preserving refactor sequence for this module before feature work.
- How can I restructure this code safely with characterization tests first?

## Negative / Near Miss

- Redesign this module and change the feature behavior. (Behavior change, not pure refactor)
- What is refactoring? (General explanation only)
- Remove this feature and replace it with a new workflow. (Product/behavior rewrite, not safe refactor)
- Fix the production bug first; cleanup later. (Bugfix execution is primary, not refactor planning)
