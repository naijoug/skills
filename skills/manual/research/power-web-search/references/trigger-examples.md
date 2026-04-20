# Trigger Examples — power-web-search

## Positive (should trigger)

- "帮我搜一下 Claude Code 最新的更新"
- "Search for the latest developments in AI agents"
- "查一下 Rust async runtime 的最佳实践"
- "Research how to set up MCP servers"
- "帮我了解一下 2026 年最火的 AI 编程工具"
- "Look up alternatives to Docker for containerization"
- "搜索 transformer 架构的最新论文"
- "帮我查查 Next.js 15 有什么新特性"
- "Find out about the latest Kubernetes security best practices"

## Negative (should NOT trigger)

- "帮我写一个排序函数" (implementation, not search)
- "Fix the bug in my code" (debugging, not search)
- "Review this PR" (code review)
- "今天 AI 领域有什么新动态？" (trending skill, not general search)
- "TIL: learned about async/await" (til-journal)
- "Help me refactor this function" (refactor-safely)
