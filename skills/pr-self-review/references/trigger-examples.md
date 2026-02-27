# Trigger Examples

Use these prompts to test whether `pr-self-review` triggers correctly.

## Positive (Chinese)

- 我准备提 PR 了，帮我做一轮自检，重点看回归风险和测试缺口。
- 这是我的 diff，先帮我找出 reviewer 大概率会提的问题。
- 提交前帮我检查这次改动的可读性、错误处理和运维风险。
- 帮我按 PR self-review checklist 过一遍，顺便看看描述里还缺什么。

## Positive (English)

- I am about to open a PR. Help me self-review this diff for regressions and missing tests.
- Review my changes from a reviewer perspective before I send them out.
- What comments is a reviewer likely to leave on this PR? Check behavior, tests, and clarity.
- Run a PR self-review checklist on this commit and suggest PR description notes.

## Negative / Near Miss

- Do a full independent code review of this repository. (Broader review task, not self-review prep)
- Create a PR template for our team. (Template authoring, not reviewing a concrete diff)
- Summarize the changes in this merge commit for release notes. (Release communication, not self-review)
- Resolve Git merge conflicts in this branch. (Version control operation, not PR self-review)
