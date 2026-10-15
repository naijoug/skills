# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "三个 agent 会话正在碰同一组仓库，先建立路径归属、各自目标和接力边界台账。"
- "现有 cron 和代码会话的改动重叠，帮我梳理哪个会话负责哪些文件。"

## Positive (English)

- "Create an ownership ledger for these concurrent coding, review and scheduled sessions touching related repositories."
- "Reconcile these active agents' outcomes, owned paths and authorization boundaries before resuming their work."

## Negative / Near Miss

- "只有我一个会话，在干净仓库修一处拼写。" <!-- eval: {"route":"none"} -->
- "路径归属已清楚，现在只提交我修改的两个文件。" <!-- eval: {"route":"select","skills":["ng-review-path-scoped-commit-boundary"]} -->
