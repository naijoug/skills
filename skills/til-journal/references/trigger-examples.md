# Trigger Examples — til-journal

## Should Trigger (True Positives)

### Capture Mode
| Input | Reason |
|-------|--------|
| "TIL: Rust 的 `?` 操作符可以在 main 函数中使用" | Classic TIL format |
| "记录一下：Go 的 context 取消机制" | Chinese capture request |
| "Record this — Flutter's RepaintBoundary" | English capture request |
| "刚学到一个有用的 git 技巧，记下来" | Learned + record request |
| "I just learned about Python's walrus operator, save this" | Learned + save |
| "这个 bug 的解决方法值得记录" | Bug solution worth recording |

### Daily Review Mode
| Input | Reason |
|-------|--------|
| "今日回顾" | Chinese daily review |
| "Review today's learnings" | English daily review |
| "What did I learn today?" | Question form daily review |
| "今天学了什么？" | Chinese question form |

### Weekly Summary Mode
| Input | Reason |
|-------|--------|
| "本周总结一下学到了什么" | Chinese weekly summary |
| "Weekly knowledge summary" | English weekly summary |
| "This week's TIL summary" | TIL + weekly |

### Monthly Summary Mode
| Input | Reason |
|-------|--------|
| "本月总结" | Chinese monthly summary |
| "Monthly knowledge review" | English monthly summary |
| "What did I learn this month?" | Question form monthly |

### Yearly Summary Mode
| Input | Reason |
|-------|--------|
| "年度总结" | Chinese yearly summary |
| "Annual knowledge retrospective" | English yearly summary |
| "2026 learning summary" | Year + summary |

### Search Mode
| Input | Reason |
|-------|--------|
| "搜索之前关于 concurrency 的记录" | Chinese search + keyword |
| "Find my notes about Docker" | English search |
| "查找 Rust ownership 相关的知识点" | Chinese search + topic |

## Should Not Trigger (True Negatives)

| Input | Reason |
|-------|--------|
| "Help me implement a todo list" | Implementation task |
| "今天有什么 AI 新闻？" | Trending/news request (use `trending`) |
| "今天练什么？" | Growth practice request (use `personal-growth-coach`) |
| "Review this pull request" | Code review task |
| "帮我写一个函数" | Coding task |
| "What's the syntax for Python list comprehension?" | Factual question, not recording |
| "做一次季度评估" | Quarterly assessment (use `personal-growth-coach`) |
| "帮我做代码审查" | Code review request |
| "Summarize the latest AI trends" | News/trends (use `trending`) |
