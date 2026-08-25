# Skills Manager Command Palette Minimum — 决策记录

- **日期**：2026-08-25
- **作者**：Hermes
- **状态**：draft-for-next-slice

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

| 命令 | 触发文案 | 真实动作 | 可用条件 | 验收 |
| --- | --- | --- | --- | --- |
| Search skills | `Search skills` | 聚焦并选中搜索框，切回 Library | 始终可用 | `focusSearchFromShortcut` 或 command handler 会 `setPrimaryView("library")`、`focus()`、`select()` |
| Open repositories | `Open repositories` | 打开 repository import/filter 区 | 始终可用 | `repositoriesOpen` 变为 true，more menu 关闭 |
| Manage installs | `Manage installs for selected skill` | 切到 selected detail 的 Install tab | 有 selected skill detail | 无 selected detail 时 disabled，并解释 `Select a skill first` |
| Open settings | `Open settings` | 切到 Settings view | 始终可用 | `primaryView` 变为 settings，repository panel 关闭 |

## 暂不进入 palette 的动作

- `Import repository`：保留在 Repositories 区表单里；palette 只负责打开区域，不直接提交 URL。
- `Refresh repositories`：这是破坏当前浏览状态的异步动作，继续放在 Repositories/detail overflow，等有确认/状态反馈设计再纳入。
- `Install skill` / `Uninstall skill`：需要目标、mode、conflict policy、确认弹窗，不能作为单步命令。
- `Translate` / `Export Gist bundle` / `Copy skill path`：属于 selected skill 的 secondary actions，继续在 overflow；后续可在第二批命令中按“有 selected detail”条件加入。

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

当 query 以 `>` 开头，或 query 为空且 search field 已 focus，可在 search area 下方显示最多 4 条命令：

- 第一行固定是 `Search skills`。
- 后三行是 `Open repositories`、`Manage installs`、`Open settings`。
- disabled row 可显示原因，但不可执行。
- `Enter` 执行 active command；`Escape` 关闭 command rows 但不清空 query。

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

## 不做清单

- 不把 placeholder 改回 `Search skills or run a command...`，除非至少 Slice 4B 已完成。
- 不让 palette 直接执行安装、卸载、刷新等高风险异步动作。
- 不新建独立 command domain 或 routing layer；先复用 `primaryView`、`repositoriesOpen`、`activeDetailTab` 等现有 state。
- 不提交 `output/` 下的 imagegen 临时产物。

## 下一步

下一轮优先做 **Slice 4A：命令 contract**。这是低风险、可验证的小块：只新增纯函数与测试，先把真实命令边界固定下来，再决定是否接入 UI。
