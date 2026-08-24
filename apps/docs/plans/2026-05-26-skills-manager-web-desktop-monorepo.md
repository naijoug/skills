# Skills Manager Web/Desktop Monorepo — 实施计划

- **日期**：2026-05-26
- **作者**：Codex
- **状态**：in-progress

## 目标

将 Skills Manager 演进为一个 monorepo 产品：同一套共享前端、同一套 skills 领域核心能力，同时支持 Web 端和桌面端两种形态。Web App 和 Desktop App 应该提供一致的 skills 管理体验，但通过不同的平台适配层处理仓库导入、本地存储和翻译能力。

## 非目标

- 第一阶段交付 Tauri 桌面壳，不同时交付 Electron；适配层边界保留未来补充 Electron 的空间。
- 本轮不做云端账号、团队协作、跨设备同步、计费或托管服务。
- 不在纯浏览器客户端保存或暴露用户的 OpenAI API Key。
- 不修改现有 `skills/**/SKILL.md` 内容；新增安装能力可以复用或兼容当前 `skills-linker` 规则，但不能破坏它的既有行为。

## 成功标准

- `apps/` 下的 monorepo 可以分别运行 Web App 和 Desktop App，并共享同一套 skills 列表、group 视图、详情页、搜索和翻译 UI。
- Monorepo 使用 `pnpm` 管理 workspace、依赖和脚本。
- 共享解析逻辑可以处理当前仓库的 24 个本地 skills，也可以处理导入的 GitHub skills 仓库，且 Web/Desktop 不重复实现解析逻辑。
- 桌面端可以将 GitHub 仓库导入本地缓存，并支持刷新。
- Web 端同时支持服务端 clone/cache 和 GitHub API 只读读取两种仓库来源，不直接访问用户本地文件系统，也不在浏览器中持有敏感 API Key。
- 翻译能力通过 provider 抽象接入，第一阶段至少提供 OpenAI provider。
- 桌面端导入仓库时先保存到本地缓存和本地 library 元数据，再进入列表展示。
- 支持将选中的 skills 安装到不同 agent 工具，第一阶段至少支持 Codex 和 Claude Code，并保留扩展到其他工具的目标接口。
- 旧 Python MVP 已退役，常规开发、验证和发布路径只保留 monorepo Web/Desktop。
- 验证覆盖解析/搜索单元测试、adapter contract tests，以及 Web 和 Desktop 各一条端到端 smoke 路径。

## 当前状态

- `apps/skills-manager-api/`：Web 端本地 API，负责本地扫描、服务端 clone/cache、GitHub API 只读读取、详情读取、翻译代理和 Web 安装边界。
- `apps/skills-manager-web/`：Vite + React Web App，复用共享 UI 和 Web adapter。
- `apps/skills-manager-desktop/`：Tauri 桌面壳，复用共享 UI 和 Desktop adapter；本地文件系统、Git cache、翻译配置和 agent 安装通过 Tauri commands 完成。
- `apps/packages/*`：领域核心、平台适配、UI、翻译 provider、agent 安装抽象。
- `apps/package.json`、`apps/pnpm-workspace.yaml`、`apps/pnpm-lock.yaml`、`apps/tsconfig.base.json`：pnpm workspace 和 TypeScript workspace 根。
- `.skills-manager-data/`：已忽略的本地缓存目录，用于保存导入仓库和 library 元数据。
- `skills/**/SKILL.md` 与可选 `skill.yaml`：当前需要解析的主要内容格式。
- `README.md`：记录当前 skills 仓库结构和已有 CLI/TUI 工具。

可复用内容：

- 当前领域行为：发现 `SKILL.md`、解析 frontmatter、读取 `skill.yaml` fallback、推导分类、展示 group/all-skills。
- 当前 UI 形态：仓库输入框、group sidebar、全局 skills 列表、详情 tab、目标语言翻译控件。
- 当前本地缓存约定：导入仓库放入被 git 忽略的本地数据目录。

需要新增内容：

- TypeScript 领域核心：skills 解析、ID、搜索、repository group、翻译请求模型。
- 共享 React/Vite UI 包。
- 平台适配接口，以及 Web/Desktop 两套实现。
- 桌面端命令：文件系统、Git、本地缓存。
- Web 后端/API：服务端 clone/cache、GitHub API 只读读取、详情读取、翻译代理。
- 翻译 provider 抽象和 OpenAI provider。
- Agent 工具安装抽象，以及 Codex / Claude Code 安装实现。
- 覆盖 core 解析、adapter 行为、translation provider、agent installer 的测试体系。

## 目标架构

