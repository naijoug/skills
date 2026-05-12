# Trigger Examples — ng-plan-review

## Positive (should trigger)

### Chinese

- "review 最新代码，看看这个计划是否正确？docs/plans/2026-04-21-foo.md" (full plan validation)
- "帮我检查一下这份计划还能不能按原顺序执行" (sequencing check)
- "这份 plan 写完之后代码改了不少，重新 review 一下" (code-delta check)
- "这份计划你觉得对不对？需要优化什么？" (general critique)
- "用多个 agent 交叉 review 这份方案" (multi-agent cross-review)
- "评估一下这份重构计划，找出风险和缺口" (gap analysis)

### English

- "Review docs/plans/foo.md against the latest code — is it still valid?" (full plan validation)
- "Cross-check this plan with current HEAD and flag anything outdated" (code-delta check)
- "Validate this implementation plan before we start executing it" (pre-execution review)
- "Is the sequencing in this plan still correct after yesterday's merge?" (sequencing check)
- "Give me a second opinion on this plan — what's missing?" (gap analysis)

## Negative (should NOT trigger)

- "帮我写一份新的实施计划" (use ng-plan-create)
- "review 这个 PR" (use pr)
- "这段代码有什么问题？" (code review, no plan doc)
- "解释这份文档在说什么" (reading comprehension, not validation)
- "What should the plan look like?" (drafting, use ng-plan-create)
- "Run the plan for me" (execution, not review)
