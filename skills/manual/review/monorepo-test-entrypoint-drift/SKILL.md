---
name: ng-review-monorepo-test-entrypoint-drift
description: Use when a monorepo test, typecheck, build, package script, or ad-hoc command may be resolving different code depending on cwd, package aliases, or built dist artifacts
---

# Monorepo Test Entrypoint Drift

## Overview

Detect and narrow cases where two commands that appear to test the same code actually enter the monorepo through different paths: package script vs workspace root, source alias vs built `dist`, hoisted dependency vs local package, or stale generated artifact vs current source.

Core principle: before fixing code, prove which entrypoint is being exercised. A passing or failing test is only useful if the command, cwd, package resolution, and source-vs-dist decision are recorded.

## When to Use

- A test passes from a package directory but fails from the workspace root, or the reverse.
- A UI/package-level test imports another local package and might read stale build output.
- A recent source change should affect a test, but the test result does not change.
- A monorepo has both `src/` and `dist/` artifacts, path aliases, project references, generated clients, or package manager workspaces.
- You are writing a handoff for the next agent and need the exact command boundary to be reproducible.

## When Not to Use

- The repo is a single package with no generated or built local dependencies.
- The failing command already points to a deterministic syntax/type error in the touched file.
- Investigating would require changing unrelated dirty files or rewriting the workspace toolchain.
- The next safe action is a destructive production command, credentialed deploy, or external service call.

## Procedure

1. Capture the current boundary.
   - Record `git status --short`, command cwd, package manager, exact command, and whether there are unowned dirty files.
   - Name the intended code under test and the package that imports it.

2. Form the source-vs-dist hypothesis.
   - Ask: should this command resolve to current `src/`, generated code, built `dist`, or an installed package copy?
   - If the answer is unknown, do not trust the pass/fail signal yet.

3. Run the smallest pair of commands that exposes drift.
   - Prefer one package-local command and one workspace-level command for the same test file.
   - If available, run once before rebuilding and once after rebuilding the dependency package.

4. Inspect import/alias configuration only after observing behavior.
   - Check package-level test config, workspace-level test config, `tsconfig` paths, package `exports`, and build output timestamps.
   - Avoid broad config rewrites unless the observed failure proves the current entrypoint is misleading.

5. Choose a narrow remediation.
   - Add a workspace-level alias only if root commands are a supported entrypoint.
   - Add a package script or doc note if only package-local commands should be supported.
   - Rebuild generated artifacts if the repo intentionally tests `dist`, and record that requirement.

6. Verify the same failing entrypoint turns green.
   - Re-run the exact command that failed or gave a stale result.
   - Add a focused regression test only when it protects the observed boundary.

## Drift Radar

| Signal | Likely cause | First check | Safe remediation |
| --- | --- | --- | --- |
| Package test passes, workspace test fails | root config lacks aliases | compare package and root test config | add root alias or stop supporting root command |
| Test ignores source change | import resolves to stale `dist` | rebuild dependency and rerun same command | alias to source or document required build step |
| Typecheck passes but test fails import | package `exports` differs from test alias | inspect `package.json` exports and test resolver | align resolver for supported entrypoint |
| UI test fails after core change | dependent package reads built core | run core build, then rerun UI test | package-level alias or workspace pretest build |
| CI-only failure | CI cwd/script differs from local | compare CI step and local command | reproduce CI entrypoint locally before patching |

## Output Template

```markdown
## Monorepo Test Entrypoint Drift

Initial status:
Supported entrypoint under review:
Observed command A:
Observed command B:
Source-vs-dist hypothesis:

| Check | Command / evidence | Result | Decision |
| --- | --- | --- | --- |
| Package-local behavior |  |  |  |
| Workspace behavior |  |  |  |
| Alias / exports inspection |  |  |  |
| Re-run failing entrypoint |  |  |  |

### Remediation
-

### Stop conditions
-

### Continue / Narrow / Stop
- Continue:
- Narrow:
- Stop:
```

## Example

```markdown
## Monorepo Test Entrypoint Drift

Initial status: only `apps/vitest.config.ts` is owned by this task; other dirty files are avoided.
Supported entrypoint under review: running selected package tests from `apps/` workspace root.
Observed command A: `cd apps/packages/skills-ui && pnpm test` passes by package-local config.
Observed command B: `cd apps && npx vitest run packages/skills-ui/test/selection.test.ts` fails to find a keyword added in core source.
Source-vs-dist hypothesis: workspace-level Vitest is resolving `@skills-manager/core` to built `dist`, not current `packages/skills-core/src`.

| Check | Command / evidence | Result | Decision |
| --- | --- | --- | --- |
| Package-local behavior | `pnpm --filter @skills-manager/ui test` | pass | package entrypoint is healthy |
| Workspace behavior | `npx vitest run packages/skills-ui/test/selection.test.ts` | fails before core rebuild | root command can observe stale dist |
| Alias / exports inspection | compare package and root Vitest configs | root lacks source aliases | add workspace aliases if root command is supported |
| Re-run failing entrypoint | same `npx vitest run ...` after alias | pass | remediation is limited to command boundary |

### Continue / Narrow / Stop
- Continue: same failing entrypoint passes and no unrelated dirty path is touched.
- Narrow: only package-local command is supported; document that instead of changing root config.
- Stop: fixing requires changing unrelated build outputs or unowned package files.
```

## Quality Checklist

- The handoff records cwd and exact command, not just "tests passed".
- The source-vs-dist hypothesis is explicit before changing code.
- At least one observed result distinguishes package-local from workspace-level behavior, or explains why only one entrypoint is supported.
- The remediation is scoped to the supported entrypoint.
- Stop conditions protect unowned dirty files and generated artifacts that are outside the task.

## References

- Public guide: `docs/documents/trending/ai/monorepo-test-entrypoint-drift.md`
- Next safe command skill: `skills/skills/manual/review/next-safe-command-ladder/`
