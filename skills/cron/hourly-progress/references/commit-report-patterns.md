# Commit and Report Patterns for Hourly Progress Runs

Use this reference after verification and before the final response. The goal is to preserve clear ownership in a multi-repo workspace: project work is committed in its own repo, the Hermes notebook is committed in `summaries`, and the final response gives the next run enough context without re-reading every diff.

## Commit order

1. **Re-check target repo status.** Confirm only this run's intended paths are dirty or staged.
2. **Stage explicit paths only.** Avoid `git add .` in dirty workspaces.
3. **Commit the target repo first.** This records the actual asset/code/content change before the notebook references it as completed.
4. **Append/update `summaries/hermes/YYYY-MM-DD.md`.** Include the target commit hash in the execution record when useful.
5. **Commit `summaries` separately.** The notebook commit should only include the daily Hermes note unless the run intentionally changed other summary files.
6. **Final response lists both hashes.** If a repo has no project commit, say so instead of inventing one.

## Safe staging commands

From the target repo:

```bash
git status --short
git diff --check -- path/to/file.md path/to/file.ts
git add path/to/file.md path/to/file.ts
git diff --cached --stat
git diff --cached --check
git commit -m "Add hourly progress commit report patterns"
git rev-parse --short HEAD
```

From `summaries`:

```bash
git status --short
git add hermes/YYYY-MM-DD.md
git diff --cached --stat
git diff --cached --check
git commit -m "Record Hermes hourly progress for YYYY-MM-DD HH:MM"
git rev-parse --short HEAD
```

## Commit message patterns

Prefer short, concrete messages that name the asset or behavior changed:

- `Add <topic> reference to hourly progress skill`
- `Test <page/component> behavior`
- `Document <workflow/decision> guide`
- `Refactor <test/helper> fixtures`
- `Record Hermes hourly progress for YYYY-MM-DD HH:MM`

Avoid vague messages:

- `Update files`
- `Hourly work`
- `Misc changes`
- `Fix stuff`

## Final response hash report

Before writing the final response, collect hashes from the repos that were actually committed in this run:

```bash
# Work repo, only if this run committed project/asset changes there
git -C <repo> rev-parse --short HEAD
git -C <repo> log -1 --pretty=%s

# Notebook repo, after committing the Hermes note
git -C summaries rev-parse --short HEAD
git -C summaries log -1 --pretty=%s
```

Report them as separate lines; never collapse the work commit and the notebook commit into one ambiguous hash. If multiple work repos were intentionally changed, list each repo separately, but prefer one work repo per hourly run.

Use one of these states for every relevant repo:

- `<repo>: <hash> <subject>` — a commit was created by this run and the hash was read back.
- `<repo>: no commit` — the repo was inspected but no file was changed or no commit was appropriate.
- `<repo>: not committed (<reason>)` — files changed but the commit was intentionally skipped; include the concrete reason.

## Final response template

```text
本轮选择：<one sentence>
实际推进：<one sentence with changed asset/code/content>
Notebook：summaries/hermes/YYYY-MM-DD.md
Commits：
- <repo>: <hash> <commit subject>
- summaries: <hash> <commit subject>
下一段接力：<specific next slice>
```

If no project repo changed:

```text
Commits：
- summaries: <hash> <commit subject>
项目提交：无（本轮仅观察/规划，或无安全小任务）
```

If project work happened but commit was intentionally skipped, state the reason explicitly, for example:

```text
项目提交：未提交（目标 repo 存在同路径既有改动，无法可靠隔离本轮变更）
```

## Notebook wording for commits

In the `执行记录` section, keep commit details auditable but not noisy:

- `验证方式` should mention the strongest relevant commands and their result.
- `变更文件` should include only relative paths.
- `后续接力` should point to a concrete next file or decision.
- If a commit hash is included, use short hashes and repo names, e.g. `skills: abc1234` and `summaries: def5678`.

## Red flags before reporting

Stop and re-check status if any of these appear:

- The final response claims a commit hash not returned by `git rev-parse --short HEAD`.
- `summaries` includes files outside `hermes/YYYY-MM-DD.md` without explanation.
- A target repo commit includes broad generated files or unrelated user changes.
- The notebook uses local absolute paths instead of workspace-relative paths.
- The final handoff says only "continue" without naming the next concrete slice.
