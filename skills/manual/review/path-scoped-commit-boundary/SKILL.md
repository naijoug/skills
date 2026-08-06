---
name: ng-review-path-scoped-commit-boundary
description: Use when a repo is already dirty and you need to edit, verify, stage, and commit only the paths owned by the current task without absorbing unrelated user or agent changes
---

# Path-Scoped Commit Boundary

## Overview

Keep productive work moving in a dirty repository by turning ownership into a path-scoped contract. The goal is not to make the whole worktree clean; it is to make one small, verified change that can be staged and committed without mixing unrelated diffs.

Core principle: a dirty worktree is not a blocker if the current task has a clean ownership boundary, a narrow verification command, and a path-limited commit.

## When to Use

- `git status --short` shows existing modified or untracked files before your task starts.
- The requested continuation points at a repo with unrelated dirty paths.
- You can complete a useful slice by creating or editing files that are not already ambiguous.
- You need a final report or notebook entry that explains exactly what was committed and what was left alone.

## When Not to Use

- The target file is already dirty and you cannot identify which lines are yours.
- The requested action requires committing all outstanding changes.
- Verification necessarily depends on unrelated dirty files that may change the result.
- The next action is destructive, credentialed, production-impacting, or outside the user's stated scope.

## Procedure

1. **Snapshot startup state.**
   - Run `git status --short` before editing.
   - Copy the dirty path list into your working notes or notebook planning.
   - Mark candidate paths as `owned`, `avoid`, or `needs triage`.

2. **Choose an owned slice.**
   - Prefer a new file, a clean file, or a small hunk with unmistakable context.
   - If the obvious continuation touches an ambiguous dirty file, either shrink the task or switch to an adjacent asset.
   - Write the intended owned paths before editing.

3. **Verify narrowly first.**
   - Run checks scoped to the owned paths when possible.
   - Add a broader check only when it is cheap and its failure can be separated from pre-existing dirty state.
   - Record whether each command proves the file, the feature, or only formatting.

4. **Stage by explicit path.**
   - Use `git add -- <owned-path-1> <owned-path-2>`.
   - Do not use `git add .`, `git commit -a`, or broad interactive staging in a dirty repo.
   - Re-run `git diff --cached --name-only` before committing.

5. **Commit with read-back.**
   - Commit only after the cached path list matches the owned path list.
   - Read back `git log -1 --oneline` and include the hash in the handoff.
   - If the repo still has unrelated dirty files afterward, report them as avoided boundaries, not failures.

## Command Pattern

```bash
git status --short
# edit only owned paths
git diff --check -- <owned-path>
# optional: run the smallest project-specific validation for <owned-path>
git add -- <owned-path>
git diff --cached --name-only
git commit -m "<scope>: <specific owned change>"
git log -1 --oneline
```

## Output Template

```markdown
## Path-Scoped Commit Boundary

- Repo:
- Startup dirty paths:
  - `path` — avoided because ...
- Owned paths:
  - `path` — created/edited for ...
- Verification:
  - `command` -> result
- Cached path check:
  - `git diff --cached --name-only` -> only owned paths
- Commit:
  - `hash subject`
- Remaining dirty paths:
  - `path` — intentionally not touched
- Next safe command:
```

## Red Flags

- A commit contains paths not listed under `Owned paths`.
- The final report says "repo clean" when only the owned slice was cleaned.
- A notebook entry records absolute local paths instead of repo-relative paths.
- Verification output is copied from memory rather than from a command run in this task.
- The next handoff says "continue cleanup" without naming the first safe path or command.
