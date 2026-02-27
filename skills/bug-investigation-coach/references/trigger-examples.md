# Trigger Examples

Use these prompts to test whether `bug-investigation-coach` triggers correctly.

## Positive (Chinese)

- 这个接口偶发 500，先别改代码，帮我做一个系统化排查计划（复现、假设、实验、根因）。
- 登录功能在生产环境有时失败，本地正常。请按调试流程帮我定位问题。
- 这个 bug 只有部分用户会遇到，帮我先整理可能原因并设计验证实验。
- 单测偶发超时，我不想拍脑袋修，先做 root cause 分析。

## Positive (English)

- This endpoint intermittently returns 500s. Do not patch yet; build a structured investigation plan.
- Help me debug this flaky failure with a repro path, ranked hypotheses, and validation experiments.
- The bug only affects some customers in prod. I need root-cause analysis before code changes.
- We have a timing-related issue that is hard to reproduce. Create a debugging investigation workflow.

## Negative / Near Miss

- Explain what a race condition is. (Concept question, not a concrete investigation)
- Fix this bug by changing the retry count to 5. (Asks for direct patch, skips investigation)
- Add more logs to this file everywhere. (Implementation request without structured investigation goal)
- Write a postmortem template for incidents. (Documentation/template task, not active bug investigation)
