# Trigger Examples — plan-create

## Positive (should trigger)

### Chinese

- "为这次重构写一份实施计划，落到 docs/plans/" (full plan doc)
- "这个新功能先别动手，把里程碑和任务拆出来" (decomposition)
- "把 X → Y 的迁移拆成可执行的步骤" (migration plan)
- "我们要做一个新的支付模块，先写计划再写代码" (greenfield plan)
- "帮我把这个 epic 拆成多个 milestone 并标依赖" (milestone breakdown)

### English

- "Draft an implementation plan for migrating sessions from Redis to Postgres" (migration plan)
- "Before we start, write a plan with milestones and risks for this feature" (greenfield plan)
- "Break this refactor into ordered tasks with verification steps" (decomposition)
- "Write a design plan for the new ingestion pipeline and save it under docs/plans/" (full plan doc)

## Negative (should NOT trigger)

- "帮我看看这份 plan 写得对不对" (use plan-review)
- "改一下 login.ts 里的 typo" (single-file edit)
- "解释这段代码做了什么" (use code-reading)
- "为这个 API 设计测试用例" (use test-case)
- "Run the existing migration script" (execution, not planning)
- "What do you think of the architecture here?" (review/critique, not draft)
