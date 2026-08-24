# Skills Manager 运行说明

## 当前形态

- `apps/skills-manager-api/`：Web 端本地 API，负责扫描本仓库 skills、服务端 clone/cache、GitHub API 只读读取、删除导入仓库和翻译代理。
- `apps/skills-manager-web/`：Vite + React Web App，复用共享 UI。
- `apps/skills-manager-desktop/`：Tauri 桌面壳，复用共享 UI；Rust command 已接入本地扫描、Git clone/cache、删除导入仓库、详情读取、翻译 provider 配置/调用和 agent 安装/卸载。
- `apps/skills-manager-tui/`：本地 skill 管理 CLI、fzf TUI、`ng` manual skill helper 和 trigger evaluation 工具。
- `apps/scripts/`：Skills Manager check 和 smoke verification 脚本。
- `apps/packages/*`：领域核心、平台适配、UI、翻译 provider、agent 安装抽象。
- `apps/package.json`、`apps/pnpm-workspace.yaml`、`apps/pnpm-lock.yaml`、`apps/tsconfig.base.json`：Web/Desktop monorepo 的 pnpm 和 TypeScript workspace 根；仓库根 `scripts/` 只保留本地启动/调试入口，不放 smoke/test 工具或前端 workspace 配置。
- 旧 Python MVP 已退役并删除；常规开发、验证和发布路径以 monorepo Web/Desktop 为准。

## 开发启动

安装依赖：

```bash
cd apps
pnpm install
```

以下命令除特别说明外，都从仓库根目录运行。

启动 Web API：

```bash
./scripts/skills-manager-api
```

启动 Web 前端：

```bash
./scripts/skills-manager-web
```

同时启动 Web API 和 Web 前端：

```bash
./scripts/skills-manager-dev
```

常规本地启动推荐使用统一入口：

```bash
./scripts/start-local.sh          # 桌面端，默认
./scripts/start-local.sh web      # 浏览器预览
./scripts/start-local.sh status
./scripts/start-local.sh stop
```

在 Web API 和 Web 前端已启动后，运行 smoke 检查：

```bash
./apps/scripts/skills-manager-smoke
```

Smoke 会检查 API library、skill detail、translation provider 列表、Web 安装边界、未配置 OpenAI key 时的 `503` 翻译错误路径，以及 Web 首页 HTML。

如果要由脚本自动启动临时 API/Web、运行 smoke 并清理进程：

```bash
./apps/scripts/skills-manager-web-smoke
```

自包含 Web smoke 默认使用临时数据目录、API 端口 `8788` 和 Web 端口 `5176`。可用 `SKILLS_MANAGER_WEB_SMOKE_API_PORT`、`SKILLS_MANAGER_WEB_SMOKE_WEB_PORT` 调整端口；设置 `SKILLS_MANAGER_KEEP_WEB_SMOKE_DATA=1` 可保留临时数据和日志目录。

运行真实 GitHub / 可选真实 OpenAI live smoke：

```bash
SKILLS_MANAGER_LIVE_REPO_URL=https://github.com/owner/repo ./apps/scripts/skills-manager-live-smoke
```

Live smoke 会启动临时 API、使用真实 GitHub API 导入和刷新一个包含 `SKILL.md` 的仓库、打开导入 skill detail、删除导入仓库。如果 API 环境里存在 `OPENAI_API_KEY`，还会执行一次真实 OpenAI 翻译；设置 `SKILLS_MANAGER_LIVE_TRANSLATE=0` 可跳过真实翻译。私有仓库或更高 rate limit 可通过 `GITHUB_TOKEN` 或 `GH_TOKEN` 提供 GitHub API token。默认使用临时 `.skills-manager-data`，设置 `SKILLS_MANAGER_KEEP_LIVE_DATA=1` 可保留现场。

如果 GitHub API 返回 rate limit，设置 `GITHUB_TOKEN` 或 `GH_TOKEN` 后重试。

运行真实 OpenAI 翻译 smoke，不依赖外部 GitHub 仓库：

```bash
OPENAI_API_KEY=sk-... ./apps/scripts/skills-manager-openai-smoke
```

OpenAI smoke 会启动临时 API、确认 OpenAI provider 已配置、从本地 skills 中选择内容最短的 skill 并调用 `/api/translate`。可通过 `SKILLS_MANAGER_OPENAI_SMOKE_TARGET_LANGUAGE` 指定目标语言，通过 `SKILLS_MANAGER_OPENAI_SMOKE_SKILL_RELATIVE_PATH` 指定要翻译的本地 skill。

如果 OpenAI 返回 `insufficient_quota` 或 `invalid_api_key`，说明本地 API 和外部请求链路已到达 OpenAI，但当前 key 的额度、账单或有效性需要处理后才能完成 live 翻译验收。

