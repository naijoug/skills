---
name: power-web-search
description: Use when the user wants to search the web, research a topic, or look something up online and needs comprehensive multi-source search results synthesized into a Markdown report
---

# Power Search

Fan out a search query across **all available** search and reading tools in parallel, then synthesize a unified bilingual summary and save as a Markdown document.

## Why This Skill Exists

No single search tool covers everything. Built-in WebSearch returns only titles and URLs; Tavily excels at technical docs; Brave has its own independent index; Jina converts pages to clean Markdown; specialized readers handle platforms like X/Twitter, YouTube, WeChat. By querying all available tools simultaneously and merging results, you get dramatically better coverage than any single source.

## Prerequisites / Setup

### Built-in Tools (no configuration needed)

These tools are always available in your AI coding environment — no API keys required:

| Tool | Claude Code | Amp | Notes |
|------|-------------|-----|-------|
| Web Search | `WebSearch` | `web_search` | Basic web search |
| Page Reader | `WebFetch` | `read_web_page` | Read/extract web pages |
| Context7 | `mcp__context7__query-docs` | `context7` | Library/framework docs |

### MCP Tools (require API keys)

These tools provide significantly better search coverage but need API keys configured as MCP servers in your AI coding tool's settings.

| Tool | API Key Source | Free Tier? |
|------|---------------|------------|
| **Tavily** | [tavily.com](https://tavily.com) → API Keys | ✅ 1,000 calls/month |
| **Brave Search** | [brave.com/search/api](https://brave.com/search/api/) → Get API Key | ✅ 2,000 calls/month |
| **Jina AI Reader** | [jina.ai/reader](https://jina.ai/reader/) → API Key | ✅ Limited free |
| **x-reader** | See x-reader MCP docs | Varies by platform |

### API Key Configuration

All API keys are stored in `~/.power-web-search/config.yaml`:

```yaml
# Power Web Search Configuration
workspace_path: ~/.power-web-search/results

api_keys:
  tavily: "tvly-xxxxx"        # https://tavily.com → API Keys
  brave: "BSA-xxxxx"          # https://brave.com/search/api/
  jina: "jina_xxxxx"          # https://jina.ai/reader/
```

The skill uses a **two-layer resolution** for each tool:

1. **MCP server available?** → use it directly (fastest, keys are in MCP server config)
2. **No MCP but key in config.yaml?** → call the REST API via Bash `curl` (fallback). Use WebFetch for GET-only APIs (Brave, Jina); use `curl` for POST APIs (Tavily).
3. **Neither?** → skip with "— not configured —"

> **Minimum viable setup:** The skill works with just built-in tools (WebSearch + WebFetch). Each API key you add expands coverage. Start with Tavily (best free tier).

### Direct API Fallback Reference

When an MCP server is not available but a key exists in `config.yaml`, call the REST API directly. Use **WebFetch** for GET APIs, **Bash `curl`** for POST APIs.

#### Tavily (POST → use `curl`)
```bash
curl -s -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "<search_query>", "api_key": "<key>", "max_results": 10}'
```

#### Brave Search (GET → use WebFetch or `curl`)
```bash
curl -s "https://api.search.brave.com/res/v1/web/search?q=<encoded_query>&count=10" \
  -H "X-Subscription-Token: <key>"
```

#### Jina Reader (GET → use WebFetch or `curl`)
```bash
curl -s "https://r.jina.ai/<target_url>" \
  -H "Authorization: Bearer <key>"
```

## Tool Detection

Before searching, scan the current environment for available tools across these two layers:

> **Note:** Tool names below are generic. Actual tool names vary by AI coding tool (e.g., `web_search` / `read_web_page` in Amp, `WebSearch` / `WebFetch` in Claude Code). Always use the tools available in your current environment.

### Layer 1 — Search Engines (always dispatch)
| Tool | How to detect | How to use |
|------|--------------|------------|
| **Built-in Web Search** | Always available (e.g., `web_search`, `WebSearch`) | Search by query |
| **Tavily MCP** | Look for `tavily` or `tavily-search` in available tools | `tavily_search(query)` / `tavily_extract(url)` |
| **Brave Search MCP** | Look for `brave` in available tools | `brave_web_search(query)` |
| **Open-WebSearch MCP** | Look for `open-websearch` or `open_web_search` in available tools | Search with multiple engines |
| **Context7** | Look for `context7` or `query-docs` in available tools | `resolve-library-id` then `query-docs` — best for library/framework documentation |

### Layer 2 — Page Readers (use to deepen results)
| Tool | How to detect | How to use |
|------|--------------|------------|
| **Built-in Page Reader** | Always available (e.g., `read_web_page`, `WebFetch`) | Read a URL and extract content |
| **Jina AI Reader** | Look for `jina` in available tools | `read_url(url)` — converts web page to clean Markdown |
| **x-reader** | Look for `x-reader` or `xreader` in available tools | Read from WeChat, X/Twitter, YouTube, Bilibili, Xiaohongshu, Telegram, RSS |
| **Agent-Reach** | Look for `agent-reach` in available tools | Multi-platform content fetch (free, no API key) |

## Workspace Configuration

Search results are saved to a workspace directory defined in `~/.power-web-search/config.yaml` (the same file that holds API keys).

**Resolution order:**
1. Read `~/.power-web-search/config.yaml` → use `workspace_path` value
2. If config doesn't exist → use default `~/.power-web-search/results/` and create `config.yaml` with the full template (including empty `api_keys` section)

Create directories as needed — do not pre-create empty directories.

## Workflow

### Step 1: Parse the Query

Extract the user's search intent. Prepare bilingual versions:
- Chinese input → also prepare English translation
- English input → also prepare Chinese translation

Both versions will be searched to maximize coverage.

### Step 2: Detect Available Tools & Load API Keys

1. **Read `~/.power-web-search/config.yaml`** — extract `api_keys` section
2. **Scan environment** for MCP tools (Tavily, Brave, Jina, Context7, etc.)
3. **Build the tool dispatch list** using two-layer resolution for each service:

| Priority | Condition | Action |
|----------|-----------|--------|
| 1st | MCP tool detected in environment | Use MCP tool directly |
| 2nd | No MCP, but key in `config.yaml` is non-empty | Call REST API via WebFetch (see Direct API Fallback Reference) |
| 3rd | Neither MCP nor key | Skip — show "— not configured —" |

4. **Built-in tools** (WebSearch, WebFetch) are always available — no key needed.

Report the final tool list to the user before searching:

```
🔍 Tools available:
  ✅ WebSearch (built-in)
  ✅ WebFetch (built-in)
  ✅ Tavily (API key from config.yaml)
  ✅ Brave Search (MCP)
  ✅ Jina Reader (API key from config.yaml)
  ❌ Context7 — MCP permission denied
```

Do NOT let missing tools block the search — proceed with whatever is available.

### Step 3: Fan Out Parallel Searches

Dispatch **one subagent per available search tool** using the subagent/task mechanism available in your environment (e.g., `Task` tool in Amp, `Agent` tool in Claude Code). All subagents should run concurrently when possible.

Each subagent should:
1. Receive the query in both languages
2. Execute the search using its assigned tool
3. Return structured results: key findings + source list

**Subagent prompt template:**
```
You are a search agent. Use ONLY the tool specified below to search for information.

Query (English): {english_query}
Query (Chinese): {chinese_query}

Tool to use: {tool_name}
Mode: {mcp | api_fallback}
{If api_fallback: API Key: {key}, Endpoint: {endpoint} — call via WebFetch}
Instructions: {tool_specific_instructions}

Return your results in this exact format:

## Results from {tool_name}

### Key Findings
- Finding 1
- Finding 2
- ...

### Sources
1. [Title](URL) — one-line summary
2. [Title](URL) — one-line summary
...

If the tool returns no useful results, say "No results found via {tool_name}."
```

**Layer 2 dispatching rules:**
- If the query mentions a specific platform (X/Twitter, YouTube, WeChat, Bilibili, etc.), dispatch the reader that specializes in that platform
- Otherwise, use WebFetch to read the top 3-5 URLs from Layer 1 search results after they return
- If Layer 1 results reference important-looking pages, dispatch readers to extract full content

### Step 4: Aggregate Results

Once all subagents complete:

1. **Collect** all results from every subagent
2. **Deduplicate** — merge entries pointing to the same URL or covering the same fact
3. **Rank** — prioritize information that appears across multiple sources (cross-validated = more reliable)
4. **Synthesize** — write a unified summary answering the user's original question

### Step 5: Save as Markdown Document

Write the final output as a `.md` file. Use the output template below. Save to the workspace directory resolved from config (see Workspace Configuration above), or a path the user specifies.

**File naming:** `power-search-{slug}.md` where `{slug}` is a short kebab-case version of the query (e.g., `power-search-claude-code-2026-updates.md`).

Always respond in the same language the user used, with bilingual key terms where helpful.

## Output Template

```markdown
# {query}

> Power Search | {date} | Tools: {list of tools used}

## Summary / 综合摘要

{A clear, comprehensive answer to the user's query, synthesized from all sources.
Highlight consensus findings and note any contradictions between sources.
Include bilingual key terms where helpful — e.g., "检索增强生成 (RAG)".}

---

## Detailed Results by Source / 各工具搜索结果

### WebSearch
{key findings and sources}

### Tavily
{key findings and sources, or "— not available —"}

### Brave Search
{key findings and sources, or "— not available —"}

### Open-WebSearch
{key findings and sources, or "— not available —"}

### Context7
{key findings and sources, or "— not available —"}

### WebFetch
{deep-read findings from specific URLs}

### Jina AI Reader
{findings, or "— not available —"}

### x-reader
{findings, or "— not available —"}

### Agent-Reach
{findings, or "— not available —"}

---

## All Sources / 信息来源

| # | Title | URL | Source Tool |
|---|-------|-----|------------|
| 1 | {title} | {url} | {tool} |
| 2 | {title} | {url} | {tool} |
| ... | | | |
```

## Bilingual Search Strategy

- **Chinese query** → search Chinese text with all tools, ALSO search the English translation with WebSearch, Brave, Tavily (these return better English results)
- **English query** → search English text with all tools, ALSO search the Chinese translation with tools that cover Chinese content (Open-WebSearch with Baidu, x-reader for WeChat/Bilibili/Xiaohongshu)
- The summary language matches the user's input language; key technical terms are shown bilingually

## Error Handling

- **Tool not available**: Show "— not available —" in that tool's section. No error needed.
- **API key not configured**: Show "⚠️ Not configured — add your key to `~/.power-web-search/config.yaml` under `api_keys.{tool_name}`." Point to the specific key field so the user can fix it immediately.
- **Authentication failed**: Show "⚠️ Auth error — check that your `api_keys.{tool_name}` in `~/.power-web-search/config.yaml` is valid and not expired." This is different from "not configured" — the key exists but is rejected.
- **Tool times out or errors**: Show "⚠️ Search failed: {brief error}" in that section. One failure must not block the overall result.
- **Contradictory results**: Highlight contradictions in the summary and note which sources support which position.
- **Rate limits**: Show "⚠️ Rate limit reached for [tool]. Try again later or check your plan's quota." Still include any partial results returned before the limit.

## Example Triggers

- "帮我搜一下 Claude Code 最新的更新"
- "Search for the latest developments in AI agents"
- "查一下 Rust async runtime 的最佳实践"
- "Research how to set up MCP servers"
- "帮我了解一下 2026 年最火的 AI 编程工具"
- "Look up alternatives to Docker for containerization"
- "搜索 transformer 架构的最新论文"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