```text
apps/
  docs/
    plans/
  skills-manager-web/
    src/
    vite.config.ts
  skills-manager-desktop/
    src/
    src-tauri/              # 如果第一阶段选择 Tauri
    vite.config.ts
  skills-manager-api/       # Web/server adapter，可先本地运行，后续可部署
    src/
  packages/
    skills-core/
      src/
        parseSkill.ts
        scanSkills.ts
        searchSkills.ts
        ids.ts
        types.ts
    skills-installers/
      src/
        AgentToolInstaller.ts
        codexInstaller.ts
        claudeCodeInstaller.ts
        installStatus.ts
    skills-translation/
      src/
        TranslationProvider.ts
        openaiProvider.ts
        providerRegistry.ts
    skills-ui/
      src/
        App.tsx
        components/
        styles/
    skills-platform/
      src/
        SkillsAdapter.ts
        webAdapter.ts
        desktopAdapter.ts
        mockAdapter.ts
```

平台适配接口：

```ts
export interface SkillsAdapter {
  listLibrary(): Promise<SkillsLibrary>;
  importRepository(input: { url: string }): Promise<SkillsLibrary>;
  refreshRepositories(): Promise<SkillsLibrary>;
  getSkillDetail(input: { skillId: string }): Promise<SkillDetail>;
  listInstallTargets(): Promise<InstallTarget[]>;
  getInstallStatus(input: { skillIds: string[] }): Promise<InstallStatus[]>;
  installSkills(input: InstallSkillsRequest): Promise<InstallResult>;
  uninstallSkills(input: UninstallSkillsRequest): Promise<InstallResult>;
  translateSkill(input: {
    skillId: string;
    targetLanguage: string;
    providerId?: string;
  }): Promise<SkillTranslation>;
}
```

翻译 provider 接口：

```ts
export interface TranslationProvider {
  id: string;
  label: string;
  translate(input: {
    markdown: string;
    targetLanguage: string;
    sourceLanguage?: string;
  }): Promise<SkillTranslation>;
}
```

Agent 工具安装接口：

```ts
export interface AgentToolInstaller {
  id: "codex" | "claude-code" | string;
  label: string;
  detectTargets(): Promise<InstallTarget[]>;
  install(input: InstallSkillsRequest): Promise<InstallResult>;
  uninstall?(input: UninstallSkillsRequest): Promise<InstallResult>;
}
```

## 已定决策

- 桌面壳选用 **Tauri**。
- Web 端同时支持 **服务端 clone/cache** 和 **GitHub API 只读读取** 两种仓库来源。
- 翻译能力抽象为 **provider**，第一阶段实现 OpenAI provider。
- 桌面端导入仓库时先保存到本地缓存和本地 library 元数据。
- Monorepo 使用 **pnpm**。
- 支持安装 skills 到不同 agent 工具，第一阶段支持 Codex 和 Claude Code。

第一阶段桌面壳：**Tauri**。

理由：

- 这个产品主要需要本地文件系统、Git、本地缓存和 HTTP 调用。
- Tauri 的内存占用和包体通常比 Electron 更小。
- 共享 UI 和 adapter contract 可以保留未来切换或补充 Electron 的空间。

Web 边界：

- 浏览器端不能直接执行 `git clone`，不能读取任意本地文件，也不能持有敏感 API Key。
- Web 端应通过 `apps/skills-manager-api` 读取 GitHub 仓库信息、导入元数据和执行翻译。
- Web API 必须同时提供两条仓库路径：服务端 clone/cache 路径，以及 GitHub API 只读读取路径。
- 开发阶段可以让同一 API 在 `127.0.0.1` 本地运行。

Desktop 边界：

- 桌面端通过 Tauri commands 处理 Git 操作、缓存读写和本地文件扫描。
- 桌面端导入仓库时，先写入本地缓存目录和本地 library 元数据，再刷新 UI 列表。
- 桌面端负责安装到本机 agent 工具目录，例如 `~/.codex/skills`、`~/.claude/skills`，并在安装前检测目标目录和冲突状态。
- 翻译通过 provider registry 选择实现；OpenAI provider 可以从可信的桌面后端层直接调用，也可以委托给配置好的 API 服务。

## 里程碑

## 实施记录

### 2026-05-26