如果端口不是默认值：

```bash
SKILLS_MANAGER_API_URL=http://127.0.0.1:8787 SKILLS_MANAGER_WEB_URL=http://127.0.0.1:5173 ./apps/scripts/skills-manager-smoke
```

默认 API 地址是 `http://127.0.0.1:8787`。如果要连接其他 API：

```bash
VITE_SKILLS_MANAGER_API_URL=http://127.0.0.1:8787 ./scripts/skills-manager-web
```

启动桌面端：

```bash
./scripts/start-local.sh desktop
```

运行桌面发布构建 smoke（编译 Tauri release app，但跳过签名和安装包生成）：

```bash
./apps/scripts/skills-manager-desktop-smoke
```

## 验证

```bash
cd apps
pnpm typecheck
pnpm test
cd skills-manager-desktop/src-tauri
cargo check
cargo test
cd ../../..
./apps/scripts/skills-manager-desktop-smoke
```

或直接运行完整检查：

```bash
./apps/scripts/skills-manager-check
```

当前测试覆盖：

- `skills-core`：frontmatter / `skill.yaml` 解析、稳定 ID、搜索、本仓库 24 个本地 skills。
- `skills-manager-api`：本地 library、GitHub URL 归一化、服务端 clone/cache 导入/刷新/删除路径、GitHub API 只读导入路径、导入仓库删除、HTTP route smoke、CORS preflight、坏 JSON / 非对象 body / 缺失 URL 的 400 错误语义、翻译请求目标语言和 provider 校验、Web 安装/卸载边界、Web provider secret 边界。
- `skills-platform`：Web adapter API route 映射、Desktop adapter Tauri command 映射，包含 provider 配置、安装和卸载动作。
- `skills-ui`：group / query / import / refresh 后的可见列表和详情选择规则，防止详情停留在当前列表之外的 skill；翻译面板带请求序号防护，避免切换 skill 后旧翻译结果覆盖当前详情；安装面板区分 loading / unavailable / available 状态，切换 skill 时会按当前 skill 的安装状态重置目标勾选，防止继承上一个 skill 的手动选择；安装状态加载带请求序号防护，避免快速切换 skill 时旧响应覆盖当前状态。
- `skills-translation`：OpenAI provider 配置检测、Responses API 请求形态、翻译文本提取。
- `skills-installers`：Codex / ChatGPT / Claude Code / Amp 全局和项目目标目录检测、copy/symlink 安装、mode/conflict policy 校验、卸载、`skills-linker` manifest 维护、可选 slash command wrapper、安装状态、冲突检测。
- `skills-manager-desktop/src-tauri`：本地扫描、library 构建、Git clone/cache 导入和 refresh、root-level 与子目录 `SKILL.md` 发现、导入仓库删除、桌面 copy/symlink 安装和卸载命令、安装 mode/conflict policy/target id 校验、Codex / ChatGPT / Claude Code / Amp 全局和项目目标支持、`skills-linker` manifest 维护、可选 Codex/ChatGPT/Claude Code slash command wrapper、OpenAI key 本地配置、翻译请求校验、未配置 OpenAI key 的错误路径。
- `apps/scripts/skills-manager-desktop-smoke`：执行 `tauri build --no-bundle --ci`，验证 Tauri release 编译路径可用，同时避开签名、notarization 和 installer 生成差异。
- `apps/scripts/skills-manager-live-smoke`：显式 opt-in 的外部依赖检查，覆盖真实 GitHub API 导入/刷新/详情/删除，以及可选真实 OpenAI 翻译。
- `apps/scripts/skills-manager-openai-smoke`：显式 opt-in 的真实 OpenAI 翻译检查，覆盖 Web API provider 配置和 `/api/translate` 调用路径，不依赖外部 GitHub 仓库。
- `apps/scripts/skills-manager-web-smoke`：自包含 Web smoke，启动临时 API/Web 后调用 `apps/scripts/skills-manager-smoke`，最后清理进程和临时数据。
- `apps/scripts/skills-manager-check`：构建后扫描 Web bundle，确认浏览器产物不包含 `OPENAI_API_KEY` 或直接 OpenAI Responses API 调用。

注意：`skills-manager-api` 的 HTTP route smoke 会监听 `127.0.0.1` 随机端口；在受限沙箱里运行时需要允许本地端口绑定。

## 当前能力边界

