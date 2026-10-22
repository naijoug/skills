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

## Loom 共享指令切片（2ee7705）

Loom 已把 auto/global 注入、manual 显式 slash wrapper 和只读诊断接入设置 Skills 安装流程。共享指令归属用安装 ID 集合保存，正文/ledger/清单共用同一事务；两个工具共用项目 AGENTS.md 时，部分卸载保块，最后一个已核实使用者移除才删块。旧 marker 缺少归属、用户改动和其他安装仍依赖的内容冲突均阻止覆盖。cron 不注入。

Loom 最终 `pnpm check` 前端 108/Rust 206、release 构建通过；原生临时项目两目标安装、部分卸载与最后卸载已验证，原用户指令精确恢复。独立进程并发、跨 dataDir 恢复、CRLF/权限、受限 symlink、未知 wrapper（含空文件）和诊断只读均有回归。

源 `test_managed_instructions.py` 的同步/保全/异常 marker/CRLF/链接及安装冲突规则，已在 Loom `instructions_tests.rs`、`installers_tests.rs` 和前端安装面板测试建立对应覆盖。源测试仍保留，等 CLI/TUI 兼容和完整替代验收后再移除。Loom 对符号链接增加授权范围校验，wrapper 指向实际安装目录；旧管理器不能绕过 v2 清单保护。

该切片交付时一致更新仍待补齐；后续结果见下一节。CLI/TUI、GitHub API、翻译和旧数据接管继续实施，G1/G2 尚未整体关闭。

## 多使用者一致更新（Loom 72cb26e）

Loom 已支持选择全部使用者后统一更新共享指令内容：相关技能包、安装清单、指令正文与归属使用同一事务日志；少选使用者、不同内容要求或预览后目标变化会拒绝写入。独立指令文件仍按目标处理，当前托管安装的 M2b 出口通过，CLI/TUI 可以继续迁入共用服务。

Loom `pnpm check` 前端 109/Rust 211、release 与 debug app bundle 构建通过。测试覆盖六项资源在 12 个 rename 点中断后的跨 dataDir 整组恢复、全局三工具路径和诊断只读。原生临时项目 A → B 更新后两份包、共享块和清单指纹一致；批量卸载恢复原用户指令。统一恢复不代表跨文件系统瞬时原子性，事后用户编辑仍保留并报告待恢复。

本仓库旧管理实现保持 v2 写入保护，源测试继续作为迁移对照；实际 CLI 接线、旧数据归属重建与退役仍按 M2c/M4/G2/M7 执行。没有删除个人数据或旧管理应用。

## 无窗口 CLI 核心（Loom b93c1b9）

Loom 新增 `loom-skills`，通过同一 Rust 服务提供 tools/list/detail/install/uninstall/status/doctor/pending/recover；开发兼容入口为 Loom 的 `tools/skills-cli/skills-linker`，应用包内为 `Contents/MacOS/loom-skills`。它不启动桌面窗口，默认读取 Loom 来源库，也支持显式 `--skills-root`。默认 symlink、工具别名、分类、项目与显式自定义目标、force/slash/JSON 已接通。

源 CLI 与新 CLI 在同一合成来源逐字段对照了 list 的旧核心 JSON 字段；实际新 CLI 完成双工具 symlink 安装、doctor、指令 A → B 重装及卸载，源包保全。移动后的应用包 CLI 可从独立 cwd 运行，Info.plist 桌面主入口仍是 loom。实际 OS 锁验收确认 data-dir 覆盖不隔离协调域，更新独占准入拒绝新 CLI，CLI 输出未结束时仍阻止更新，退出后锁释放。

Loom 完整 check 前端 109/Rust 220、桌面打包通过；最终 JSON 字段修正另经 CLI 9 项、Clippy 和随包进程检查。用户手改安装与未托管内容不被 force 卸载，部分失败返回非零；旧 v1/TSV 仍等待显式迁移。用法和明确差异见 Loom `docs/skills-cli.md`。

M2c 仍未结束：TUI/ng/fzf 和更广兼容样本继续迁移。这里不把旧应用默认入口切到尚未完成全部交互能力的新 CLI，也不删除旧管理实现；退役继续以 G2 为前提。

## 退役前提

Loom 的完整替代门槛 G2（来源、安装、CLI/TUI、翻译、旧数据导入与回滚）通过后，才移除本仓库的管理应用、转发入口及专属依赖。此处不删除已安装技能、私人 app data、缓存、凭据或归档。
