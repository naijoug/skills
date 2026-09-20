# Trigger Examples

Use these phrases to recognize when the skill should be applied.

## Positive (Chinese)

- "这个 agent preflight 脚本需要补自测，别只靠手跑。"
- "无参数默认选择最新 notebook 的逻辑要怎么测试？"
- "帮我给 cron 检查脚本写一个临时 workspace fixture。"
- "这个脚本必须在绝对路径、缺字段、空目录时 fail closed。"
- "把本轮 preflight 改动变成可回归的脚本测试。"

## Positive (English)

- "Add a self-test for this preflight script."
- "How do we test the default target inference without touching the real repo?"
- "Create a temporary workspace fixture for this agent cron checker."
- "Make sure this guard fails closed for missing fields and absolute paths."
- "This preflight is used every run; give it positive and negative harness tests."
- "Test the no-argument latest-file behavior and the empty-directory failure."
- "Turn this cron proof script into a one-shot checklist with fail-closed examples."

## Negative / Near Miss

- "Run the full product test suite" when the preflight script itself is not changing.
- "Write a general testing strategy" without a concrete script, guardrail, or default inference rule.
- "Deploy this after preflight" when the user is asking for release authorization rather than preflight self-tests.
- "Explain cron" when there is no repeated script or guardrail contract to test.
- "Run tests before committing" when there is no preflight-script contract, default inference, or guardrail behavior to improve.

## Routing notes (not evaluation inputs)

- If the real repository is dirty, build the fixture in `mktemp` and stage only owned script/test paths.
- If the script relies on git state, initialize a temporary git repo inside the fixture instead of using the real repo.
- If output assertions are needed, match stable phrases and avoid temporary absolute paths.
