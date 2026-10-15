---
name: ng-review-content-only-docs-proof-gate
description: Use when a docs repository change is limited to markdown content or catalog entries and you need to prove the owned files without running an unnecessary full site build or absorbing unrelated dirty paths
---

# Content-only Docs Proof Gate

Verify the documentation paths owned by the task and state what the checks prove.
A narrow proof is sufficient when content and links are the only changed behavior;
renderer, navigation, dependency or checker changes need their project checks.

## Establish scope

- Read repository instructions and `git status --short`; distinguish task changes
  from pre-existing work. Inspect an already-dirty target before editing it.
- Identify changed Markdown/catalog files, new targets, and any rendering-dependent
  syntax. Honor a user request for a full build, preview or deployment verification.
- Do not exclude a failure in an owned file to make verification pass.

## Discover the project's checks

Read package scripts, CI and documented verification commands before choosing a
checker. Do not assume this skill's example scripts exist or install a new tool
just to match an example.

| Available evidence | Verification |
| --- | --- |
| Project provides a scoped Markdown/link/catalog checker | Use its documented arguments and inspect the actual checked file list |
| No checker exists | Read the owned content, check required frontmatter against project conventions, resolve changed local links/includes from the containing file, and verify catalog targets are included in the change |
| Rendering-dependent syntax, navigation, config, dependencies or checker code changed | Add the relevant existing build/test command |
| Check reaches unrelated dirty files | Use supported path filtering or explicit owned files and disclose the remaining limitation |

Use `git diff --check -- <owned paths>` for whitespace, not as evidence that links
or rendering work. Include new/untracked owned files explicitly; a diff against
HEAD alone may omit them. If no local check can resolve a route or rendering
behavior, state that gap rather than claiming a full pass.

### Optional project-specific example

Only in a repository that provides these scripts, commands might be:

```bash
python3 scripts/check-markdown-proof.py documents/trending/ai/new-page.md
python3 scripts/check-ai-catalog.py
```

Inspect those scripts' help or implementation before using flags such as
`--changed-from`, `--exclude` or `--list-files`. A repository without them uses the
discovery/manual path above; their absence is not a failed gate.

## Complete the task

Report owned files, checks actually run, results, and any unverified rendering or
excluded dirty paths. A review-only request produces findings; an edit request
produces the verified local edit.

Stage or commit only when the task's existing authorization includes it. Then
stage explicit owned paths and inspect both staged paths and diff hunks so
pre-existing changes in the same file are not included. Otherwise leave the
verified changes uncommitted; do not ask for commit permission just to finish.

For routing maintenance, see [trigger examples](references/trigger-examples.md).
