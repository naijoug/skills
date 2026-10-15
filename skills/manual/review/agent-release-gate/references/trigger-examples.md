# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "根据现有 Golden Tasks、trace 和回滚证据，判断这个 Agent 版本是否可以灰度。"
- "检查这份 Agent 发布证据包，给出 pass、warn 或 block，并指出缺失证据。"

## Positive (English)

- "Assess this agent release from its evaluation results, tool policy, traces and rollback evidence."
- "Review whether these Golden Tasks and safety regression results justify a read-only canary rollout."

## Negative / Near Miss

- "这个页面只有一处文案修改，帮我读一遍。" <!-- eval: {"route":"none"} -->
- "还没有评估用例，先帮我设计这个函数的测试矩阵。" <!-- eval: {"route":"none","skills":[]} -->

## Workflow checks (not routing cases)

- User already authorized a canary and the project uses CI approval, with sufficient evaluation and rollback evidence. Accept that authority; do not demand a canonical Markdown note or exact `Final decision` wording.
- A release review lacks deploy authority. Complete the evidence review and local preparation; block only the deploy action.
- A project publish-note parser is being changed. Test its relevant allow/deny cases in isolation, including an assertion that rejected input causes no forbidden side effect.
