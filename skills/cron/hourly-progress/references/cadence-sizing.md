# Cadence Sizing Rules

Use these rules when the same autonomous progress skill is triggered more frequently or less frequently than the original hourly rhythm. The goal is to keep each run useful without turning the notebook into busywork.

## Match the Slice to the Cadence

| Cadence | Default scope | Good output | Stop condition |
| --- | --- | --- | --- |
| 15 minutes | One tiny, isolated slice | One focused code/doc/skill tweak, or one decision plus a precise handoff | Verification would exceed the slot, or the next step needs broader design |
| Hourly | One small complete task | A tested feature tweak, coherent doc section, reusable reference, or book draft slice | Changes touch too many files or mix repos |
| Daily | One larger asset-building block | A chapter section, tutorial, product milestone, or trend-to-experiment plan | The work should be split into several independently reviewable commits |

## Quarter-Hour Mode

When running every 15 minutes:

1. **Bias toward continuation.** Start from the previous notebook handoff and complete only the next bounded step.
2. **Prefer read/decide/patch/verify loops.** Avoid exploratory work that cannot produce a reviewable diff quickly.
3. **Do not escalate complexity just because context is fresh.** If a follow-up needs new state models, UI architecture, or long builds, record the decision gate and switch to a smaller asset.
4. **Use focused verification first.** Run the cheapest check that proves the slice, then add broad checks only when the touched repo and time budget justify it.
5. **Keep the handoff executable.** Name the next path, next slice, boundary condition, and verification command.

## Cadence Downgrade Rule

If two consecutive quarter-hour runs in the same area only produce planning or increasingly speculative follow-ups, stop extending that area. Choose a different clean repo or create one reusable process artifact that makes future selection easier.

## Cadence Upgrade Rule

If a quarter-hour slice reveals a larger task with clear value, do not start it immediately. Leave a handoff that says:

- what larger task is now visible;
- what prerequisite design or test check is needed;
- what the smallest first commit should be;
- when to defer it in favor of a clean fallback.
