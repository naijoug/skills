# Trigger Examples — ng-plan-create

## Positive (Chinese)

- "为这次重构写一份实施计划，落到 docs/plans/" (full plan doc)
- "这个新功能先别动手，把里程碑和任务拆出来" (decomposition)
- "把 X → Y 的迁移拆成可执行的步骤" (migration plan)
- "我们要做一个新的支付模块，先写计划再写代码" (greenfield plan)
- "帮我把这个 epic 拆成多个 milestone 并标依赖" (milestone breakdown)
- "先不要改代码，给我一份包含风险、回滚和验收标准的执行计划" (risk-aware plan)
- "把这个跨端登录改造拆成三到五个可交付阶段" (phased delivery)

## Positive (English)

- "Draft an implementation plan for migrating sessions from Redis to Postgres" (migration plan)
- "Before we start, write a plan with milestones and risks for this feature" (greenfield plan)
- "Break this refactor into ordered tasks with verification steps" (decomposition)
- "Write a design plan for the new ingestion pipeline and save it under docs/plans/" (full plan doc)
- "Create a rollout plan with non-goals, dependencies, and rollback checks before implementation" (rollout plan)
- "Turn this vague feature request into milestones, tasks, risks, and validation commands" (structured plan)

## Negative / Near Miss

- "帮我看看这份 plan 写得对不对" (use ng-plan-review)
- "改一下 login.ts 里的 typo" (single-file edit)
- "解释这段代码做了什么" (use code-reading)
- "为这个 API 设计测试用例" (use test-case)
- "Run the existing migration script" (execution, not planning)
- "What do you think of the architecture here?" (review/critique, not draft)
- "直接实现这个登录按钮" (implementation, not planning)
- "Summarize this existing roadmap" (summarization, not drafting an implementation plan)

## Narrow first

- "帮我规划一下项目" → ask for the project scope, target outcome, and planning horizon before drafting.
- "写一个计划" → clarify whether this is an implementation plan, learning plan, release plan, or review request.
- "把需求拆一下" → ask for the known constraints, target repository/module, and expected output path.
