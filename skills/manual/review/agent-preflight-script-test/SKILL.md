---
name: ng-review-agent-preflight-script-test
description: Use when an agent, cron job, CI helper, or repository preflight script has default target inference, path guards, dirty-worktree checks, or handoff-format rules and you need to add lightweight self-tests before relying on it repeatedly
---

# Agent Preflight Script Test

## Overview

Preflight scripts become infrastructure once agents or cron jobs run them every cycle. Treat the script itself as a tested artifact: build a temporary workspace, copy only the scripts under test, construct minimal positive and negative fixtures, and verify exit codes plus stable output before trusting the preflight as a guardrail.

Core principle: a preflight test proves the guardrail fails closed. It should demonstrate both that valid handoff artifacts pass and that dangerous cases such as wrong paths, missing required fields, absolute paths, or empty target sets fail.

## When to Use

- A script is used by scheduled agents, handoff workflows, release checks, or repeated local preflight.
- The script infers a default target such as the latest notebook, current date, changed files, or repo root.
- The script enforces high-cost rules: no absolute paths, no wrong repo staging, no missing evidence fields, no silent empty proof scope.
- You just fixed a bug caused by running from the wrong working directory, checking the wrong date, or letting an invalid artifact pass.
- The self-test can run locally without network, credentials, external services, or wall-clock assumptions.

## When Not to Use

- The command is a one-off migration script that will be deleted immediately after use.
- The script depends on a production service, real credentials, mutable external APIs, or large fixtures that make a fast self-test impractical.
- The requested task is to run a full product test suite or deployment verification, not to improve the preflight itself.
- You cannot separate owned script paths from pre-existing dirty paths.
- A failing preflight indicates a real product bug that needs behavior work before test harness extraction.

## Procedure

1. **Snapshot ownership before editing.**
   - Run `git status --short` in the target repo.
   - Record pre-existing dirty paths and avoid staging them.
   - If the preflight script is already dirty, inspect the diff before editing or choose another slice.

2. **Name the contract before writing tests.**
   - Identify the script under test and its invocation directory.
   - Write down required pass conditions, fail-closed conditions, and stable output markers.
   - Prefer repo-relative paths in both fixtures and assertions.

3. **Use a temporary workspace.**
   - Create `mktemp -d` and clean it with `trap`.
   - Copy the script under test and only its direct helper scripts.
   - Build the smallest directory tree the script expects.
   - Initialize a temporary git repo if the script calls `git diff --check`, changed-file logic, or staged-path checks.

4. **Cover at least one positive and one negative branch.**
   - Positive: a minimal valid artifact exits 0.
   - Negative: a bad path, missing required field, absolute path, empty target set, or invalid default inference exits non-zero.
   - If the script has default target inference, include an explicit-target case and a default-target case.

5. **Assert exit codes first, output second.**
   - Test success and failure via command status.
   - Match only stable short phrases in output.
   - Do not match `mktemp` absolute paths, timestamps, process IDs, or machine-specific directories.

6. **Prove and commit path-scoped.**
   - Run the new self-test script.
   - Run the preflight against the real owned artifact, if one exists.
   - Run `git diff --check -- <owned paths>`.
   - Stage only the self-test, the script under test, docs references, and any owned handoff record.

## Minimal Harness Pattern

```bash
#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

mkdir -p "$workdir/summaries/scripts" "$workdir/summaries/hermes"
cp "$repo_root/scripts/check.sh" "$workdir/summaries/scripts/check.sh"
cp "$repo_root/scripts/check-hermes-notebook.sh" "$workdir/summaries/scripts/check-hermes-notebook.sh"

(
  cd "$workdir/summaries"
  git init -q
  git config user.name test
  git config user.email test@example.com
)

# Add tiny valid and invalid fixtures, then assert command status.
```

## Branch Matrix

| Script behavior | Fixture | Required assertion |
| --- | --- | --- |
| Explicit target | Create one valid `summaries/hermes/YYYY-MM-DD.md` | `script path/to/file` exits 0 |
| Default target | Create two valid dated files | No-arg run selects the latest intended file |
| Empty target set | Leave target directory empty | No-arg run exits non-zero and asks for explicit path |
| Format guard | Omit one required field | Checker exits non-zero |
| Path guard | Include a local home or temp absolute path | Checker exits non-zero |
| Invocation boundary | Run from the documented repo/workspace root | Output and docs use repo-relative paths |

## Handoff Template

```markdown
## Agent preflight script test

- Repo state before edit: `<git status --short summary>`
- Preflight under test: `<repo-relative script>`
- Self-test path: `<repo-relative test script>`
- Branches covered: explicit target / default target / empty target / rejection case
- Fixture strategy: `mktemp` workspace, copied scripts, temporary git repo if needed
- Proof:
  - `<self-test command>` -> `<stable success phrase>`
  - `<real preflight command>` -> `<stable success phrase>`
  - `git diff --check -- <owned paths>` -> exit 0
- Commit boundary: `<cached paths or not committed reason>`
- Next branch to add: `<one missing behavior>`
```

## Red Flags

- The test creates bad fixtures in the real repository.
- Only the happy path is tested, so a broken guard could still pass invalid artifacts.
- Assertions depend on current date, local home directory, or temporary directory names.
- The self-test calls the main preflight and the main preflight calls the self-test without a recursion boundary.
- The handoff says "ran preflight" but does not say which branches the self-test covered.
- The commit stages unrelated dirty paths because the test harness copied or generated files in the real repo.

## References

- Related docs: `docs/documents/trending/ai/agent-preflight-script-test-template.md`
- Related docs: `docs/documents/trending/ai/agent-cron-planning-execution-verification-loop.md`
- Related docs: `docs/documents/trending/ai/content-only-docs-proof-gate.md`
- Related skill: `skills/skills/manual/review/content-only-docs-proof-gate/`
- Related skill: `skills/skills/manual/review/next-safe-command-ladder/`
- Related skill: `skills/skills/manual/review/test-fixture-failure-semantics/`
- Related skill: `skills/skills/manual/review/path-scoped-commit-boundary/`
