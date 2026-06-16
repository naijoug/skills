# Uncommitted Continuation Triage

Use this when the previous notebook points to a good continuation, but the target repository already contains uncommitted files that look related to that continuation.

The goal is to avoid two bad outcomes:

- blindly committing work from an earlier run, another agent, or the user;
- abandoning a high-value thread just because the repo is dirty, when a safe adjacent slice exists elsewhere.

## Triage Steps

1. **Classify the dirty files before editing.** For each file, label it as one of:
   - `known-own`: created or modified by this exact run;
   - `previous-agent`: plausibly produced by an earlier unattended run, but not committed or recorded clearly enough;
   - `user-or-unknown`: cannot prove authorship;
   - `generated/noise`: caches, build output, logs, or editor artifacts.
2. **Do not stage `previous-agent` or `user-or-unknown` files.** Treat them as read-only context unless the current prompt explicitly asks to recover or commit them.
3. **Prefer a non-overlapping slice.** If the intended continuation requires editing the same dirty files, either:
   - choose another clean repository; or
   - create a separate additive artifact that does not touch the dirty paths.
4. **If the dirty artifact is useful, record it as context, not as this run's result.** Mention it in the notebook as an observed handoff candidate, with no claim that this run produced it.
5. **Only commit a dirty file when the evidence chain is explicit.** Safe evidence can include a same-run creation command, a same-run diff from clean state, or a direct user instruction to include that file.

## Decision Table

| Situation | Action |
| --- | --- |
| Target repo is clean | Continue normally with a small verified slice. |
| Target repo has unrelated dirty files | Edit only disjoint paths and stage explicitly, or switch repos. |
| Target repo has dirty files on the exact handoff path | Do not overwrite; switch to a clean adjacent asset or notebook-only planning if no safe slice exists. |
| Dirty files look like a completed previous slice | Validate/read them for next-step awareness, but do not claim or commit them. |
| Dirty files are generated caches | Leave them alone unless the repo policy says to clean generated noise. |

## Notebook Wording

When switching away because of uncommitted continuation files, record it plainly:

```markdown
- 上一段/当前状态：目标 repo 中存在与上一接力点相关的未提交文件，当前运行无法证明其来源；本轮只把它们作为上下文，不 stage、不提交。
- 本轮选择：改做一个 clean repo 中的独立小资产，避免混入未知改动。
```

## Commit Boundary Reminder

Before committing, run a path-limited status check and stage only this run's files:

```bash
git -C <repo> status --short
git -C <repo> add <exact-file-1> <exact-file-2>
git -C <repo> diff --cached --stat
```

If the staged diff includes a file not created or modified by this run, unstage it before committing.
