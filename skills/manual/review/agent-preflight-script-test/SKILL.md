---
name: ng-review-agent-preflight-script-test
description: Test preflight scripts with isolated allow/deny fixtures, or improve test-fixture failure diagnostics without changing the tested behavior.
---


# Preflight and Fixture Tests

Prove that a preflight enforces its actual contract and that fixture failures are
distinguishable from behavior failures. Use this for test authoring or diagnostic
repair, not merely to execute an existing test suite.

## Choose a mode

- Adding or changing a repeated guard: read
  [preflight cases](references/preflight-cases.md).
- Setup, subprocess or cleanup failures obscure the test result: read
  [fixture diagnostics](references/fixture-diagnostics.md).
- Use both only when the guard's harness needs both kinds of work.

Inspect the script, its direct dependencies and project test conventions. Reuse
an existing harness where practical. Construct disposable local fixtures; do not
use live credentials or production resources to simulate a successful guard.

Keep changes scoped to the requested behavior. If investigation finds a product
bug, distinguish it from diagnostic cleanup and handle it within the task's
existing authorization. Do not hide a behavior change inside a message rewrite.

## Verify and deliver

Run the relevant fixtures and the narrow project checks. A negative test must
reach the intended guard and fail for the intended reason; setup failure alone
is not proof. Report covered contracts, actual results and any remaining gaps.
Commit only if the task already authorizes it.

For routing maintenance, see [trigger examples](references/trigger-examples.md).
