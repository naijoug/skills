# Failure Output Must Change the Next Plan

Use this reference when a check, build, search, or status inspection returns a failure or contradiction during an hourly progress run. The goal is not to punish failure; it is to stop the next notebook entry from pretending the original plan is still equally valid.

## Decision rule

A failure output should change at least one of these fields before the run continues:

1. **Scope:** shrink the slice to the part that can still be verified.
2. **Order:** fix the blocking issue before adding more surface area.
3. **Target:** switch to another repo or asset when the current workspace is unsafe to edit.
4. **Handoff:** record the failed command, reason, and first retry/check for the next run.

If none of these changes, the failure was probably ignored rather than incorporated.

## Classify the output

| Output type | Plan response | Notebook wording |
| --- | --- | --- |
| Dirty unrelated files | Avoid that repo or stage exact paths only | `避开 <repo>，因为已有非本轮改动 ...` |
| Build/test failure caused by this run | Repair or revert before commit | `失败后改为修复 ...，复跑 ... 通过` |
| Pre-existing build/test failure | Do not claim broad verification; use focused checks | `未跑/未通过广义检查：既有失败 ...；本轮用 ... 验证` |
| Missing file/API/context | Do discovery or switch to a better-defined asset | `因缺少 ...，本轮改为 ...` |
| Web/current scan yields no actionable signal | Stop scanning and choose a local asset | `扫描未产生可执行切片，转向 ...` |

## Minimal pattern

```markdown
- 观察到的失败/矛盾：`<command or check>` 返回 `<short result>`。
- 对计划的影响：从 `<old plan>` 改为 `<new plan>`。
- 验证边界：本轮只声称 `<verified claim>`，不声称 `<unverified claim>`。
- 接力入口：下一次先运行 `<first command or file check>`。
```

## Example

```text
原计划：继续在 `loom` 做日志 next/prev 跳转。
检查结果：`git -C loom status --short` 显示已有多处 UI 改动和设计文件未提交。
计划变化：不进入 `loom`，改为在 `skills/skills/cron/hourly-progress` 增补失败输出处理规则。
验证边界：只验证 skill 文档引用和格式，不声称 Loom 状态被修复。
接力入口：下一次若要回到 Loom，先重新检查 `git -C loom status --short` 并确认改动边界。
```

## Stop conditions

Stop and revise the notebook/final response if:

- A failed command appears in the transcript but not in the execution record.
- The final response says a broad check passed when only a focused fallback check was used.
- The next plan repeats the failed plan without naming what changed.
- A dirty repo was edited without explaining why the touched paths were safe to isolate.
