# Final Report Evidence Chain for Hourly Progress Runs

Use this reference after verification and before writing the notebook/final response. Its purpose is to prevent the last step of an autonomous run from turning attempted work, assumptions, or stale status into an overconfident completion report.

## The three-link chain

A final report is ready only when these three links are explicit:

1. **Change:** what file or behavior actually changed in this run.
2. **Evidence:** what command, parser, count, build, or read-back proves the change is present and within scope.
3. **Commit/readback:** what commit hash was created, or why a commit was not appropriate.

If one link is missing, do not smooth it over with optimistic wording. Either run the missing check, or record the gap as an unverified handoff item.

## Wording rules

Use verbs that match the evidence:

| Evidence state | Good wording | Avoid |
| --- | --- | --- |
| Build/test/check passed | `verified by ...` | `should work` |
| File read-back/count passed | `checked that ... contains/counts ...` | `probably updated` |
| Commit hash read back | `committed as <repo>: <hash>` | `will commit` |
| Check skipped for a concrete reason | `not verified: <reason>; next check is ...` | `looks fine` |
| Repo intentionally not committed | `not committed (<reason>)` | omitting the repo |

## Minimum evidence by change type

- **Markdown/book/skill text:** `git diff --check` plus a read-back assertion for the new heading/link/count/reference.
- **Notebook entry:** read or script-check the entry includes the current time block, relative paths, verification line, and handoff.
- **Code/UI behavior:** narrow type/test/build check when available; if skipped, name the exact missing command and next verification path.
- **Repo commits:** `git rev-parse --short HEAD` and `git log -1 --pretty=%s` after each commit that will be reported.

## Committed-state read-back

Do not copy commit hashes into the notebook or final response from memory, from a staged plan, or from the commit command's optimistic output alone. After each target repo commit that will be reported, read the committed state back with `git rev-parse --short HEAD` plus `git log -1 --pretty=%s` (or an equally focused log command) and use only that read-back value in the notebook/final response.

If the target repo has no commit in this run, write `no target repo commit` and name the reason instead of leaving the commit link implicit. If the notebook itself is committed after the target repo, read back the `summaries` commit hash before producing the final response.

## Final response skeleton

Use this skeleton only after the target repo and `summaries` repo have been committed or explicitly marked as not committed. Keep the wording short, but keep every evidence link visible:

```markdown
- 本轮选择：<repo/path + 小任务>；原因：<为什么安全/有价值>。
- 实际推进：<1–3 条具体变更>。
- Notebook：`summaries/hermes/YYYY-MM-DD.md`。
- Commits：
  - <target repo>: `<short_hash>` `<git log -1 --pretty=%s>`，或 `无项目提交（<原因>）`。
  - summaries: `<short_hash>` `<git log -1 --pretty=%s>`。
- 验证：<命令 + 结果摘要>。
- 未接管边界：<启动前 dirty path / 归属未知 path / 无>。
- 下一段接力：<下一轮打开的相对路径 + 第一条动作>。
```

Before sending, compare the skeleton against the latest `git status --short` for each mentioned repo. If a repo is still dirty only because of startup-dirty paths, report that boundary; if it is dirty because this run left files unstaged, either finish the commit or change the report to `not committed` with the exact reason.

## Notebook pattern

In `### 执行记录`, make the evidence chain auditable:

```markdown
- 实际推进：新增/修改了 ...，用于 ...。
- 变更文件：
  - `skills/skills/...`
  - `summaries/hermes/YYYY-MM-DD.md`
- 验证方式：
  - `git diff --check -- ...` 通过。
  - `python3 ...` 断言新引用存在、无本机绝对路径。
  - `<repo>` 提交 `<hash>`。
- 后续接力：下一次优先 ...；第一条验证命令是 ...。
```

## Stop conditions

Stop and repair the report before committing `summaries` if any of these are true:

- The final response contains a hash that has not been read back from git.
- The notebook says a check passed but the command was not run in this run.
- The notebook reports a project file as changed when the target repo status is clean and no new commit exists.
- The handoff depends on an unverified assumption without labeling it.
- Any notebook path contains a local absolute path instead of a workspace-relative path.
