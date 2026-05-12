# Trigger Examples — debug-loom

## Positive (should trigger)

### Chinese

- "帮这个项目生成 debug.sh 和 debug-loom" (full bootstrap)
- "我现在开三个终端看日志，能不能自动化？" (multi-service log unification)
- "给 backend/web/desktop 做一个本地调试启动器" (orchestrator generation)
- "生成一个 service x mode 的调试矩阵" (matrix design)
- "debug.sh local/dev/online 怎么设计？" (per-service script patterns)
- "给项目加 start/stop/status/logs/doctor" (CLI scaffolding)
- "自动收集本地调试日志并诊断" (centralized logs + doctor)
- "AI 帮我看日志、改代码、重启服务、再跑一遍" (fix-and-retest loop)

### English

- "Create a debug-loom for this repo" (full bootstrap)
- "Generate per-service debug.sh scripts" (per-service script patterns)
- "Build a local debugging orchestrator with health checks and logs" (orchestrator generation)
- "I want AI to inspect debug logs and fix/retest" (fix-and-retest loop)
- "Add start/stop/status/logs/doctor to this project" (CLI scaffolding)
- "Design a service-by-mode launch matrix" (matrix design)

## Negative (should NOT trigger)

- "帮我写一个单元测试" (test authoring, not debug orchestration)
- "部署到生产" (deployment, not local debug)
- "搜索一下这个错误" (ng-tool-search)
- "解释这段代码" (code reading)
- "设计 API" (api-design)
- "做代码 review" (pr review)
- "Fix this one bug in login.ts" (single targeted fix, not a workflow)
