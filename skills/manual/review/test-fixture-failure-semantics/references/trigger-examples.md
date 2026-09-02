# Trigger Examples

Use these phrases to recognize when the skill should be applied.

## Positive (Chinese)

- "这个测试 fixture 的 unwrap 失败时看不出是 mkdir、写文件还是业务断言。"
- "preflight harness 的负例偶尔失败，先把 mktemp 和 helper 复制阶段的错误说清楚。"
- "把临时 git 仓库 setup 的失败信息改成可交接的 expect 文案。"
- "测试里 shell out 到 git 的 fixture 命令失败时，要带 stderr 和阶段名。"
- "不要改产品行为，只改善测试夹具失败时的诊断信息。"

## Positive (English)

- "This test fixture unwrap does not tell whether tempdir creation or the real assertion failed."
- "Make the preflight harness setup failures readable before we debug the guard branch."
- "Add phase-specific expect messages for writing fixture files and copying helper scripts."
- "The temporary git setup in this test needs actionable failure messages."
- "Keep behavior unchanged; only improve fixture failure diagnostics."
- "If cleanup fails, the next agent should know which temporary repository path category was involved."

## Negative / Near Miss

- "Fix the production error message" when the change would alter user-facing behavior rather than test fixture diagnostics.
- "The test is flaky under network load" when the problem is timing or environment flakiness, not vague fixture setup errors.
- "Run all tests" when there is no owned test helper or fixture failure wording to improve.
- "Rewrite this test suite" when the request is broad and not focused on setup failure semantics.
- "Make assertions more detailed" when the behavior assertion itself is vague but the fixture setup is already clear.

## Narrow first

- If the workspace has unrelated dirty paths, restrict edits to the owned test helper or fixture file and stage by path.
- If a preflight negative case fails before reaching the guard, label fixture phases first, then rerun the focused harness.
- If command output includes temporary absolute paths, assert stable phase names and command categories instead of machine-specific paths.