- Web 端可以读取本地 API 返回的 library，并可通过 API 导入 GitHub 仓库。
- Web 导入支持两种来源：`server-cache` 会在 API 侧 clone/cache；`github-api` 会通过 GitHub REST API 读取仓库树和 blob。
- `github-api` 导入和刷新会先读取仓库 metadata 的默认分支，再按默认分支读取 tree；默认分支会写入 `library.json`，避免依赖固定分支名或 `HEAD` 约定。导入会识别仓库根目录的 `SKILL.md` 和任意子目录下的 `SKILL.md`。Web API 会从 `GITHUB_TOKEN` 或 `GH_TOKEN` 读取 GitHub API token，用于私有仓库或提高 rate limit。如果 GitHub API 返回 truncated tree，导入会明确失败并提示改用 `server-cache`，避免静默漏导入部分 skills。
- Web 和桌面端都支持删除已导入仓库；删除本地 workspace group 会被拒绝。服务端/桌面本地 cache 会随 metadata 一起清理。
- 共享 UI 会在切换 group、导入仓库、刷新仓库和搜索过滤时同步当前详情选择：详情面板不会停留在当前列表之外的 skill；导入后会进入新导入仓库并选择该 group 的第一个 skill。
- Web 端不会直接写本机 Codex 或 Claude Code 目录；本地 agent 安装能力放在桌面端。
- Web 端没有本地安装目标时，安装面板只显示桌面端提示，不展示 copy/symlink、冲突策略和安装/卸载按钮；桌面端加载安装目标时显示 loading 状态，避免短暂误报为 Web-only 限制。
- 桌面端导入 GitHub 仓库时会保存到 `.skills-manager-data/repos/`，并更新 `.skills-manager-data/library.json`；导入扫描会识别仓库根目录和任意子目录下的 `SKILL.md`。
- 桌面端支持安装到全局目标 `~/.codex/skills`、`~/.claude/skills`、`~/.agents/skills`，也支持安装到当前项目目标 `{repo}/.codex/skills`、`{repo}/.claude/skills`、`{repo}/.agents/skills`。安装模式支持 copy 和 symlink，冲突策略由 UI 请求决定；同一目标也支持从 UI 触发卸载。ChatGPT 目标作为 Codex alias，使用 `.codex` 路径。桌面后端在 Unix/macOS 使用目录 symlink，在 Windows 使用 directory symlink。
- 桌面端安装/卸载会拒绝未知 `targetId`，避免前端或外部调用把拼写错误静默执行为空操作。
- 桌面端安装面板默认使用 copy 模式；切换 skill 时会根据当前 skill 的状态重置目标勾选并清理上一条安装消息，未安装的 skill 不会默认勾选任何目标，只有 manifest 托管的已安装 skill 会预选已安装目标，避免误装到多个 agent 目录。安装状态请求带竞态防护，快速切换 skill 时旧响应不会覆盖当前状态。目标路径存在但没有 manifest 记录时会显示为 conflict，而不是 installed。
- 桌面端安装会写入目标目录下的 `.skills-linker-manifest.json`，格式与 `apps/skills-manager-tui/skills-linker` 保持一致；卸载或发现目标缺失时会清理对应 manifest 条目，方便后续继续使用 CLI/TUI 管理。旧 `.skills-linker-manifest.tsv` 仅作为迁移输入读取，下一次写入后会移除。
- 桌面端卸载默认只删除 manifest 托管的 skill 目录；如果目标目录存在但没有 manifest 条目，会返回 skipped，避免误删用户手动放入的内容。
- 桌面端安装 `manual/**` skills 时可以选择同步生成 slash command wrapper：Codex / ChatGPT 写入 `.codex/prompts/<skill-name>.md`，Claude Code 写入 `.claude/commands/<skill-name>.md`。wrapper 使用 `skills-linker:slash:<skill-name>` marker，卸载时只清理带 marker 的托管文件。
- 桌面端安装目录名称使用 `SKILL.md` frontmatter 的 `name` 或 `skill.yaml` 的 `id`，与 `apps/skills-manager-tui/skills-linker` 的命名约定保持一致。
- 翻译已抽象为 provider，并接入 OpenAI provider；未配置 provider 时 UI 会显示未配置。桌面端会优先读取 `OPENAI_API_KEY`，没有环境变量时读取 `.skills-manager-data/config.json` 中保存的 provider 配置，再调用 OpenAI Responses API。
- Web 端不接受浏览器侧保存 provider secret；Web 翻译 key 需要通过服务端 `OPENAI_API_KEY` 配置。未配置时 `/api/translate` 会返回 `503`，让 UI 明确呈现 provider 不可用，而不是通用内部错误。
- 翻译和安装面板会在请求进行中禁用相关控件，避免重复提交；翻译请求和安装状态请求都带异步竞态防护，快速切换 skill 时旧响应不会覆盖当前详情；安装结果会显示 agent 目标 label、状态和后端返回的说明信息。
