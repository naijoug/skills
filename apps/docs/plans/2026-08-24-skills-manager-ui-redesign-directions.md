# Skills Manager UI Redesign Directions — 决策记录

- **日期**：2026-08-24
- **作者**：Hermes
- **状态**：draft-for-implementation

## 背景

`apps/packages/skills-ui/` 已经具备可运行的 Web/Desktop 共享 UI：左侧 group sidebar、搜索、skills list、详情 summary/markdown/files/install tabs、repository import、refresh、translation、settings 和安装面板。近期 `output/imagegen/` 里产生了三组 Skills Manager 高保真 mockup prompt 与图片，但这些文件更像临时生成产物，不应直接进入 git 历史。

本记录把三组 prompt 中可落地的产品方向收敛成实现决策，供下一轮 UI 改造直接使用；原始 `output/` 继续保持未接管。

## 现有界面约束

从当前代码看，改造需要尊重这些已经存在的产品能力：

- `apps/packages/skills-ui/src/App.tsx` 维护 library/settings 两类主视图、group 选择、search query、sort direction、repository import/refresh/remove、detail tab 和 busy/status 状态。
- `apps/packages/skills-ui/src/components/GroupSidebar.tsx` 已有 Library、Repositories、Settings、local/imported repository group 入口。
- `apps/packages/skills-ui/src/components/SkillList.tsx` 已按 Local skills / Imported 分组，支持 collapse、选中态和排序。
- `apps/packages/skills-ui/src/components/SkillDetailView.tsx` 已有 Summary、Markdown、Files 和 Install 详情区。
- `apps/packages/skills-ui/src/components/InstallPanel.tsx` 已能表达安装目标、copy/symlink、conflict policy、安装/卸载结果。

因此本轮 redesign 不应重写产品模型，而应先重排信息架构、视觉层级和交互入口。

## 三个候选方向

| 方向 | Hero task | 适合解决的问题 | 风险 |
| --- | --- | --- | --- |
| Library Studio | 浏览、组织、理解 skills | 当前列表/详情视觉层级偏工具化，适合把 skill library 做得更亲和、更像知识资产库 | 容易过度装饰；需要避免每个 skill 都变 card |
| Command Workspace | 键盘优先搜索、过滤、快速打开 | 面向高频开发者，强调 `⌘K`、结果列表、上下文 inspector 和低 pointer travel | 暗色技术风容易变 terminal cosplay；需要强 focus/shortcut 细节 |
| Calm Reference | 阅读和理解选中 skill | 强化 Summary/Markdown/Files 的阅读体验，让 selected skill 成为主角 | 如果过于文档化，安装/管理动作可能被藏得太深 |

## 推荐路线

先采用 **Library Studio 的信息架构**，吸收 **Command Workspace 的搜索/快捷键入口**，保留 **Calm Reference 的阅读宽度约束**。

原因：

1. Skills Manager 的核心价值是“发现、理解、安装/维护可复用 skills”，而不是单纯命令启动器；Library Studio 更贴近第一性场景。
2. 现有代码已经是 sidebar + list + detail 三段式，Library Studio 可以渐进改造，不需要重写状态模型。
3. 命令式搜索可以作为主 search field 和后续 `⌘K` enhancement，而不是第一步就改成交互密集的 palette。
4. 详情阅读区需要借鉴 Calm Reference：文档列不超过约 720px，避免 tab 内容横向铺满导致可读性下降。

## 实施切片

### Slice 1：重排 Library shell（低风险）

目标：不改 adapter / data model，只调整 shared UI layout 和 CSS。

- 左侧 sidebar 固定为约 220–240px，保留 Library、Repositories、Settings 和 repository groups。
- main header 使用 `Your skills`、技能总数、一个突出 search field。
- repository import 从默认常驻主屏弱化为 Repositories view 或折叠入口，避免和浏览任务抢主视觉。
- skills list 与 detail preview 形成 2/3 + 1/3 或可响应的 split。

验收：

- `cd apps && pnpm --filter @skills-manager/ui test && pnpm --filter @skills-manager/ui typecheck`
- 手动检查 Web/Desktop 共享 UI 仍能切换 group、搜索、选择 skill、打开 Repositories/Settings。

### Slice 2：技能行和预览 sheet（中风险）

目标：提升列表扫描和选中详情理解效率。

- skill row 显示 title、description/relative path、category/source、installed/conflict 状态的轻量标签。
- selected detail header 显示 title、purpose、source、path、updated/install state。
- Summary / Markdown / Files / Install 保留为 compact secondary navigation。
- `Manage installs` 或 `Open skill` 只保留一个主按钮，其它动作移入 overflow。

验收：

- UI 测试覆盖选中 skill 后 active row、detail tab、install panel 仍可达。
- 视觉检查避免“卡片套卡片”、过多 status dots、等权 toolbar。

### Slice 3：Command search enhancement（后续）

目标：把搜索框升级为轻量命令入口，但不阻断基础 redesign。

- search placeholder 改为 `Search skills or run a command…`。
- 支持 `⌘K`/`Ctrl+K` focus search。
- 快捷键 hint、active result focus ring、filter count 变清晰。
- 真正的 command palette 另立设计，不和 Slice 1/2 混做。

验收：

- 单测覆盖 keyboard shortcut 不破坏输入框已有行为。
- 手动检查 macOS/Windows modifier 文案合理。

## 视觉约束

建议先用暖色浅色主题作为默认 redesign，避免同时引入深色主题变量扩张：

- canvas：soft ivory / warm neutral；surface：white；text：charcoal。
- primary accent：muted indigo-blue；installed：moss green；category accent：restrained clay/orange。
- body type：14–16px；skill row 高度保持 56–68px 可配置，兼容已有 `compactLists` 设置。
- radius：8–10px；divider：1px；shadow 只用于 preview sheet，且非常轻。
- monospace 只用于 path、command、shortcut，不把整个产品做成 terminal。

## 明确不做

- 不提交 `output/imagegen/` 原始图片和 prompt，除非后续明确移动到正式 design resources 并说明用途。
- 不把 repository import 做成 Library 首页常驻大型表单。
- 不做 dashboard metrics、masonry grid、marketing hero、browser chrome mockup。
- 不在本轮引入账号、云同步、计费或团队协作信息架构。

## 下一步建议

下一轮如果要实际改 UI，优先做 Slice 1：只动 `apps/packages/skills-ui/src/App.tsx`、相关 component className 结构和样式文件，避免碰 adapter、installer、desktop Rust 后端。提交前记录启动 dirty paths，并只暂存 UI layout 相关文件。
