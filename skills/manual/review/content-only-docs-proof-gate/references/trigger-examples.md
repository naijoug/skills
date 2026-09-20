# Routing examples

These are candidate-selection fixtures, not authorization to execute their actions.

## Positive (Chinese)

- "这个 docs 仓库只改了两篇 Markdown 和目录条目，帮我验证内容、链接与所属改动范围。"
- "给这次纯文档变更选择最小可靠检查，确认无需完整站点构建的依据。"

## Positive (English)

- "Verify these content-only documentation edits with focused frontmatter, link and catalog checks."
- "Choose a scoped proof for two Markdown changes in this dirty docs repository; exclude unrelated existing edits."

## Negative / Near Miss

- "我改了 VuePress 主题和侧边栏生成逻辑，运行完整构建验收。"
- "给我解释 Markdown 的粗体语法。" <!-- eval: {"route":"none"} -->
