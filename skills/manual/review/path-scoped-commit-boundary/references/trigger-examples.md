# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "仓库还有其他人的改动，只检查并提交本任务明确拥有的两个文件。"
- "这个 dirty worktree 中我的文件已标明，帮我核对暂存范围，避免混入其他改动。"

## Positive (English)

- "Stage and commit only the supplied owned paths in this dirty repository, preserving unrelated changes."
- "Audit the staged paths against this task's ownership boundary before making its requested commit."

## Negative / Near Miss

- "解释 git status 的输出含义。" <!-- eval: {"route":"none"} -->
- "多个 agent 的文件归属还不清楚，先建立会话台账。" <!-- eval: {"route":"select","skills":["ng-review-multi-session-control-ledger"]} -->
