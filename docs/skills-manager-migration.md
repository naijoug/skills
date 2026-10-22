# Skills Manager 迁往 Loom：实施记录

状态：迁移进行中，旧应用和安装工具仍在；尚未满足退役条件。
目标执行计划位于 Loom 仓库 `docs/plans/2026-10-21/06:12-skills-module-migration.md`。

## 当前切片：基线与内容工具独立化

- 原基线 `a245966`；`349d622` 修复源应用测试依赖已归档技能名称和 UTC 日期的错误假设，不修改产品行为。
- 该提交后 `bash apps/scripts/skills-manager-check` 完整通过：内容测试 39 项、应用测试 96 项、Rust 测试 24 项，以及应用构建/typecheck/cargo check。
- 内容工具迁入 `scripts/quality/`，内容测试迁入 `tests/quality/`。唯一内容检查入口是 `bash scripts/skills-quality-check`，不依赖 apps、Node、Tauri 或 Loom checkout。
- 旧工具路径暂保留转发脚本；`apps/scripts/skills-quality-check` 同时执行内容检查和仍属于旧安装器的 7 项测试，供应用基线继续使用。
- 元数据、归档完整性、routing、who-am-i 内容测试留在本仓库；安装/注入测试待 Loom 相应实现验收后迁出。
- 源码中技能内容和 archive 未变；隔离副本检查与哈希对照结果由 Loom 的当日 migration dogfood 记录汇总。

## Loom 来源管理切片（84b128e）

Loom 已把入口放在 Settings 侧边栏的 Skills 板块，顶层仍是 Chat / Settings。
当前接通本地来源、GitHub/GitLab Git 来源与固定快照、搜索/详情/文件、操作进度/取消及执行记录。
Loom 完整检查前端 98 项/Rust 175 项通过，原生隔离来源的添加、刷新、重启、移除保全和返回 Chat 草稿已验。

该来源切片交付时，安装到各工具、共享指令、CLI/TUI、翻译与旧数据接管尚未完成，因此保留本仓库管理应用；后续安装进展见下节。
这项来源验收不代表 G1/G2 通过，也不授权删除旧 app data 或已安装技能。

## Loom 安装闭环与旧写入口保护

Loom 已实现 Settings → Skills 中的目标选择、copy/symlink 安装、显式更新、按已安装身份卸载及事务恢复。Loom 全量检查前端 106/Rust 192 通过；临时项目原生安装/更新/卸载与真实 Codex 发现/调用通过。完整替代 G2 仍未通过，共享指令、CLI/TUI、翻译、GitHub API 与旧数据迁移继续实施。

本仓库旧 Node 安装包、Rust 桌面和 skills-linker/TUI 在任何目标修改前预检清单，只接受 version 1（兼容未写 version 的旧 JSON）或不存在 JSON 时的旧 TSV。显式未来版本、损坏 JSON、非普通文件/symlink（含悬空链接）拒绝写入，强制覆盖/卸载也不绕过。Node/Rust 批量操作在修改第一项前检查全部所选目标，避免后一个 v2 目标导致前面已被修改。

`bash apps/scripts/skills-manager-check` 通过：应用 99 项、Rust 25 项、内容 32 项、旧安装/注入 8 项，以及 typecheck/build/cargo check。回归核对拒绝后技能、清单和用户指令保全；原有 v1 与 TSV 能力仍通过。检查使用临时 fixture，不触碰真实安装。

该保护不会更新已安装的历史二进制，也不让旧客户端参加 Loom 的跨进程事务锁。切换前仍须停止旧 Manager 写入；回退旧版本前恢复兼容清单和路径，不让旧程序直接接管 Loom v2。这里未删除旧应用、个人 app data 或技能内容。

## 退役前提

Loom 的完整替代门槛 G2（来源、安装、CLI/TUI、翻译、旧数据导入与回滚）通过后，才移除本仓库的管理应用、转发入口及专属依赖。此处不删除已安装技能、私人 app data、缓存、凭据或归档。
