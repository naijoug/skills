# Trigger Examples — ref

## Positive (Chinese)

- "帮我做一个 ref，整理相关文档和开源项目并写到 docs/ref.md"
- "我准备做一个 agent 项目，帮我找 open source references 并 clone 到 .ref/"
- "给这个需求做一份参考包，包含官方文档、对标项目和实现机制总结"
- "帮我搜一些相关开源实现，下载下来供后续 agent 读代码"

## Positive (English)

- "Create a reference pack for building an agent framework, including docs/ref.md and cloned repos"
- "Find related open-source implementations for this feature and clone the best ones into .ref/"
- "I want local reference repos and a durable implementation memo before coding"
- "Gather official docs and benchmark repos for this architecture, then summarize concrete mechanisms"

## Negative / Near Miss

- "Search the web for the latest AI news" (general search/trending, not a local reference pack)
- "Pick the best npm package for this task" (dependency selection only, no reference workspace)
- "Implement this feature now" (direct implementation, not reference gathering first)
- "Review my refactor" (code review, unrelated to reference repo collection)
