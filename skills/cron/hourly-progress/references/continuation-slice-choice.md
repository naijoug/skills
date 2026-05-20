# Continuation Slice Choice

Use this reference when the previous notebook entry names a concrete next step, but the next step may be either too large, too cosmetic, or no longer the best use of the current beat.

The goal is to keep continuity without becoming trapped by yesterday's handoff. A handoff is a strong signal, not an obligation.

## Three-question gate

Before accepting the previous handoff as this run's task, answer these in order:

1. **Is the next action still specific?** It names a path, behavior, artifact, or check that can be completed without asking a human.
2. **Is the slice small enough for the cadence?** It fits the current run size after applying `references/cadence-sizing.md`.
3. **Is the result verifiable cheaply?** There is a focused diff/readback/build/test/check that proves the change worked.

If all three answers are yes, prefer the handoff. If any answer is no, either shrink it once or switch to another clean asset.

## Shrink once, then switch

When the handoff is valuable but too large, attempt exactly one shrink:

| Large handoff | Acceptable smaller slice | Stop and switch when |
| --- | --- | --- |
| Add next/previous navigation, scrolling, and selection state | Add a passive count, label, keyboard hint, or documented decision only | It requires refs, new state machines, or cross-component coordination |
| Build a complete tutorial | Add one outline section, example, or validation checklist | It needs research that cannot be verified in this run |
| Improve a product workflow end-to-end | Fix one visible default, empty state, or copy ambiguity | It touches data model, storage, and UI at once |
| Expand a validation or outreach chain | Remove one execution blocker or align one field name | The chain is already ready enough and blocked on real evidence |

Do not repeatedly shrink the same handoff across many beats if the remaining work keeps pointing to the same large interaction. Record the boundary and choose a different asset.

## Switch criteria

Switch away from the handoff when any of these are true:

- The previous task would be mostly visual polish with unclear user value.
- Verification would require a long manual scenario or brittle UI assumptions.
- The repo has become dirty in overlapping files.
- The remaining work needs product judgment, permission, real contacts, credentials, or user-specific context.
- Another clean repo has a small asset-building task with stronger verification.

## Notebook language

When switching, make the tradeoff explicit so the next run does not rediscover it:

```text
上一段接力点是 <handoff>。本轮评估后发现它需要 <state/refs/cross-component/manual validation>，超过当前节拍的小步边界；已将其降级为 later。本轮改选 <path/task>，因为它能在一个文件内完成并用 <check> 验证。
```

When shrinking and proceeding, state the reduced scope:

```text
上一段接力点是 <large handoff>。本轮只做其中的 <small passive slice>，不引入 <complex mechanism>；后续若仍要完整交互，需先写计划或等真实使用反馈。
```

## Example: log-filter continuation

**Previous handoff**: add next/previous match navigation to a log filter.

**Assessment**:

- Specific: yes.
- Cadence fit: partial; full navigation likely needs current match index, DOM refs, scroll behavior, and keyboard semantics.
- Cheap verification: partial; build can verify types, but behavior needs manual UI interaction.

**Decision**: Either shrink to a passive match count or stop after the count is implemented. If the count already exists, switch to another clean asset rather than adding complex navigation during a short beat.