- 完成 pnpm workspace、TypeScript 基础配置和 `apps/packages/*` 包骨架。
- 完成 `skills-core` 的解析、ID、搜索、library 构建和 regression 测试，当前本仓库本地 skills 数量为 24。
- 完成共享 React UI、平台 adapter、OpenAI translation provider 抽象、Codex / Claude Code 安装抽象。
- 完成 Web API 第一版：本地扫描、历史缓存兼容、服务端 clone/cache 导入、GitHub API 只读读取、详情读取、翻译 provider 列表和 Web 安装边界。
- 完成 Vite Web App，默认连接 `http://127.0.0.1:8787` API。
- 完成 Tauri 桌面壳、Vite 前端构建配置、Tauri command adapter 占位和默认图标。
- 新增 `apps/docs/skills-manager.md` 运行说明，以及 `scripts/skills-manager-api`、`scripts/skills-manager-web`、`scripts/skills-manager-desktop`。
- 已验证：`pnpm test`、`pnpm typecheck`、`pnpm build`、`cargo check`。
- 继续完善桌面端：Tauri command 从 mock 替换为真实本地扫描、GitHub clone/cache、旧 library 元数据兼容、详情读取、OpenAI 翻译命令、Codex / Claude Code 安装目标和 copy/symlink 安装。
- 补充 contract 测试：Web/Desktop adapter 映射、GitHub API 只读导入、OpenAI provider、Codex / Claude Code installer、桌面端临时 HOME 安装命令和未配置翻译 key 错误路径。
- 补充 API HTTP route smoke：覆盖 `/health`、`/api/library`、`/api/skills/detail`、`/api/install` Web 安装边界和 CORS preflight。
- 补齐安装回滚能力：共享 adapter 增加 `uninstallSkills`，UI 增加卸载入口，Tauri command 支持从 Codex / Claude Code 目标目录删除已安装 skill，Web API 保持本机卸载边界并提示使用桌面端。
- 调整统一检查脚本：`pnpm typecheck` 会先刷新 workspace 构建产物，避免 project references 读取过期 `dist/*.d.ts`。
- 增加 Web bundle 安全检查：构建后扫描浏览器产物，防止 `OPENAI_API_KEY` 或直接 OpenAI Responses API 调用进入 Web bundle。
- 补齐桌面端 provider 配置：共享 adapter 增加 `saveTranslationProviderConfig`，UI 在 provider 声明支持配置时展示保存控件；Tauri command 支持将 OpenAI key/model 保存到 `.skills-manager-data/config.json`，环境变量仍保持优先级；Web API 明确拒绝浏览器侧 provider secret 保存。
- 补齐与 `skills-linker` 的安装命名兼容：桌面安装目录改为使用 skill 声明名；安装 `manual/**` skills 时可选同步生成 Codex prompts / Claude Code commands，卸载时只清理带 `skills-linker:slash:<skill-name>` marker 的托管 wrapper。
- 扩展 agent 目标覆盖：共享 installer 和 Tauri 桌面端增加 Amp global target，路径为 `~/.agents/skills`，与 `skills-linker` 支持矩阵一致。
- 补齐 ChatGPT alias：共享 installer、mock adapter 和 Tauri 桌面端增加 `chatgpt-global` target，路径复用 `~/.codex/skills` / `~/.codex/prompts`，与 `skills-linker` 中 ChatGPT alias to Codex 的约定一致。
- 补齐导入仓库生命周期：共享 adapter 增加 `removeRepository`，Web API 和 Tauri 桌面端支持删除导入仓库 metadata 并清理本地 cache；UI 在选中导入 group 时提供删除入口，本地 workspace group 不允许删除。
- 补齐 project scope 安装目标：共享 installer、mock adapter 和 Tauri 桌面端增加当前项目级 Codex / ChatGPT / Claude Code / Amp targets，对齐 `skills-linker --scope project` 的路径约定。
- 补齐 `skills-linker` manifest 兼容：共享 installer 和 Tauri 桌面安装会写 `.skills-linker-manifest.json`，卸载/缺失路径会清理对应条目，使 CLI/TUI 后续可以识别托管安装；旧 `.skills-linker-manifest.tsv` 仅作为迁移输入读取。
- 加强卸载安全边界：共享 installer 和 Tauri 桌面卸载默认只删除 manifest 托管的目标；未托管但路径存在时返回 skipped，避免误删手动安装内容。
- 加固 Web GitHub API 导入/刷新：`github-api` 路径先读取仓库 metadata 的默认分支，再按默认分支读取 tree，并将默认分支写入本地 `library.json`；刷新时会重新同步默认分支，避免依赖固定分支名或 `HEAD` 约定。
- 收紧安装 UI 默认选择：安装面板不再默认勾选所有 agent 目标；仅在 skill 已安装时预选已安装目标，避免误装到多个全局/项目目录。
- 强化 `scripts/skills-manager-smoke`：除 library 和 Web HTML 外，增加 skill detail、translation provider、Web 安装边界、未配置 OpenAI key 的 `503` 翻译错误路径检查。
- 收紧 Web 翻译错误语义：服务端 OpenAI provider 未配置时 `/api/translate` 返回 `503`，避免把可操作配置问题误报为通用内部错误。
- 增加桌面发布构建 smoke：新增 `scripts/skills-manager-desktop-smoke` 和 `skills-manager-desktop` 的 `tauri:smoke` 脚本，执行 `tauri build --no-bundle --ci`，覆盖 Tauri release 编译路径并避开签名/安装包差异。
- 增加外部依赖 live smoke：新增 `scripts/skills-manager-live-smoke` 和根 `smoke:live` 脚本，显式传入 `SKILLS_MANAGER_LIVE_REPO_URL` 后使用临时 API/data 目录覆盖真实 GitHub API 导入、刷新、详情、删除，并在 `OPENAI_API_KEY` 存在时执行真实 OpenAI 翻译。
- 明确 Python MVP 退役路径：monorepo Web/Desktop 作为主线；外部 live smoke 作为显式 opt-in 验证脚本保留。
- 尝试执行 `SKILLS_MANAGER_LIVE_REPO_URL=https://github.com/naijoug/skills SKILLS_MANAGER_LIVE_TRANSLATE=0 ./scripts/skills-manager-live-smoke`；本地 API 启动路径可用，但 GitHub API 返回未认证 rate limit。已在 live smoke 中补充 `GITHUB_TOKEN` 提示，后续带 token 重跑即可完成外部验证。
- 补强 Web `server-cache` 验证：API 单元测试使用临时 fake git 覆盖服务端 clone/cache 导入、refresh pull 更新、删除 cache 和 metadata，不依赖真实网络。
- 补强桌面 Git cache 验证：Tauri Rust 测试使用临时 fake git 覆盖桌面 `import_repository` clone、`refresh_repositories` pull 更新、删除 cache 和 metadata，不依赖真实网络。
- 增加自包含 Web smoke：新增 `scripts/skills-manager-web-smoke` 和根 `smoke:web` 脚本，自动启动临时 API/Web，调用现有 `scripts/skills-manager-smoke` 后清理进程和临时数据，减少手动启动前置条件。

