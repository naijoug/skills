# Personal skills consolidation — 2026-10-15

活动入口由 43 个减少为 25 个。8 个通用入口停用，8 个重复入口合并进
5 个现有主入口，2 个诊断入口下沉为按需阅读的项目文档。

## 新的工作流入口

| 入口 | 模式 |
| --- | --- |
| `ng-review-handoff-receipt` | 简短交接、改动归属、已有多会话协调 |
| `ng-review-agent-preflight-script-test` | 隔离正反例、fixture 失败诊断 |
| `ng-growth-engineering` | 四种工程辅导、调试练习生成、人的假设验证 |
| `ng-growth-income-asset-validation` | 每周实验、offer 验证、已授权的单渠道发布 |
| `ng-plan-create` | 创建、修改、审查计划；保留原 ID 以兼容已有安装 |

各入口只加载当前模式的 references。合并不会把计划请求升级成实施、
把辅导升级成自动修改，也不会让发布准备获得对外发送授权。

## 旧入口迁移表

| 旧 ID | 状态 | 当前处理方式 |
| --- | --- | --- |
| `ng-tool-search` | 停用 | 直接处理请求；原文仅归档 |
| `ng-meta-example` | 停用 | 直接处理请求；原文仅归档 |
| `ng-plan-code-reading` | 停用 | 直接处理请求；原文仅归档 |
| `ng-plan-test-case` | 停用 | 直接处理请求；原文仅归档 |
| `ng-review-api-design` | 停用 | 直接处理请求；原文仅归档 |
| `ng-review-pr` | 停用 | 直接处理请求；原文仅归档 |
| `ng-review-refactor` | 停用 | 直接处理请求；原文仅归档 |
| `ng-review-next-safe-command-ladder` | 停用 | 直接处理请求；原文仅归档 |
| `ng-review-path-scoped-commit-boundary` | 合并 | `ng-review-handoff-receipt` |
| `ng-review-multi-session-control-ledger` | 合并 | `ng-review-handoff-receipt` |
| `ng-review-test-fixture-failure-semantics` | 合并 | `ng-review-agent-preflight-script-test` |
| `ng-review-bounded-probe-before-workaround` | 下沉文档 | [bounded-probes.md](diagnostics/bounded-probes.md) |
| `ng-review-monorepo-test-entrypoint-drift` | 下沉文档 | [monorepo-entrypoints.md](diagnostics/monorepo-entrypoints.md) |
| `ng-growth-debugging-kata` | 合并 | `ng-growth-engineering` |
| `ng-growth-ai-coding-hypothesis-validation` | 合并 | `ng-growth-engineering` |
| `ng-growth-weekly-income-experiment` | 合并 | `ng-growth-income-asset-validation` |
| `ng-business-single-channel-offer-publish` | 合并 | `ng-growth-income-asset-validation` |
| `ng-plan-review` | 合并 | `ng-plan-create` |

## 源码保留与恢复

完整归档位于 [archive](../archive/skills/2026-10-15/README.md)。
`manifest.json` 记录旧 ID、原目录、替代入口及每个归档文件的 SHA-256。
归档保存迁移时的工作区内容，包含先前尚未提交的修复；并非回退到 HEAD。

停用不只设置 `allow_implicit_invocation: false`：该值仍允许显式调用。
这里移除活动目录中的旧入口，并将归档的 `SKILL.md` 与 `skill.yaml` 分别
更名为 `.disabled` 后缀，防止仓库递归扫描或导入时复活。

恢复时选择单个归档包，先确认原路径未被其他内容占用，再复制到原路径，
恢复两个入口文件名，并重新安装该项。合并项优先使用新的主入口，避免
同时恢复一套重复流程。归档的历史引用保持原样，不用于活动流程。

## 验证边界

结构与路由检查验证活动目录、有效引用、归档完整性和评分工具链。
路由 perfect 模式仍是评分冒烟测试，不是模型执行效果或成功率评测。

## 本次安装同步与检查结果

- 已检查 Codex、Claude 和 Amp 的全局目录及当前项目安装目录；指定的
  8 个停用项没有独立安装副本。
- 已移除 Codex/Claude 的旧 `plan-review` 链接、托管快捷命令和 manifest
  记录；两个已有计划安装均读取合并后的 `ng-plan-create`。Claude 的
  `plan-create` 快捷命令也已修正旧路径并支持创建/审查两种模式。
- 39 个本地测试、元数据检查和 326 条路由评分冒烟用例通过；CLI 实际
  活动目录为 25 项。新增 4 项生命周期检查保护归档完整性、不可发现性、
  替代入口和活动引用。
- 本次变更针对源码与本机安装入口，不包含重新打包或发布桌面应用。
