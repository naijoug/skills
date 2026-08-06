# Trigger Examples — ng-tool-search

## Positive (Chinese)

- "帮我搜一下 Claude Code 最新的更新"
- "查一下 Rust async runtime 的最佳实践"
- "帮我了解一下 2026 年最火的 AI 编程工具"
- "搜索 transformer 架构的最新论文"
- "帮我查查 Next.js 15 有什么新特性"
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
- "Look up Claude Code release notes and summarize the sources"
- "Find reliable references about Rust async runtime selection"

## Negative / Near Miss

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