### 2026-05-27

- 收紧共享 UI 选择状态：切换 group 会同步详情到当前 group 的第一个匹配 skill；导入仓库后进入新导入 group 并选中首个 skill；刷新仓库后只保留仍在当前视图内的 selection，避免详情面板展示当前列表之外的 skill。
- 加强 UI 操作防重复提交：翻译保存/翻译请求、安装/卸载请求进行中禁用相关控件，并在安装结果中显示 agent 目标 label、状态和后端说明信息。
- 补充 `skills-ui` 回归测试：将 group/query/import/refresh 后的 selection 规则抽成纯函数并用 Vitest 覆盖，防止后续改动破坏详情与当前列表的一致性。
- 补强 symlink 安装能力：共享 installer 增加 symlink 安装/卸载测试；Tauri 桌面端增加 symlink 安装/卸载测试，并补齐 Windows directory symlink 实现。
- 加固 GitHub API live 验收路径：Web API 的 `github-api` 请求除 `GITHUB_TOKEN` 外也支持 `GH_TOKEN`，并在 API 测试中断言 GitHub 请求携带 Authorization header；live smoke rate limit 提示同步更新。
- 修复 GitHub API 导入边界：`github-api` 现在同时识别仓库根目录 `SKILL.md` 和子目录 `*/SKILL.md`，并正确匹配 root-level `skill.yaml`；API 回归测试覆盖两种结构。
- 增加真实 OpenAI 翻译 smoke：新增 `scripts/skills-manager-openai-smoke` 和根 `smoke:openai` 脚本，启动临时 API 后从本地 skills 选择最短内容并调用 `/api/translate`，让 OpenAI live 验收不再依赖 GitHub live smoke。
- 尝试执行 `./scripts/skills-manager-openai-smoke`；脚本成功启动临时 API 并调用到 OpenAI，但当前 `OPENAI_API_KEY` 返回 `insufficient_quota`。已在脚本中补充 quota/key 错误提示，后续更换有效额度的 key 后可直接重跑完成 live 翻译验收。
- 补强桌面仓库导入结构覆盖：Tauri fake git 测试现在同时覆盖仓库根目录 `SKILL.md` 和子目录 `SKILL.md`，确保桌面端与 Web `github-api` 路径对常见 skills 仓库结构保持一致。
- 修正安装状态语义：共享 installer 和 Tauri 桌面端现在只有 manifest 托管的目标才返回 `installed: true`；未托管同名目录返回 `conflict: true`，UI 显示 Conflict，避免把用户手动内容误判为已安装并默认勾选。
- 加固 GitHub API 大仓库边界：当 GitHub recursive tree 返回 `truncated: true` 时，`github-api` 导入会明确失败并提示改用 `server-cache`，避免保存不完整 repository metadata 或静默漏导入部分 skills；API 回归测试覆盖该失败路径。
- 收紧 Web API 坏请求语义：无效 JSON、非对象 body、缺失 GitHub URL 和不支持的 repository source 现在返回明确 400；HTTP/API 回归测试覆盖这些边界，避免前端外调用把服务端打成 500。
- 收紧翻译请求校验：Web API 和 Tauri 桌面端现在会在调用 provider 前校验 skill id、目标语言和 provider id；空目标语言和未知 provider 返回明确错误，避免无效请求进入 OpenAI 调用路径。
- 收紧安装请求校验：共享 installer 和 Tauri 桌面端现在只接受 `copy|symlink` 安装模式和 `fail|skip|overwrite` 冲突策略；未知 mode/policy 返回明确错误，避免后端把拼写错误静默当作 copy 或默认策略执行。
- 收紧桌面端安装目标校验：Tauri 安装/卸载命令现在会拒绝未知 `targetId`，避免外部调用或前端状态不同步时把目标拼写错误静默执行为空操作；Rust 回归测试覆盖安装和卸载两条路径。
- 修正安装面板目标选择规则：切换 skill 时会按新 skill 的 installed 状态重置目标勾选，不再继承上一个 skill 的手动选择；同一 skill 刷新状态仍保留有效手动选择，方便连续安装/卸载操作。
- 加固安装面板异步状态：安装目标/状态加载增加请求序号防护，快速切换 skill 时旧响应不会覆盖当前 skill 的状态；切换 skill 时会清理上一条安装结果消息，减少误读和误操作。
- 加固翻译面板异步状态：翻译请求和 provider 列表加载增加请求序号防护，快速切换 skill 时旧翻译结果不会写入当前详情；翻译请求进行中会禁用 provider、目标语言和配置输入，避免请求参数和结果不一致。
- 收紧安装面板可用性展示：安装面板区分 loading / unavailable / available 三种状态；Web 端无本地安装目标时隐藏 copy/symlink、冲突策略和安装/卸载按钮，只保留桌面端提示；桌面端目标加载中不再短暂显示不可用提示。
- 调整 monorepo 根目录：将 `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml` 和 `tsconfig.base.json` 移入 `apps/`，pnpm workspace packages 改为相对 `apps/` 枚举；根目录脚本保留为入口，但内部切换到 `apps/` 执行 pnpm，避免仓库根目录承载前端 workspace 配置。
- 退役旧 Python MVP：删除 `apps/skills-manager/` 和 `scripts/skills-manager`，文档中的旧版保留说明改为 monorepo Web/Desktop 为唯一主实现。

