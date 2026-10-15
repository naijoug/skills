# Trigger Examples — ng-tool-search

## Positive (Chinese)

- "研究 Claude Code 最近几次更新对开发流程的影响，列出来源"
- "查一下 Rust async runtime 的最佳实践"
- "帮我了解一下 2026 年最火的 AI 编程工具"
- "搜索 transformer 架构的最新论文"
- "比较 Next.js 15 的新特性与现有项目迁移要求，给出来源"
- "研究一下 MCP server 的配置方式，给我列来源"
- "找几篇关于 Kubernetes 安全最佳实践的近期资料"
- "帮我查一下 Docker 替代方案的优缺点"

## Positive (English)

- "Search for the latest developments in AI agents"
- "Research how to set up MCP servers"
- "Look up alternatives to Docker for containerization"
- "Find out about the latest Kubernetes security best practices"
- "Search recent papers about transformer architecture changes"
- "Research the current best practices for Next.js deployment"
- "Compare recent Claude Code releases and explain their workflow impact with sources"
- "Find reliable references about Rust async runtime selection"

## Negative / Near Miss

- "What is the capital of France?" <!-- eval: {"route":"none"} -->
- "Open this supplied release-note URL and tell me its version number." (Single lookup)

- "帮我写一个排序函数" (implementation, not search)
- "Fix the bug in my code" (debugging, not research)
- "Review this PR" (code review)
- "今天 AI 领域有什么新动态？" (daily trending scan, not targeted search)
- "TIL: learned about async/await" (daily TIL capture)
- "Help me refactor this function" (refactor)

## Narrow first

- "帮我研究一下 AI" → ask for scope, timeframe, and desired output before searching.
- "查资料" → ask what topic, depth, language, and source type are needed.
- "搜索最新消息" → clarify topic and whether the user wants news, docs, papers, or product updates.
