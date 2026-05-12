---
name: ng-tool-ref
description: "Use when building a feature, product, or agent and you want a local reference pack: gather relevant docs and open-source implementations, clone selected repos into .ref/, and write docs/ref.md with concrete implementation notes"
---

# Ref Pack Builder

Build a durable local reference pack for an implementation topic.

This skill creates or updates:
- `docs/ref.md` as the durable summary and decision input
- `.ref/repos/` as the local workspace for cloned reference repositories

Core principle: collect only references that materially improve implementation choices, then turn them into concrete code-reading notes instead of a vague link dump.

## When to Use

- The user asks for related docs, reference repos, benchmark projects, or "similar open-source implementations"
- The user is starting a new feature/system and wants to study existing implementations before coding
- The user wants downstream agents to read local cloned repos while implementing
- The user wants a persistent `docs/ref.md` that captures docs, repos, and design takeaways

## When Not to Use

- The user only wants a quick answer or a single search result
- The user only wants package/dependency selection without cloning or code-reading
- The user wants a full implementation plan without doing external reference gathering first

## Workflow

### 1. Normalize the topic

Turn the request into:
- target capability
- runtime/language/framework constraints
- non-goals
- 4-8 focused search queries in Chinese and English

Example:
- Topic: `Build an agent framework with tool calling, memory, task routing, and multi-agent coordination`
- Queries:
  - `open source agent framework tool calling memory orchestration`
  - `multi agent framework github`
  - `agent framework architecture tool routing`
  - `开源 agent 框架 工具调用 记忆 多 agent`

### 2. Prepare the local workspace

Resolve the installed skill directory first, then run:

```bash
# SKILL_DIR is the directory containing this SKILL.md after resolving symlinks
python3 "$SKILL_DIR/scripts/prepare_ref_workspace.py" \
  --project-root "$PWD" \
  --topic "<normalized topic>"
```

This script:
- creates `docs/` when missing
- creates `.ref/repos/`
- ensures `.ref/` is present in the target repo's `.gitignore`
- initializes `docs/ref.md` when it does not exist

> Note for AI agents: when this skill is installed via symlink, resolve the real path of `SKILL.md` first and use its parent directory as `SKILL_DIR`.

### 3. Gather sources

Search for:
- official docs, specs, SDK docs, architecture writeups
- open-source repos with directly relevant implementations
- technical blog posts only when they add unique implementation detail

Selection rules:
- prefer primary sources over commentary
- prefer active, readable repos over abandoned or marketing-heavy ones
- keep only sources that can influence implementation or tradeoffs
- when facts may have changed, re-check current sources instead of relying on memory

### 4. Select and clone open-source repos

Clone only the top `2-6` repos that add distinct value.

Default commands:

```bash
git clone --depth=1 <repo-url> ".ref/repos/<slug>"
```

If a repo already exists:

```bash
git -C ".ref/repos/<slug>" remote -v
git -C ".ref/repos/<slug>" fetch --depth=1 origin
```

Rules:
- do not delete existing `.ref` contents unless the user explicitly asks
- prefer one repo per architectural angle instead of many near-duplicates
- record repo URL, local path, visible license, and why it was selected
- cloned repos are reference inputs, not vendored runtime dependencies

### 5. Read local code, not just README files

Inspect the cloned repos for:
- entry points and startup flow
- agent/task lifecycle
- tool registry and execution model
- memory/state model
- planning/routing/orchestration logic
- extension points, plugin interfaces, or protocol boundaries
- test layout and what behavior is protected

Capture concrete implementation mechanisms:
- module/file paths
- important classes/functions
- data flow
- tradeoffs or limitations

Avoid shallow summaries like "supports tools and memory". Explain how.

### 6. Write or update `docs/ref.md`

Required sections:

```md
# Reference Pack

- Topic:
- Generated:
- Scope:

## Search Queries

## Official Docs

## Open Source Projects

## Repo Notes

## Cross-Project Patterns

## Recommended Directions

## Open Questions
```

For each official doc, include:
- title
- link
- what it contributes

For each open-source repo, include:
- repo name and link
- local clone path under `.ref/repos/`
- what part of the user's problem it covers
- key files/modules worth reading
- implementation mechanisms worth borrowing
- caveats, constraints, or mismatches

For cross-project synthesis, focus on:
- recurring architecture patterns
- conflicting design choices
- ideas worth copying
- ideas worth avoiding
- how the studied repos should influence the current project's design

### 7. Quality bar

Before finishing, verify:
- `.ref/` exists and is ignored by `.gitignore`
- `docs/ref.md` exists and contains concrete links plus local clone paths
- summaries are specific enough that a later agent can open the cloned repos and continue implementation
- long copyrighted passages are not copied verbatim; summarize and cite instead

## Output Style

Prefer concise, implementation-oriented notes. `docs/ref.md` should read like a working engineer's reference memo, not a literature review.

Bad:
- "This repo is modern and powerful."

Good:
- "Uses a central task runtime in `src/runtime/runner.ts`; tool calls are wrapped in a retryable execution envelope with explicit event emission."

## Common Triggers

- "帮我做一个 ref，搜一下相关文档和开源项目"
- "Create a reference pack for building an agent framework"
- "给这个需求准备一个 docs/ref.md，并把相关开源项目 clone 下来"
- "I want local reference repos under `.ref/` before implementation"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