### M1 — Workspace 基础搭建

**结果**：仓库具备 JS/TS monorepo 骨架，可以运行 Web/Desktop 入口，并且前端 workspace 配置集中在 `apps/`。

| # | 任务 | 文件 / 符号 | 依赖 | 验证 |
|---|------|-------------|------|------|
| 1.1 | 添加 pnpm workspace manifest | `apps/package.json`, `apps/pnpm-workspace.yaml`, `apps/tsconfig.base.json` | — | `cd apps && pnpm -r list --depth -1` 可以列出 apps/packages |
| 1.2 | 添加共享 lint/test/build 脚本，先不承载生产行为 | `apps/package.json` scripts | 1.1 | `cd apps && pnpm -r build` 可以跑到占位构建 |
| 1.3 | 创建 app/package 目录骨架 | `apps/skills-manager-web`, `apps/skills-manager-desktop`, `apps/skills-manager-api`, `apps/packages/skills-core`, `apps/packages/skills-ui`, `apps/packages/skills-platform`, `apps/packages/skills-translation`, `apps/packages/skills-installers` | 1.1 | 目录结构符合目标架构 |
| 1.4 | 旧 Python MVP 退役 | `apps/skills-manager/`, `scripts/skills-manager` | M4, M5, M6 | 目录和启动器已删除，常规检查、Web smoke、Desktop smoke 通过 |

### M2 — 共享领域核心

**结果**：`apps/packages/skills-core` 可以解析本地 skill fixtures，并保持既有 library 元数据语义。

