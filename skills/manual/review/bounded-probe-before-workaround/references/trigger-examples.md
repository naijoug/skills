# Trigger Examples

Use these examples to decide when `ng-review-bounded-probe-before-workaround` should run.

## Positive (Chinese)

- 在改脚本之前，先用有界探针确认这个命令是不是真的会卡住。
- 交接里说 `wrangler types --check` 可能不退出，先验证当前环境是否复现。
- 这个 release check 看起来有点可疑，先找一个最小安全验证再决定要不要改。
- 当前工作区很脏，先做只读探针，确认问题是不是本轮该接管。

## Positive (English)

- The previous agent said this command might hang; should I add a timeout wrapper?
- CI sometimes needs `CI=true`; verify before changing package scripts.
- Before patching the release workflow, prove whether the preflight actually fails.
- This looks flaky, but I only have an old note, not current output.
- I need a handoff that says whether the suspected bug is confirmed or dismissed.

## Negative / Near Miss

- Deploy/upload/publish this now. (No explicit authorization or safe dry-run exists.)
- The command failed just now with this stack trace. (Use root-cause debugging or next-safe-command ladder instead of re-proving suspicion.)
- Run the full test suite. (The user already selected the verification scope.)
- Add a timeout to every script. (First identify the single risky command.)

## Narrow first

- If the suspected command can mutate production state, switch to a dry-run/preflight or stop with an authorization note.
- If the handoff gives no exact command, first reconstruct the narrowest original check from nearby scripts or docs.
- If the repo already has unrelated dirty paths, record them as avoided paths and keep the probe command scoped to the candidate repo.
- If the first probe succeeds, do not patch; record `dismissed for now` and move to the next valuable task.
