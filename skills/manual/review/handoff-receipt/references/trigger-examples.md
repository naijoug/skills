# Routing examples

Candidate selection does not authorize executing the requested action.

## Positive (Chinese)

- "为这次改动写一份交接，列出我改的文件、验证结果和下一步。"
- "这个仓库已有别人的修改，帮我确认本次授权提交只包含自己的 hunks。"
- "两个现有 agent 会话在改同一仓库，整理各自的任务、文件归属和授权边界。"

## Positive (English)

- "Prepare a concise handoff with owned changes, actual checks and remaining work."
- "Check that this authorized commit excludes previously staged changes from another task."
- "Reconcile ownership between these existing sessions without launching more agents."

## Negative / Near Miss

- "修复这个独立函数的 off-by-one 错误并运行测试。"
- "Explain what git status means."
- "Write a customer-facing audit report that separates private proof from publishable claims."
