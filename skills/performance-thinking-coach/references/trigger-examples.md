# Trigger Examples

Use these prompts to test whether `performance-thinking-coach` triggers correctly.

## Positive (Chinese)

- 这个接口很慢，但我们还没测量过。帮我做一个先测量再优化的性能分析计划。
- 帮我分析这段代码的性能瓶颈，先给指标、基线和 profiling 方案。
- 最近 p95 延迟上升，怎么系统化排查并排序优化项？
- 我怀疑是数据库查询慢，帮我做性能思考框架，不要先拍脑袋改。

## Positive (English)

- This path is slow. Help me build a measurement-first performance investigation and optimization plan.
- We have a p95 latency regression. Define the metric, baseline, and bottleneck analysis approach.
- I think this query is expensive, but I need a structured performance analysis before optimizing.
- What should we measure before touching code for this throughput problem?

## Negative / Near Miss

- Make this loop faster with any micro-optimization you know. (Optimization without measurement goal)
- Explain Big-O notation. (General concept question)
- Add Redis caching to this endpoint now. (Specific implementation prescription without analysis)
- Tune this SQL query syntax for PostgreSQL. (May be direct query optimization, not broader performance planning)
