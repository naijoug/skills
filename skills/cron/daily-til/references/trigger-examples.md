# Trigger Examples

Use these prompts to test whether `daily-til` triggers correctly.

## Positive (Cron / Scheduled)

- (no prompt) Cron job fires the skill at 22:00 daily. (Scheduled Sweep mode)
- 跑一下今天的 TIL sweep。 (Manual one-off sweep)
- Run today's TIL sweep now. (Manual one-off sweep)
- Catch up on the past day's sessions and record anything useful. (Scheduled Sweep mode)

## Positive (Chinese)

- TIL：Rust 的 `?` 操作符可以在 main 函数中使用。 (Capture mode)
- 记录一下：Go 的 context 取消机制。 (Capture mode)
- 刚学到一个有用的 git 技巧，记下来。 (Capture mode)
- 这个 bug 的解决方法值得记录。 (Capture mode)
- 今日回顾。 (Daily review mode)
- 今天学了什么？ (Daily review mode)
- 本周总结一下学到了什么。 (Weekly summary mode)
- 本月总结。 (Monthly summary mode)
- 年度总结。 (Yearly summary mode)
- 搜索之前关于 concurrency 的记录。 (Search mode)
- 查找 Rust ownership 相关的知识点。 (Search mode)

## Positive (English)

- Record this - Flutter's RepaintBoundary. (Capture mode)
- I just learned about Python's walrus operator, save this. (Capture mode)
- Review today's learnings. (Daily review mode)
- What did I learn today? (Daily review mode)
- Weekly knowledge summary. (Weekly summary mode)
- This week's TIL summary. (Weekly summary mode)
- Monthly knowledge review. (Monthly summary mode)
- What did I learn this month? (Monthly summary mode)
- Annual knowledge retrospective. (Yearly summary mode)
- 2026 learning summary. (Yearly summary mode)
- Find my notes about Docker. (Search mode)

## Negative / Near Miss

- Help me implement a todo list. (Implementation task)
- 今天有什么 AI 新闻？ (Trending/news task)
- 今天练什么？ (Growth planning task)
- Review this pull request. (Code review task)
- 帮我写一个函数。 (Coding task)
- What's the syntax for Python list comprehension? (Factual question only)
- 做一次季度评估。 (Quarterly assessment, use growth-related skill)
- 帮我做代码审查。 (Code review task)
- Summarize the latest AI trends. (Trending/news task)
