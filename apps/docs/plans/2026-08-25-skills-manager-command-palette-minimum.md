# Skills Manager Command Palette Minimum — 决策记录

- **日期**：2026-08-25
- **作者**：Hermes
- **状态**：slice-4a-to-4c-implemented; jsdom interaction proof added; compact inline rows tuned; second-batch selected-detail commands scoped and wired; next: async status polish

## 背景

`apps/packages/skills-ui/` 已完成 Library shell、列表/详情信息层级、`Manage installs` 主动作、搜索空状态和 `⌘K`/`Ctrl+K` 聚焦搜索。当前 search helper 明确写着 command palette actions 尚未启用，避免把搜索框误包装成完整 palette。

下一步如果要把 `⌘K` 从“聚焦搜索”升级为“轻量命令入口”，需要先定义最小真实命令集与不可做边界，避免继续堆 placeholder 或引入无法执行的动作。

## 原则

1. **先是真命令，再是 palette 外观**：每个命令必须能映射到已有 UI 状态或已有 adapter 能力。
2. **搜索仍是默认任务**：打开后第一焦点仍是搜索 skills；命令只作为可选 action rows 出现。
3. **不跨越运行时能力**：Web mode 不承诺本地安装；Desktop-only 动作必须显示不可用原因。
4. **不引入新产品域**：本 slice 不做账号、云同步、市场、团队协作或远程执行。
5. **可测试优先**：命令注册表先做成纯数据/纯函数，后续 UI 只消费命令 contract。

## 最小命令集

| 命令 | 触发文案 | 稳定关键词 | 真实动作 | 可用条件 | 验收 |
| --- | --- | --- | --- | --- | --- |
| Search skills | `Search skills` | `search`、`find`、`skill`、`skills`、`filter` | 聚焦并选中搜索框，切回 Library | 始终可用 | `focusSearchFromShortcut` 或 command handler 会 `setPrimaryView("library")`、`focus()`、`select()` |
| Open repositories | `Open repositories` | `repo`、`repos`、`repository`、`repositories`、`import`、`refresh`、`source`、`sources` | 打开 repository import/filter 区 | 始终可用 | `repositoriesOpen` 变为 true，more menu 关闭 |
| Manage installs | `Manage installs for selected skill` | `install`、`installs`、`target`、`targets`、`manage`、`local`、`desktop` | 切到 selected detail 的 Install tab | 有 selected skill detail | 无 selected detail 时 disabled，并解释 `Select a skill first` |
| `Copy skill path` | `Copy path for {skill}` | `copy`、`path`、`relative`、`link`、`location`、`clipboard`、`download` | 复用 detail overflow 的 copy/download fallback | 有 selected skill detail | 无 selected detail 时 disabled，并解释 `Select a skill first`；有 detail 时触发 clipboard，失败则下载 `.txt` fallback |
| `Translate summary` | `Translate summary for {skill}` | `translate`、`translation`、`language`、`summary`、`localize`、`i18n` | 打开 selected detail 的 Summary/translation panel | 有 selected skill detail | 无 selected detail 时 disabled；有 detail 时回到 Library/detail Summary，不直接提交翻译请求 |
| `Export Gist bundle` | `Export Gist bundle for {skill}` | `export`、`gist`、`bundle`、`share`、`markdown`、`clipboard`、`download` | 复用 detail overflow 的 Gist markdown bundle copy/download fallback | 有 selected skill detail | 无 selected detail 时 disabled；有 detail 时复制 bundle，失败则下载 `.md` fallback |
| `Open settings` | `Open settings` | `settings`、`setting`、`preferences`、`prefs`、`options`、`appearance` | 切到 Settings view | 始终可用 | `primaryView` 变为 settings，repository panel 关闭 |

### 关键词约束

- 命令过滤只匹配 stable command id、显式 `keywords` 和 `disabledReason`。
- 不匹配动态标题里的 selected skill name，避免名为 `Repo Reviewer` 的 skill 让 `>repo` 误召回 `Manage installs`。
- 不匹配 runtime hint 文案，避免 Web Mode hint 中的 `require` / `local` 等说明性词语变成未记录 alias。
- 新增命令或新增别名时，必须同步补 registry 测试和 search row 静态渲染测试。

## 暂不进入 palette 的动作

- `Import repository`：保留在 Repositories 区表单里；palette 只负责打开区域，不直接提交 URL。
- `Refresh repositories`：这是破坏当前浏览状态的异步动作，继续放在 Repositories/detail overflow，等有确认/状态反馈设计再纳入。
- `Install skill` / `Uninstall skill`：需要目标、mode、conflict policy、确认弹窗，不能作为单步命令。
- `Translate markdown`：第二批只接 `Translate summary`，避免一个 `translate` query 同时召回两个近似命令；Markdown translation 继续留在 detail tab 内。

## UI 行为草案

### 阶段 A：命令注册表，不出现 overlay

先新增 `commandPaletteCommands.ts`：

- 输入：`selectedDetail: SkillDetail | null`、`platformLabel` 或 capability flags。
- 输出：命令列表 `{ id, title, hint, disabledReason? }[]`。
- 只负责“哪些命令应该显示/禁用”，不持有 React state。

验收：

- 单测覆盖有/无 selected detail、Web/Desktop capability 文案。
- 不改变现有 UI 行为。

