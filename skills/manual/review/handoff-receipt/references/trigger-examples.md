# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "把已完成的改动和实际测试结果压缩成接力回执，列清未接管文件与下一条动作。"
- "接收这份多仓库交接，核对哪些文件和验证结果可以继续使用。"

## Positive (English)

- "Prepare a compact handoff receipt for these completed changes, verified commands and intentionally excluded paths."
- "Review this agent's handoff and identify the owned files, evidence limits and first safe continuation."

## Negative / Near Miss

- "当前仓库干净，只回答 2 加 2 等于几。" <!-- eval: {"route":"none"} -->
- "把审查发现整理成可公开报告，分类事实、推断和隐私证据。" <!-- eval: {"route":"select","skills":["ng-review-audit-evidence-boundary"]} -->
