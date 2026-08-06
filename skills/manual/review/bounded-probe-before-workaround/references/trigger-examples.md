# Trigger Examples

Use these examples to decide when `ng-review-bounded-probe-before-workaround` should run.

## Strong triggers

- "The previous agent said this command might hang; should I add a timeout wrapper?"
- "CI sometimes needs `CI=true`; verify before changing package scripts."
- "A handoff says `wrangler types --check` printed success but maybe did not exit."
- "Before patching the release workflow, prove whether the preflight actually fails."
- "This looks flaky, but I only have an old note, not current output."
- "在改脚本之前，先用有界探针确认这个命令是不是真的会卡住。"

## Medium triggers

- "Should I work around this tool behavior or just document it?"
- "The release check is suspicious; find the smallest safe validation first."
- "A dirty workspace makes me nervous; choose a read-only probe before editing."
- "I need a handoff that says whether the suspected bug is confirmed or dismissed."

## Non-triggers

- "Deploy/upload/publish this now" when no explicit authorization or safe dry-run exists.
- "The command failed just now with this stack trace"; use root-cause debugging or next-safe-command ladder instead of re-proving suspicion.
- "Run the full test suite" when the user already selected the verification scope.
- "Add a timeout to every script" without first identifying the single risky command.

## Narrow first

- If the suspected command can mutate production state, switch to a dry-run/preflight or stop with an authorization note.
- If the handoff gives no exact command, first reconstruct the narrowest original check from nearby scripts or docs.
- If the repo already has unrelated dirty paths, record them as avoided paths and keep the probe command scoped to the candidate repo.
- If the first probe succeeds, do not patch; record `dismissed for now` and move to the next valuable task.
