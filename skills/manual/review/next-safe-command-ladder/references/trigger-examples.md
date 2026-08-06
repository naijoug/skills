# Trigger Examples

Use these phrases to recognize when the skill should be applied.

## Positive (Chinese)

- "构建失败了，帮我收窄下一条最安全的验证命令。"
- "不要给泛泛的测试清单，把这个风险拆成命令阶梯。"
- "这个 PR 先跑什么最小检查，能证明关键假设？"
- "请把这次 AI 代码审查转成可执行的验证命令。"

## Positive (English)

- "What is the next safest command to run?"
- "Build failed; help me narrow the next verification step."
- "Turn this AI coding audit into concrete validation commands."
- "I do not want a generic test checklist; give me a command ladder."
- "What should the final report say about verification?"
- "Before I run the full suite, what focused check proves this risk?"
- "How should I validate this PR without over-running unrelated tests?"
- "Which tests matter for this specific change?"
- "Make this handoff actionable with commands and expected outputs."
- "Help me decide whether to continue broad testing or narrow first."

## Negative / Near Miss

- "Run all tests now" when the user has explicitly requested the full suite.
- "Deploy this" unless the user has also asked for a pre-deploy verification sequence.
- "Write a general testing strategy" without a concrete change or risk to ladder.
- "Explain what CI is" when no concrete failure, change, or verification decision is present.

## Narrow first

- If the requested next command might affect production, first ask for authorization or choose a read-only check.
- If the failure log is missing, start with a command that captures the smallest relevant log slice.
- If several repos are dirty, restrict the ladder to the path or files owned by the current task.
