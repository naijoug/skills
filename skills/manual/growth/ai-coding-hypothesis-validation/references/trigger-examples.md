# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "我想把这次 bug 修复变成刻意练习，先记录自己的可证伪假设，再用测试结果检验判断。"
- "把这次脚本排查整理成假设验证卡，保留我在 AI 修改前的判断和反证条件。"

## Positive (English)

- "Help me practice engineering judgment by recording my hypothesis before an agent patches this bug."
- "Build a falsifiable hypothesis card for this debugging exercise, including what evidence would change my mind."

## Negative / Near Miss

- "马上把这个常量从 3 改成 4，不需要教学。" <!-- eval: {"route":"none"} -->
- "给我解释 hypothesis 这个英语单词。" <!-- eval: {"route":"none"} -->