| # | 任务 | 文件 / 符号 | 依赖 | 验证 |
|---|------|-------------|------|------|
| 2.1 | 定义 group、skill summary、detail、translation、error 等领域类型 | `apps/packages/skills-core/src/types.ts` | M1 | Typecheck 通过 |
| 2.2 | 固化 frontmatter 和简单 YAML 解析逻辑 | `apps/packages/skills-core/src/parseSkill.ts` | 2.1 | 单元测试覆盖 `name`、`description`、`title`、`skill.yaml` fallback |
| 2.3 | 实现稳定的 skill ID 编码/解码 | `apps/packages/skills-core/src/ids.ts` | 2.1 | group/path round-trip 测试通过 |
| 2.4 | 实现与运行时 I/O 解耦的 scan/category/search 工具 | `apps/packages/skills-core/src/scanSkills.ts`, `apps/packages/skills-core/src/searchSkills.ts` | 2.1, 2.2 | fixture 测试返回当前仓库 24 个本地 skills |
| 2.5 | 基于当前仓库 skills 增加 regression fixtures | `apps/packages/skills-core/test/fixtures` 或直接 repo fixture loader | 2.2-2.4 | 测试结果匹配当前本地 skills 数量和代表性标题 |
| 2.6 | 定义安装目标和翻译 provider 的共享类型 | `apps/packages/skills-core/src/installTypes.ts`, `apps/packages/skills-core/src/translationTypes.ts` | 2.1 | Typecheck 和类型导出测试通过 |

### M3 — 共享 UI 包

**结果**：React UI 可以通过 mock adapter 渲染同样的产品体验。

| # | 任务 | 文件 / 符号 | 依赖 | 验证 |
|---|------|-------------|------|------|
| 3.1 | 将当前静态 UI 转为 React 组件 | `apps/packages/skills-ui/src/App.tsx`, `components/GroupSidebar.tsx`, `components/SkillList.tsx`, `components/SkillDetail.tsx` | M2 | mock library 可以渲染 group/list/detail 状态 |
| 3.2 | 基于既有三栏样式做响应式布局 | `apps/packages/skills-ui/src/styles.css` | 3.1 | 桌面和窄屏截图无重叠、无裁切 |
| 3.3 | UI 只依赖 `SkillsAdapter` 接口，不直接依赖平台 API | `apps/packages/skills-platform/src/SkillsAdapter.ts`, `apps/packages/skills-ui/src/App.tsx` | 3.1 | UI 可通过 `mockAdapter` 正常运行 |
| 3.4 | 保留既有交互：导入、刷新、group filter、全局搜索、详情 tab、翻译 | `apps/packages/skills-ui/src/**` | 3.1-3.3 | mock smoke flow 覆盖所有关键控件 |
| 3.5 | 增加 provider 选择和安装目标选择 UI | `apps/packages/skills-ui/src/components/TranslatePanel.tsx`, `apps/packages/skills-ui/src/components/InstallPanel.tsx` | 3.3 | mock smoke flow 覆盖选择 provider、查看安装状态、安装到 Codex/Claude Code |

### M4 — Web 形态

**结果**：Web App 通过 API-backed adapter 运行，不依赖桌面权限。

| # | 任务 | 文件 / 符号 | 依赖 | 验证 |
|---|------|-------------|------|------|
| 4.1 | 创建 Vite Web App 并挂载共享 UI | `apps/skills-manager-web/src/main.tsx` | M3 | `cd apps && pnpm --filter skills-manager-web dev` 打开 UI |
| 4.2 | 实现调用 API routes 的 Web adapter | `apps/packages/skills-platform/src/webAdapter.ts` | M3 | 使用 mocked fetch 的 adapter contract tests 通过 |
| 4.3 | 实现 library、repository import/browse/remove、detail、translation API routes | `apps/skills-manager-api/src/**` | M2 | API 测试覆盖成功路径、删除路径和非法 URL 错误 |
| 4.4 | 实现服务端 `git clone` cache 仓库路径 | `apps/skills-manager-api/src/repositories/serverCache.ts` | 4.3 | API 测试覆盖导入、刷新、读取详情 |
| 4.5 | 实现 GitHub API 只读仓库路径 | `apps/skills-manager-api/src/repositories/githubApi.ts` | 4.3 | API 测试覆盖无 clone 的列表和详情读取 |
| 4.6 | 实现 API 侧 translation provider registry 和 OpenAI provider | `apps/packages/skills-translation/src/**`, `apps/skills-manager-api/src/translate/**` | 4.3 | 浏览器 bundle 中不存在 OpenAI Key；provider contract tests 通过 |
| 4.7 | Web 端安装能力仅展示服务端可支持的目标；本地 agent 安装引导用户使用桌面端 | `apps/packages/skills-platform/src/webAdapter.ts`, `apps/packages/skills-ui/src/components/InstallPanel.tsx` | 3.5, 4.2 | Web smoke test 不误导用户以为浏览器可写本机 agent 目录 |

### M5 — 桌面形态

**结果**：Desktop App 通过 desktop adapter 提供本地导入和缓存能力。