### 阶段 B：搜索框下方的 inline command rows

- 当 query 以 `>` 开头，在 search area 下方显示最多 4 条命令：

- 第一行固定是 `Search skills`。
- 后三行是 `Open repositories`、`Manage installs`、`Open settings`。
- disabled row 使用 `aria-disabled` 而不是原生 `disabled`，仍允许点击/Enter 进入执行层，以便在 command rows 附近显示同一条原因反馈。
- `Enter` 执行 active command；`Escape` 清空 query 并关闭 command rows；`ArrowUp` / `ArrowDown` 在可见命令中循环移动 active row。

验收：

- node 单测覆盖命令过滤/禁用逻辑。
- 组件测试覆盖 disabled 文案和 action labels。
- 手动检查不遮挡 skill list 第一行。

### 阶段 C：再评估是否需要真正 overlay

只有当 inline command rows 证明高频可用后，再考虑全屏/居中 overlay。否则不要为了“像 command palette”而重写信息架构。

## 实施切片建议

1. **Slice 4A：命令 contract**
   - 新增 `apps/packages/skills-ui/src/commandPaletteCommands.ts`。
   - 新增 `apps/packages/skills-ui/test/commandPaletteCommands.test.ts`。
   - 不改 `App.tsx` 行为。
2. **Slice 4B：inline rows UI**
   - 在 `SearchField` 下挂轻量 command rows。
   - 只实现 keyboard/鼠标选择，不做 overlay。
   - 更新 `searchShortcut.test.ts` 或新增组件静态渲染测试。
3. **Slice 4C：状态与可访问性打磨**
   - 补 `aria-controls` / `aria-expanded` / active descendant。
   - 明确 `Escape`、`Enter`、`ArrowUp/ArrowDown` 行为。

## 已完成实现记录

- **Slice 4A 已完成**：`apps/packages/skills-ui/src/commandPaletteCommands.ts` 定义了四个最小命令、runtime hint、disabled reason 与执行 contract；`apps/packages/skills-ui/test/commandPaletteCommands.test.ts` 覆盖顺序、可用性和 Web/Desktop 文案。
- **Slice 4B 已完成**：`SearchField` 在显式 `>` query 下渲染 inline command rows；command-mode query 不传入 skill filtering；命令执行复用现有 state action，不新增安装、卸载、刷新等高风险动作。
- **Slice 4C 已完成**：inline rows 已有 `listbox` / `option`、active descendant、`ArrowUp` / `ArrowDown`、`Enter`、`Escape` 的纯函数 contract 与静态 ARIA 测试。
- **Alias hardening 已完成**：命令 registry 使用显式 `keywords`，过滤不再依赖 hint 或 selected skill title，避免文案漂移造成 command matcher 行为漂移。
- **Execution interaction proof 已完成**：`SearchField` 的 keydown 副作用已抽成薄 helper，覆盖 active row + `Enter` 选择、disabled row 进入执行层、`Escape` 在空匹配时清空 command mode；并补了最小 jsdom DOM proof，真实验证 disabled row click、`ArrowDown` + `Enter` 选择和 `Escape` 清空后 rows 从 DOM 移除。
- **Disabled feedback polish 已完成**：disabled command rows 使用 `aria-disabled` 保持可触发，执行层将原因写入全局 status，并在 command rows 本地 `role="status"` live region 中使用 `Command unavailable: ...` 前缀；这样 row hint 仍是短原因（如 `Select a skill first`），就近 live feedback 则明确这是本次命令执行失败，不再与 disabled hint 完全重复。
- **Status lifecycle polish 已完成**：继续输入、成功命令、`Escape`、`ArrowUp` / `ArrowDown` 都会清理 command rows 本地 status；`Enter` 不预清理 status，而是交给执行层在 enabled/disabled 两条路径分别清理或报告原因。
- **Visual density polish 已完成**：inline command rows 从偏 overlay 的 54px 行高/大阴影收紧为 46px 行高、10px 横向 padding 和较轻阴影，active indicator 从 3px 收为 2px；目标是在完整 4 条命令展开时仍保留 skill list 首行的上下文，而不是让搜索区临时变成大面板。
- **Second-batch selected-detail commands 已完成**：新增 `Copy skill path`、`Translate summary`、`Export Gist bundle` 三个命令；它们只复用已有 detail overflow 行为和 clipboard/download fallback，不新增远程执行或直接翻译提交。无 selected detail 时统一 disabled reason 为 `Select a skill first`，保持执行层 status 反馈一致。

## 不做清单

- 不把 placeholder 改回 `Search skills or run a command...`，除非至少 Slice 4B 已完成。
- 不让 palette 直接执行安装、卸载、刷新等高风险异步动作。
- 不新建独立 command domain 或 routing layer；先复用 `primaryView`、`repositoriesOpen`、`activeDetailTab` 等现有 state。
- 不提交 `output/` 下的 imagegen 临时产物。

## 下一步

下一轮若继续 command palette，优先打磨第二批命令的异步 status 生命周期：`Copy skill path` / `Export Gist bundle` 在 clipboard promise 未完成前是否需要 `Copying...` / `Exporting...` 本地状态，以及 `Translate summary` 是否要在 command status 中说明“opened summary translation panel”。
