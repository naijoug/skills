# Excluded Boundary Reporting for Hourly Progress Runs

Use this reference near the end of a run when the workspace contains dirty repositories or handoff paths that this run intentionally did not touch. The goal is to make the final report and notebook useful for the next run without accidentally claiming, hiding, or normalizing unowned changes.

## Why this matters

A progress beat can be correct about the file it changed and still create future risk if it omits the files it avoided. In a multi-repo workspace, the next agent often reads the most recent notebook first. If the notebook only says what was completed, a later run may mistake pre-existing dirty paths for completed, verified, or safe-to-stage work.

Excluded-boundary reporting is the companion to path-limited staging: the run reports both the owned slice and the non-owned boundaries.

## When to apply

Apply this reference if any of these are true:

- Startup `git status --short` showed dirty repos that were not selected.
- The previous notebook suggested a handoff path, but that path already had uncommitted files before this run.
- A target repo was skipped because authorship or scope was unclear.
- Generated files, logs, build output, or another agent's work appeared near the selected path.
- The final response would otherwise mention only the clean repo that was committed.

## What to record

Record excluded boundaries in `后续接力` or a `Boundary condition` bullet using three parts:

1. **Path or repo:** use workspace-relative paths only.
2. **Reason:** startup dirty, untracked from another agent, generated/noise, unclear authorship, or intentionally out of scope.
3. **Instruction:** do not stage, verify ownership first, or continue only after user/agent confirmation.

Example:

```markdown
- Boundary condition: `makemoney/docs/interview-qa-day3-publish-kit.md` and its two referenced planning files were dirty before this run, so they were not staged; the next run should verify ownership before editing or committing them.
```

## Final response pattern

Keep the final response concise, but include the boundary when it changes the next action:

```text
下一段接力：先判断 `makemoney/docs/interview-qa-day3-publish-kit.md` 的未提交改动归属；若仍无法确认，不要 stage，改选 clean repo 的独立小任务。
未接管边界：`docs`、`loom`、`summaries/openclaw/2026-06-12.md` 启动前已有改动/未跟踪文件，本轮未触碰。
```

Do not list every dirty file if it makes the response noisy. Group by repo when the exact files are already in the notebook or when the repo is wholly out of scope.

## Do / avoid

| Do | Avoid |
| --- | --- |
| Say `not touched this run` for startup dirty paths | Letting silence imply the workspace was clean |
| Use `verify ownership before staging` | Saying `continue` without a safety condition |
| Keep paths relative | Writing local absolute paths |
| Separate completed commits from excluded boundaries | Mixing uncommitted boundary files into the change list |
| Group noisy repos in the final response | Claiming unknown files are user or agent work without evidence |

## Quick checklist

Before committing the notebook, check:

- [ ] `变更文件` lists only files actually changed by this run.
- [ ] Dirty startup repos that influenced selection are named in `规划与取舍` or `后续接力`.
- [ ] The final response's next step cannot be interpreted as permission to stage unknown files.
- [ ] Every boundary path is relative.
- [ ] The project commit hash and notebook commit hash are separate from uncommitted boundary paths.
