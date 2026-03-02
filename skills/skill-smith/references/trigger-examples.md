# Trigger Examples — skill-smith

## Should Trigger (True Positives)

| Input | Reason |
|-------|--------|
| "这个 skill 输出不太对，帮我改进一下" | Explicit skill improvement request (Chinese) |
| "pr-self-review skill 缺少对 monorepo 的处理" | Specific skill + missing scenario |
| "刚才那个 skill 理解错了我的意图" | Recent skill misinterpretation |
| "Help me improve the trending skill" | Explicit improve + skill name |
| "The weekly-coding-retro needs a better output format" | Skill name + output format issue |
| "Fix the algorithm-kata-coach — it gives answers too quickly" | Fix + specific problem description |
| "skill 需要增加一个新的检查项" | Add new quality check to skill |
| "这个 skill 的触发条件不够准确" | Trigger refinement request |
| "Refine the teaching-plan skill prompt" | Explicit refine + skill name |
| "优化一下 code-reading-accelerator 的工作流" | Optimize workflow for specific skill |

## Should Not Trigger (True Negatives)

| Input | Reason |
|-------|--------|
| "帮我创建一个新的 skill" | Creating new skill, not improving existing |
| "List all my installed skills" | Listing skills, not improving |
| "What skills do I have?" | Inquiry, not improvement |
| "Delete the old skill" | Deletion, not improvement |
| "Help me write better code" | General coding help, not skill improvement |
| "Review this pull request" | PR review task, not skill editing |
| "今天练什么？" | Daily practice request (personal-growth-coach) |
| "帮我做代码审查" | Code review request |