| # | 任务 | 文件 / 符号 | 依赖 | 验证 |
|---|------|-------------|------|------|
| 5.1 | 添加包裹共享 UI 的 Tauri shell | `apps/skills-manager-desktop/src-tauri/**`, `apps/skills-manager-desktop/src/main.tsx` | M3 | 桌面窗口启动并渲染 mock UI |
| 5.2 | 实现 Tauri commands：列出本地 library、clone repos、refresh/remove repos、读取 detail；导入时先写入本地缓存和 library 元数据 | `apps/skills-manager-desktop/src-tauri/src/lib.rs` | M2, 5.1 | command 测试或集成检查覆盖本地 repo scan、删除导入 repo 和重启后缓存恢复 |
| 5.3 | 实现调用 Tauri commands 的 Desktop adapter | `apps/packages/skills-platform/src/desktopAdapter.ts` | 5.2 | 桌面测试环境中的 adapter contract tests 通过 |
| 5.4 | 配置本地数据目录，并尽量兼容 `.skills-manager-data/` 迁移 | `apps/skills-manager-desktop/src-tauri/src/storage.rs` | 5.2 | 已导入仓库元数据可读取，或能干净重新导入 |
| 5.5 | 实现桌面 translation provider registry 和 OpenAI provider，从环境变量或应用设置读取 key | `apps/packages/skills-translation/src/**`, `apps/skills-manager-desktop/src-tauri/src/lib.rs` | 5.2 | 缺失 key 时 UI 显示可操作错误；环境变量或本地配置存在时 provider 显示为 configured |
| 5.6 | 实现 Codex 和 Claude Code 安装器 | `apps/packages/skills-installers/src/codexInstaller.ts`, `apps/packages/skills-installers/src/claudeCodeInstaller.ts`, `apps/skills-manager-desktop/src-tauri/src/lib.rs` | 5.2 | 安装到临时 HOME 下的 `.codex/skills` 和 `.claude/skills` 测试通过 |
| 5.7 | 增加安装状态、冲突检测和卸载/覆盖策略的桌面命令 | `apps/packages/skills-installers/src/installStatus.ts`, `apps/skills-manager-desktop/src-tauri/src/lib.rs` | 5.6 | 已安装、未安装、冲突路径、卸载和缺失路径测试通过 |

### M6 — 功能对齐与迁移

**结果**：Monorepo Web/Desktop App 已成为主实现。

| # | 任务 | 文件 / 符号 | 依赖 | 验证 |
|---|------|-------------|------|------|
| 6.1 | 验证 monorepo apps 的本地扫描、GitHub 导入、group 计数、详情页、翻译错误处理 | `apps/skills-manager-api`, `apps/skills-manager-web`, `apps/skills-manager-desktop` | M4, M5 | checklist 显示当前 24 个本地 skills，导入 repo 行为由测试和 smoke 覆盖 |
| 6.2 | 添加 Web/Desktop 开发启动脚本 | `scripts/skills-manager-web`, `scripts/skills-manager-desktop` | M4, M5 | 两个脚本分别启动对应 app 形态 |
| 6.3 | 更新架构、运行命令和平台能力边界文档 | `apps/docs/skills-manager.md`, `README.md` as needed | 6.1 | 文档清楚说明 Web 与 Desktop 能力差异 |
| 6.4 | 增加安装能力文档，说明 Codex / Claude Code 目录、冲突策略和与 `skills-linker` 的关系 | `apps/docs/skills-manager.md`, `README.md` as needed | 5.6, 6.1 | 文档可指导用户完成安装和回滚 |
| 6.5 | 删除 Python MVP 旧版 | `apps/skills-manager/`, `scripts/skills-manager`, `apps/docs/skills-manager.md` | 6.1 | 旧目录和启动器已删除；文档改为 monorepo Web/Desktop 主实现 |

