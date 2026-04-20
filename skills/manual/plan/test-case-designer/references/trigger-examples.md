# Trigger Examples

Use these prompts to test whether `test-case-designer` triggers correctly.

## Positive (Chinese)

- 帮我给这个输入校验函数设计测试用例矩阵，覆盖正常、边界和异常情况。
- 这是一个新 API，先不要写代码，先列出高优先级测试场景。
- 这个 bug 修完了，帮我补一组回归测试设计（包括反例）。
- 我不确定这段逻辑测试是否完整，请从行为维度设计测试案例。

## Positive (English)

- Design a test matrix for this parser, including happy path, boundary values, and invalid inputs.
- Before implementing, list prioritized test cases for this API contract.
- I fixed a bug; help me design regression tests and edge cases for it.
- What tests are missing for this workflow? Focus on behavior coverage, not line coverage.

## Negative / Near Miss

- Run the existing test suite and tell me what failed. (Execution, not design)
- Teach me how to install pytest. (Framework setup, not test-case design)
- Increase test coverage to 90% quickly. (Coverage target without scenario design focus)
- Why are my tests flaky? (Debugging issue; may need bug/debugging workflow first)
