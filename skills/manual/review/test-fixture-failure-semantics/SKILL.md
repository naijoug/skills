---
name: ng-review-test-fixture-failure-semantics
description: Use when reviewing or editing tests whose fixture setup, external command, repository lock, cleanup, or snapshot preparation failures currently collapse into vague unwrap/assert errors and you need safer handoff-quality diagnostics without changing production behavior
---

# Test Fixture Failure Semantics

## Overview

Turn vague test fixture panics into failure messages that tell the next engineer or agent which setup phase failed. The goal is not to make tests more verbose everywhere; it is to make the rare failure actionable when a fixture creates directories, writes files, shells out, seeds storage, acquires locks, or cleans up state.

Core principle: a fixture failure message is handoff material. It should identify the phase, owned path or command category, and safe next narrowing step while preserving the behavior under test.

## When to Use

- A test uses bare `unwrap()`, `expect("failed")`, `assert!(status.success())`, or ignored cleanup around fixture setup.
- The failure would otherwise hide whether the issue is directory creation, fixture file write, external command execution, repository state, lock release, or cleanup.
- The change can be limited to test code or helper diagnostics.
- You have a focused test command that exercises the touched module.
- You are working in a dirty workspace and need a path-scoped, low-risk improvement.

## When Not to Use

- The `unwrap()` is in production code and changing it would alter user-facing error semantics.
- The failure already includes enough context to choose the next command.
- The test is flaky because of timing, concurrency, network, or environment behavior; fix or isolate the flake instead of only renaming the panic.
- The fixture helper is shared broadly and a wording change would churn many snapshots or unrelated assertions.
- You cannot separate this task's owned test files from pre-existing dirty paths.

## Procedure

1. **Snapshot ownership before editing.**
   - Run `git status --short` in the target repo.
   - Record dirty paths that are not yours and avoid staging them.
   - If the target test file is already dirty, inspect the diff before deciding whether to adopt or skip it.

2. **Map the fixture lifecycle.**
   - Split the test into phases: temp root, directories, file writes, external commands, repository/service calls, assertions, cleanup.
   - Name the phase that a future failure must reveal.
   - Keep the behavior assertion separate from setup diagnostics.

3. **Replace vague failures with phase labels.**
   - Use `expect("create temp project directory")` rather than `unwrap()`.
   - For external commands, include command category and capture stderr/stdout when the test helper already has access to them.
   - For cleanup, prefer explicit `expect("remove temp project directory")` when cleanup failure can affect later runs; ignore only when the test intentionally tolerates best-effort cleanup and document why.

4. **Keep the patch diagnostic-only.**
   - Do not change product code, lock lifetime, retry behavior, fixture data shape, or assertion meaning in the same patch.
   - If mapping the fixture exposes a real behavior bug, stop and re-plan as a behavior fix with a stronger test.

5. **Run the narrowest proof.**
   - Format if the language requires it.
   - Run the focused test module or test name.
   - Run `git diff --check -- <owned paths>`.
   - Read back `git status --short` and commit only owned paths.

## Rewrite Patterns

| Before | Better | Why |
| --- | --- | --- |
| `tempfile::tempdir().unwrap()` | `tempfile::tempdir().expect("create temp project directory")` | Separates environment/tempdir failure from app logic failure |
| `fs::write(path, body).unwrap()` | `fs::write(&path, body).expect("write package.json fixture")` | Names the fixture file that failed |
| `Command::new("git").args(args).status().unwrap()` | `Command::new("git").args(args).status().expect("run git fixture command")` | Distinguishes spawn failure from non-zero exit |
| `assert!(output.status.success())` | `assert!(output.status.success(), "git fixture command failed: {}", String::from_utf8_lossy(&output.stderr))` | Preserves command failure evidence |
| `fs::remove_dir_all(root).ok();` | `fs::remove_dir_all(root).expect("remove temp repository fixture")` | Makes cleanup failures visible when they can poison later tests |

## Handoff Template

```markdown
## Test fixture failure semantics

- Repo state before edit: `<git status --short summary>`
- Owned test path: `<repo-relative test file>`
- Fixture phases labeled:
  - temp root: `<message>`
  - file writes: `<messages>`
  - external commands: `<messages>`
  - cleanup: `<message or best-effort reason>`
- Behavior unchanged: `<what assertions or production paths were intentionally not changed>`
- Proof:
  - `<format command>` -> `<result>`
  - `<focused test command>` -> `<result>`
  - `git diff --check -- <owned paths>` -> `<result>`
- Commit boundary: `<cached paths or not committed reason>`
- Next safe command: `<first follow-up command if this fails later>`
```

## Quality Checklist

- Each new message names a fixture phase, not just "failed".
- Setup failures and behavior assertion failures remain distinguishable.
- External command failures expose stderr/stdout when practical.
- Cleanup handling is intentional: explicit failure or documented best effort.
- No production error behavior, retry policy, lock semantics, or fixture meaning changed in the same patch.
- Verification uses focused tests before broader suites.
- Reports use repo-relative paths and name excluded dirty boundaries.

## References

- Related book card: `books/tech-cards-handbook/chapters/ai-agent/test-fixture-failure-message-is-handoff.md`
- Related docs card: `docs/documents/trending/ai/test-fixture-failure-semantics.md`
- Related skill: `skills/skills/manual/review/next-safe-command-ladder/`
- Related skill: `skills/skills/manual/review/path-scoped-commit-boundary/`