## 风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| Web 和 Desktop 能力天然不同，Web 无法直接访问文件系统或本地 Git | 高 | 高 | 明确 `SkillsAdapter` 边界，并写 adapter contract tests |
| Tauri 需要 Rust/toolchain，对只有 Node 环境的机器有门槛 | 中 | 中 | 文档说明安装步骤；保留 Electron 作为兼容备选方向 |
| 同时支持服务端 clone/cache 和 GitHub API 会增加 Web 端路径复杂度 | 中 | 中 | 用统一 repository source 接口封装两条路径，并做 contract tests |
| 导入任意 GitHub repo 可能很慢或体积很大 | 中 | 中 | 桌面端和服务端 cache 使用 shallow clone；Web 可切换 GitHub API 只读路径；UI 显示进度和错误 |
| 翻译会把私有 skill 内容发送给外部 API | 中 | 高 | 翻译必须显式触发，展示 provider，key 保持在 server/desktop 侧，并记录隐私说明 |
| 多 provider 翻译抽象可能过早复杂化 | 中 | 中 | 第一阶段只实现 OpenAI provider，但 provider interface 和 registry 从一开始固定 |
| 安装到不同 agent 工具可能覆盖用户已有 skills | 中 | 高 | 默认检测冲突并阻止覆盖；只有用户明确选择覆盖/卸载时才写入 |
| Web bundle 意外包含敏感 key | 低 | 高 | Web 仅服务端翻译；增加 build-time scan/check |
| Markdown 渲染或代码块保真度不足 | 中 | 中 | 使用代表性 `SKILL.md` fixtures 和视觉 smoke tests |
| JS monorepo 会增加这个内容型仓库的维护成本 | 中 | 中 | 初期保持 packages 最小化，推迟复杂 tooling |
| Electron/Tauri 抽象过早泛化 | 中 | 中 | 第一阶段只实现 Tauri，Electron 仅作为 adapter contract 兼容方向 |

## 已关闭问题

- [x] 第一阶段桌面壳采用 Tauri。
- [x] Web 端同时支持服务端 clone/cache 和 GitHub API 只读读取。
- [x] 翻译从第一天抽象为 provider，第一阶段实现 OpenAI provider。
- [x] 桌面端导入仓库先保存到本地缓存和本地 library 元数据。
- [x] Monorepo 使用 pnpm。
- [x] 支持安装/启用 skills 到不同 agent 工具，第一阶段支持 Codex 和 Claude Code。
- [x] Python MVP 退役路径：旧版已删除，monorepo Web/Desktop 作为唯一主实现；外部 live smoke 仍作为显式 opt-in 验证脚本保留。

## 剩余开放问题

- [ ] Web 端是否需要账号级持久化，还是先完全依赖服务端部署环境的 cache？
- [x] Codex / Claude Code 安装模式默认使用 symlink 还是 copy？桌面 UI 默认使用 copy，避免导入仓库 cache 删除后留下断开的 symlink；需要实时联动源码时仍可手动选择 symlink。
- [x] 安装时是否需要同步生成 slash command wrappers，还是第一阶段只安装 skills 内容？已实现为可选项，仅对 `manual/**` skills 生成托管 wrapper。
- [ ] 除 OpenAI 外，第二个 translation provider 优先支持哪个服务？

## 验证策略

- **Core 单元测试**：解析 frontmatter、fallback 到 `skill.yaml`、推导 category、ID 编码/解码、搜索过滤。
- **Fixture regression**：扫描当前仓库，断言本地 skills 数量为 24，并覆盖 `API Design Review`、`Ref Pack Builder`、`In English` 等代表性标题。
- **Adapter contract tests**：尽可能对 mock、Web、Desktop adapters 运行相同的 `listLibrary`、`importRepository`、`getSkillDetail`、`translateSkill`、`installSkills` 行为检查。
- **Translation provider tests**：验证 provider registry、OpenAI provider 缺失 key 错误、providerId 选择、Markdown 结构保留、桌面端本地 provider 配置读取。
- **Installer tests**：在临时 HOME 中验证 Codex、ChatGPT、Claude Code、Amp 安装路径、冲突检测、覆盖阻止、状态读取和 slash command wrapper 安装/卸载。
- **Web smoke test**：`./scripts/skills-manager-web-smoke` 可自启动临时 API/Web 并调用常规 smoke；服务端 clone/cache 路径在 API 测试中通过 fake git 覆盖；外部依赖路径使用 `SKILLS_MANAGER_LIVE_REPO_URL=... ./scripts/skills-manager-live-smoke` 显式验证，避免默认检查依赖网络和真实 provider。
- **Desktop smoke test**：运行 `./scripts/skills-manager-desktop-smoke` 覆盖 Tauri release 编译路径；启动 Tauri App，导入一个 GitHub skills repo，刷新 imports，打开 detail，重启后确认本地缓存仍存在，并安装一个 skill 到临时 Codex/Claude Code 目录。
- **视觉 QA**：截取桌面和窄屏截图，覆盖 group list、all-skills list、detail pane、translation pane 和错误状态，确认无文本裁切或重叠。
- **安全检查**：检查 Web bundle 中不存在 `OPENAI_API_KEY` 或直接 OpenAI secret 使用。
- **回滚策略**：旧 Python MVP 已删除；若 Web/Desktop 出现回归，优先通过 monorepo 测试和 smoke 修复。需要恢复旧版时从版本历史恢复 `apps/skills-manager/` 与 `scripts/skills-manager`。
