# Skills Manager 已迁往 Loom

2026-10-25 用户明确将范围改为“只迁移管理功能，移除原项目的管理代码”；不再处理旧 Manager 数据。源码退役由此授权，不表示此前未完成的真实账号/桌面隔离验证已经通过。

## 当前归属

- 本仓库：技能内容、归档、元数据/routing 检查、技能自有脚本和模板。
- Loom：来源发现与管理、详情、安装/更新/卸载、共享指令/wrapper、doctor、事务恢复、CLI/TUI/ng、四 provider 翻译及设置。
- 已移除：独立 API/Web/Desktop/TUI、共享应用包、管理测试、工作区依赖、旧说明/计划，以及根目录专属启动/预览/打包入口。内容质量入口仍为 `bash scripts/skills-quality-check`。

## 使用

从本仓库显式提供技能目录给 Loom CLI；不要求相邻 Loom checkout：

```bash
"/Applications/Loom.app/Contents/MacOS/loom-skills" list --skills-root "$PWD/skills" --json
"/Applications/Loom.app/Contents/MacOS/loom-skills" tui --skills-root "$PWD/skills"
```

也可在 Loom 的 Settings → Skills 添加本地目录。安装、翻译及恢复的细节见 Loom 仓库 `docs/skills-cli.md` 与迁移验收记录。旧 v1/TSV/未知归属继续拒绝覆盖，不提供旧数据导入、接管或回滚功能。

## 数据与证据边界

技能/归档保留；唯一技能文档修改是修复已删除应用计划的参考链接，不改变技能行为。凭据、既有安装和未跟踪的 `.agents/`、skills-lock.json 保留。2026-10-26 按用户要求删除仓库内被忽略的 Manager 残留：`.skills-manager-data/` 旧库与仓库克隆、`.design/` 设计稿、`.output/` 生成图与发布记录、`.qa/` 设计 QA；本机未发现旧 Manager 安装或 app data。四个翻译 provider 真实账号实测继续 blocked；没有将合成测试当成真实模型通过。

退役前源版本为 `0f864ee`，管理实现可从 Git 历史恢复；Loom 已交付基线为 `46af4ba`，随后 `b5eca66` 的旧数据预览按新范围撤下。删除前曾另存 Git bundle 和生成的管理构建产物，该临时备份已于 2026-10-26 按用户要求删除，Git 历史是唯一恢复来源；逐文件清单保留在 Loom 验收记录中。双仓最终提交、内容哈希与验证结果记录在 Loom 当日退役验收中。

本轮验证：原仓及不含 Manager/Loom、屏蔽 Node/pnpm/cargo/tauri 的隔离内容副本均通过 32 项内容测试与 326 项 routing 管道用例。271 个技能/归档文件全部保留，唯一哈希变化为上述技能参考链接；归档字节与未跟踪文件保持不变。活动文档相对链接检查无失效项。
