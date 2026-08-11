# Trigger Rule Tightening Loop

Use this reference when a cron run continues a trigger-example scoring handoff and the next useful slice is a small rule change rather than a new document. The goal is to improve one measurable error class without hiding regressions behind a broad rewrite.

## When to use

Use this loop when all of these are true:

- A previous run produced an export / adapter / score report for `skills/` trigger examples.
- The handoff names one skill, label, or confusion pattern to inspect next.
- The target rule file or adapter path can be edited in one focused slice.
- The same score command can be rerun before and after the change.

Do not use it when the workspace has no reproducible score command, when the next step requires changing many skills at once, or when the intended improvement is only a naming / copywriting preference.

## Slice contract

Write the slice as a single hypothesis:

```text
Target skill: <skill id>
Observed error: <false negative | false positive | near-miss false trigger>
Rule hypothesis: <one phrase, regex, threshold, or exclusion to test>
Expected movement: <metric that should improve>
Regression watch: <metric or skill that must not worsen>
```

If the hypothesis needs more than one rule family, split it into separate cron runs.

## Execution steps

1. **Freeze the baseline.** Rerun the existing export / adapter / score command and save the key lines in the notebook: manual case count, missing predictions, positive recall, negative reject rate, and the target skill line.
2. **Inspect only target evidence.** Read the target skill's `references/trigger-examples.md` plus the score rows for its misses or false triggers. Do not browse unrelated skills unless the score report names them as confusion partners.
3. **Change the smallest rule.** Add, narrow, or reorder one rule branch. Prefer exact phrase or bounded keyword sets before broad fuzzy matching.
4. **Rerun the same score.** Compare the same metrics. If the target improves but a named regression watch worsens, either tighten again in the same file or revert the rule.
5. **Add one focused assertion when cheap.** A tiny script that prints `target_hit`, `near_miss_false`, or similar counts is enough; avoid building a full harness during the cron slice.

## Stop rules

Stop and record a blocker instead of editing more when:

- The baseline command fails before your change.
- The target skill examples are ambiguous or contradict the desired behavior.
- The first rule change improves the target only by causing broad false positives.
- The adapter has accumulated enough special cases that a test fixture or refactor is the next safer slice.

## Notebook proof shape

Record the result in this compact form:

```text
Baseline: manual cases <n>; missing <n>; overall recall <x>; negative reject <y>; target <before>
Change: <one rule branch or file section>
After: manual cases <n>; missing <n>; overall recall <x>; negative reject <y>; target <after>
Regression watch: <skill/metric> stayed <same|acceptable> or failed because <reason>
Next path: <relative path>
Next slice: <one rule/test/refactor step>
Verification: <exact command to rerun>
```

This makes the next cron run executable without reinterpreting the full score report.
