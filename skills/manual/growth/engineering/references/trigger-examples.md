# Trigger Examples

Use these prompts to test whether `engineering` triggers correctly. The skill covers guided engineering practice across algorithm coaching, debugging investigation, design-pattern judgment, and measurement-first performance work.

## Positive (Chinese)

- 算法练习：我在刷题，别直接给答案。用分层提示带我做这道题，并检查复杂度分析。
- 算法练习：帮我做算法题训练，先让我说思路，你再逐步提示。
- 算法练习：这题我卡住了，请用 coaching 模式（不是完整代码）帮我推进。
- 算法练习：模拟面试，给我 checkpoint 问题、复杂度追问和最后复盘。
- 调试练习：这个接口偶发 500，先别改代码，帮我做一个系统化排查计划（复现、假设、实验、根因）。
- 调试练习：登录功能在生产环境有时失败，本地正常。请按调试流程帮我定位问题。
- 调试练习：这个 bug 只有部分用户会遇到，帮我先整理可能原因并设计验证实验。
- 调试练习：单测偶发超时，我不想拍脑袋修，先做 root cause 分析。
- 设计模式练习：这个场景到底要不要上设计模式？请比较方案、trade-off，并给出“不用模式”的选项。
- 设计模式练习：帮我判断 Strategy 和 State 哪个更适合这个需求，重点讲约束和复杂度成本。
- 设计模式练习：我担心这次重构过度设计，帮我做 pattern application review。
- 设计模式练习：做一个设计模式练习，先分析问题压力，再决定用不用模式。
- 性能练习：这个接口很慢，但我们还没测量过。帮我做一个先测量再优化的性能分析计划。
- 性能练习：帮我分析这段代码的性能瓶颈，先给指标、基线和 profiling 方案。
- 性能练习：最近 p95 延迟上升，怎么系统化排查并排序优化项？
- 性能练习：我怀疑是数据库查询慢，帮我做性能思考框架，不要先拍脑袋改。

## Positive (English)

- Algorithm practice: coach me through this algorithm problem with hints only, not the full solution.
- Algorithm practice: I want interview-style practice; ask for my approach first, then give progressive hints.
- Algorithm practice: help me solve this LeetCode problem in a guided way and make me explain complexity.
- Algorithm practice: use a kata coaching mode so I learn the pattern instead of copying code.
- Debugging practice: this endpoint intermittently returns 500s. Do not patch yet; build a structured investigation plan.
- Debugging practice: help me debug this flaky failure with a repro path, ranked hypotheses, and validation experiments.
- Debugging practice: the bug only affects some customers in prod. I need root-cause analysis before code changes.
- Debugging practice: we have a timing-related issue that is hard to reproduce. Create a debugging investigation workflow.
- Design-pattern practice: what pattern, if any, fits this problem? Compare options and include a no-pattern alternative.
- Design-pattern practice: compare Strategy vs State for this design and explain trade-offs in testability and complexity.
- Design-pattern practice: review this refactor idea for overengineering risk before introducing a pattern.
- Design-pattern practice: coach me on applying design patterns based on constraints, not textbook definitions.
- Performance practice: this path is slow. Help me build a measurement-first performance investigation and optimization plan.
- Performance practice: we have a p95 latency regression. Define the metric, baseline, and bottleneck analysis approach.
- Performance practice: I think this query is expensive, but I need a structured performance analysis before optimizing.
- Performance practice: what should we measure before touching code for this throughput problem?

## Negative / Near Miss

- Give me the optimal solution code immediately. (Direct solution, no coaching)
- Explain what a race condition is. (Concept question, not guided engineering practice)
- Fix this bug by changing the retry count to 5. (Direct patch, skips investigation)
- Define the Observer pattern. (Definition-only request)
- Make this loop faster with any micro-optimization you know. (Optimization without measurement)
- Add Redis caching to this endpoint now. (Implementation prescription without analysis)
- List all GoF patterns and examples. (Reference request, not coaching)
- Generate 20 interview questions and answers. (Question bank, not guided practice)

## Narrow first

- If the user asks for a direct implementation or patch, clarify whether they want coaching / investigation or immediate execution before applying this skill.
- If the request is only a concept definition, answer directly or use a teaching skill instead of this practice-oriented skill.
- If production debugging or performance work requires logs, metrics, or authorization that are missing, first collect safe evidence and define what cannot be verified.
