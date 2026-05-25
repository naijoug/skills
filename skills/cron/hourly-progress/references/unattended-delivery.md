# Unattended Cron Delivery Rules

Use this reference when the progress beat is running as a scheduled job with no human present and the final response will be delivered automatically.

The goal is to keep the run autonomous: do the useful work now, do not ask follow-up questions, and make the final output directly deliverable.

## Autonomy gate

At the start of the run, classify missing context into one of three buckets:

| Missing context | Action |
| --- | --- |
| Retrievable from the workspace, git, files, or the web | Look it up with tools before deciding. |
| Not retrievable but has a safe default | Proceed with the default and name the assumption in the notebook. |
| Not retrievable and would change a risky side effect | Avoid the risky action; choose a safer asset-building slice instead. |

Do not end the run with a question. In unattended mode, a question is not a handoff; it is a stall.

## Safe default ladder

When a previous handoff is vague or blocked by missing human context, step down this ladder until a complete slice is available:

1. Continue the previous concrete path if it is specific, small, and verifiable.
2. Shrink the previous task to one field, paragraph, check, or file.
3. Choose a clean reusable asset such as a skill reference, tutorial section, book index alignment, or test-backed maintenance fix.
4. If every candidate is blocked by dirty overlapping files or risky side effects, record the blocker and write only the notebook entry; do not invent progress.

## Final response rules

- Do not use a separate messaging or delivery tool; the scheduler delivers the final response.
- Put the primary report directly in the final response.
- If the job explicitly allows silence and there is genuinely nothing new to report, respond with exactly `[SILENT]` and no other content.
- Do not mix `[SILENT]` with a normal report.
- Include only facts that are backed by file readback, command output, diff, or commit hash.

## Notebook language

When acting without a human answer, record the assumption and boundary:

```text
本轮是无人值守 cron，不能等待澄清。缺失信息 <context> 无法从 workspace 检索，且直接执行 <risky action> 会产生不可逆副作用；因此改选 <safe slice>，用 <verification> 验证，并把 <blocked action> 留作需要人工上下文的 later。
```
