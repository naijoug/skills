# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "同一个测试在根目录和包目录结果不同，帮我排查 cwd、alias 和 dist 解析差异。"
- "源码修了但 monorepo 测试仍加载旧行为，检查包入口是否指向旧构建产物。"

## Positive (English)

- "Investigate why this monorepo test imports different code from the workspace root and package directory."
- "Check whether package aliases and stale dist entrypoints explain this test/build mismatch."

## Negative / Near Miss

- "给这个普通函数增加一个边界测试。"
- "解释 monorepo 是什么意思。" <!-- eval: {"route":"none"} -->
