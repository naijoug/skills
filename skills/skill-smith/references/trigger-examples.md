# Trigger Examples

Use these prompts to test whether `skill-smith` triggers correctly.

## Positive (Chinese)

- 这个 skill 输出不太对，帮我改进一下。 (Explicit skill improvement request)
- pr-self-review skill 缺少对 monorepo 的处理。 (Specific skill + missing scenario)
- 刚才那个 skill 理解错了我的意图。 (Recent skill misinterpretation)
- skill 需要增加一个新的检查项。 (Add quality checks to an existing skill)
- 这个 skill 的触发条件不够准确。 (Trigger refinement request)
- 优化一下 code-reading-accelerator 的工作流。 (Workflow optimization for a specific skill)

## Positive (English)

- Help me improve the trending skill. (Explicit improve + skill name)
- The weekly-coding-retro needs a better output format. (Skill name + output issue)
- Fix the algorithm-kata-coach; it gives answers too quickly. (Behavior tuning for a skill)
- Refine the teaching-plan skill prompt. (Prompt refinement for a named skill)
- The who-am-i skill is missing privacy checks; update it. (Gap + requested update)

## Negative / Near Miss

- 帮我创建一个新的 skill。 (Skill creation, not improving an existing one)
- List all my installed skills. (Inquiry, not improvement work)
- What skills do I have? (Inventory question only)
- Delete the old skill. (Deletion request, not refinement)
- Help me write better code. (General coding help)
- Review this pull request. (PR review task)
- 今天练什么？ (Practice planning, use growth-related skill)
- 帮我做代码审查。 (Code review task)
