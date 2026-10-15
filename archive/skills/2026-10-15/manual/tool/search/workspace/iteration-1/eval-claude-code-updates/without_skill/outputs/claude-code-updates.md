# Claude Code Latest Updates

> **Note:** This summary is based on knowledge available up to May 2025. Live web search was unavailable during generation, so very recent updates (after May 2025) may be missing.

---

## What is Claude Code?

Claude Code is Anthropic's official agentic coding tool that operates directly in the terminal. It understands your codebase, can execute commands, edit files, and handle complex multi-step software engineering tasks — all through natural language.

---

## Key Updates & Features (as of early-mid 2025)

### General Availability (GA) Launch
- Claude Code moved from research preview to **general availability** in early 2025.
- Available to all Claude Pro, Team, and Enterprise plan users.
- Installable via `npm install -g @anthropic-ai/claude-code`.

### Core Capabilities
- **Agentic Coding:** Claude Code can autonomously navigate codebases, read/write files, execute shell commands, search code, and run tests — all in a loop until the task is complete.
- **Context-Aware:** Automatically understands project structure, git history, and relevant files without manual context loading.
- **Multi-file Editing:** Can make coordinated changes across multiple files in a single task.
- **Terminal-native:** Runs directly in the terminal/CLI, integrating into existing developer workflows.

### Model Upgrades
- Claude Code is powered by **Claude Sonnet** (and optionally **Claude Opus**) models.
- Claude Sonnet 4 and Claude Opus 4 were released, bringing significant improvements to coding performance:
  - Better code generation accuracy
  - Improved instruction following
  - Enhanced agentic tool use capabilities
  - Superior performance on SWE-bench and other coding benchmarks

### Extended Thinking
- Support for **extended thinking** mode, allowing Claude Code to reason through complex problems step-by-step before acting.
- Visible thinking traces help users understand Claude's reasoning process.

### Tool Use & Permissions
- **Permission system:** Claude Code has a granular permission model (allow/deny) for file edits, command execution, etc.
- **Allowlists:** Users can pre-approve specific tools and commands to reduce permission prompts.
- **CLAUDE.md files:** Project-level instruction files that let teams define coding standards, conventions, and context for Claude Code.

### Git & GitHub Integration
- Built-in git awareness: understands branches, diffs, commit history.
- Can create commits, branches, and pull requests.
- GitHub CLI (`gh`) integration for PR creation, issue management, and more.

### IDE Integrations
- **VS Code extension:** Claude Code available as a VS Code extension for in-editor agentic coding.
- **JetBrains plugin:** Support for JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.).
- Terminal-based usage remains the primary interface.

### MCP (Model Context Protocol) Support
- Claude Code supports **MCP servers** for extending its capabilities.
- Users can connect external tools, databases, APIs, and services via MCP.
- Configuration via `claude_desktop_config.json` or project-level settings.

### Headless / CI Mode
- **Non-interactive mode** for running Claude Code in CI/CD pipelines.
- Can be used for automated code review, test generation, and deployment tasks.
- Supports `--print` flag for non-interactive single-shot queries.

### Custom Slash Commands
- Users can define custom **slash commands** (`/commands`) for frequently used workflows.
- Project-level commands stored in `.claude/commands/` directory.

### Memory & Settings
- **CLAUDE.md** files at project, user, and global levels for persistent instructions.
- Claude Code remembers project context across sessions within the same project.

### Multi-turn Conversations
- Full conversational interface with history within a session.
- Can reference previous context and iterate on solutions.

### Cost Controls
- Usage tracking and cost visibility.
- Token usage displayed per interaction.
- API-key based usage with standard Anthropic billing.

---

## Performance Benchmarks

- Claude Code (powered by Claude Sonnet 4 / Opus 4) achieved state-of-the-art results on:
  - **SWE-bench Verified:** Top-tier performance on real-world GitHub issue resolution.
  - **Terminal-bench:** Strong results on terminal-based coding tasks.
  - **Agentic coding benchmarks:** Leading performance across multiple agentic evaluations.

---

## Installation & Setup

```bash
# Install globally via npm
npm install -g @anthropic-ai/claude-code

# Run in any project directory
cd your-project
claude

# Or run a single command
claude -p "explain this codebase"
```

---

## Pricing

- Included with **Claude Pro** ($20/month) — usage limits apply.
- Included with **Claude Team** and **Enterprise** plans.
- Also available via **Anthropic API** with standard token-based pricing.
- **Claude Max** plan ($100/month or $200/month) offers higher usage limits for power users.

---

## Known Limitations

- Requires an active internet connection (API-based).
- Large codebases may require careful context management.
- Some operations require explicit user permission (security model).
- Token limits apply per conversation turn.

---

## Resources

- Official docs: https://docs.anthropic.com/en/docs/claude-code
- GitHub: https://github.com/anthropics/claude-code
- Anthropic changelog: https://docs.anthropic.com/en/changelog
- npm package: https://www.npmjs.com/package/@anthropic-ai/claude-code

---

*Last updated: 2026-03-13 (based on knowledge through May 2025; web search was unavailable for latest updates)*
