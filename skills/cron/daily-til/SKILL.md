---
name: daily-til
description: Use when a recurring daily job sweeps the past day's AI sessions for recordable knowledge, or when the user manually asks to record/review/summarize/search their TIL diary
---

# TIL Journal

## Overview

You are an AI-powered knowledge diary assistant. The skill runs in two complementary ways:

1. **Daily scheduled sweep (primary)** — fired once per day by a cron / scheduled trigger. Reads back over the past 24 hours of AI sessions and captures any non-obvious knowledge points into today's daily file.
2. **On-demand modes** — the user explicitly asks to capture a single knowledge point, review a day/week/month/year, or search past entries.

Core principle: capture knowledge in the moment when context is fresh, then synthesize patterns over time. The skill is **not** auto-injected into every conversation turn — that proved noisy. Instead it batches once per day.

## When to Use

- A scheduled job triggers the skill (typical schedule: once daily, e.g. `0 22 * * *`)
- User learned something new and wants to record it on the spot
- User solved an interesting bug or discovered a useful technique worth saving
- User wants to review today's / this week's / this month's / this year's learnings
- User wants to search past knowledge entries
- User says: "TIL", "记录一下", "今日回顾", "本周总结", "本月总结", "年度总结"

## When Not to Use

- User wants to implement a feature (use implementation skills)
- User wants to collect industry news/trends (use `daily-trending` skill)
- User wants a personal growth plan (use `personal-coach` skill)
- User is asking a factual question and doesn't want it recorded

## Storage Configuration

### Config File

On first use, check for `~/.til-journal/config.yaml`:

```yaml
# TIL Journal Configuration
storage_path: ~/.til-journal    # Data storage root, can be changed to any path
```

**Resolution order:**
1. Read `~/.til-journal/config.yaml` → use `storage_path` value
2. If config doesn't exist → use default `~/.til-journal/` and create config.yaml

### Directory Structure

```
<storage_path>/
├── config.yaml
├── daily/
│   └── <YYYY>/
│       └── <MM>/
│           └── <YYYY-MM-DD>.md
├── weekly/
│   └── <YYYY>/
│       └── <YYYY>-W<WW>.md
├── monthly/
│   └── <YYYY>/
│       └── <YYYY-MM>.md
├── yearly/
│   └── <YYYY>.md
└── tags.md
```

Create directories as needed — do not pre-create empty directories.

## Mode Detection

Determine the active mode using this priority:

| Trigger | Mode |
|---------|------|
| Cron / launchd fires with `mode=scheduled-sweep` (or no user prompt + context flag for scheduled run) | **Scheduled Sweep** (primary) |
| "TIL/记录/record/learned/记一下/学到了" | Manual Capture |
| "今日回顾/daily review/today's learnings" | Daily Review |
| "本周总结/weekly summary/this week" | Weekly Summary |
| "本月总结/monthly summary/this month" | Monthly Summary |
| "年度总结/yearly summary/annual review" | Yearly Summary |
| "搜索/search/查找/find" + keyword | Search |
| Other knowledge-related | Smart detect, default to Manual Capture |

> **Output formats** for all six output-producing modes (Manual Capture, Daily Review, Weekly/Monthly/Yearly Summary, Search) live in `references/output-templates.md`. Load it on demand — do not inline templates here.

---

## Scheduled Sweep Mode (primary, cron-driven)

> **Suggested schedule:** once per day, e.g. `0 22 * * *` (every day at 22:00 local time, near end-of-day).
> Use the host's scheduling primitive — Claude Code's `/cron`, a system `cron`/`launchd` job, or any equivalent that fires this skill.

**What the daily sweep does:**

Looks back over the past ~24 hours of AI sessions on this machine and harvests recordable knowledge into today's daily file. Designed to be quiet — most days will produce zero or one entry, not a wall of trivia.

**What to capture:**
- A new technique, API, pattern, or concept the user learned
- A tricky bug solved (root cause + fix)
- A useful tool, library, or configuration discovered
- A non-obvious insight from a conversation

**What to skip:**
- Routine tasks with no new knowledge (simple edits, formatting, config)
- Pure project management or planning conversations
- Knowledge the user clearly already knew
- Shallow Q&A (e.g., "what's the port number?")
- Anything already captured earlier the same day (deduplicate by title + summary)

**Flow:**

1. Determine the sweep window: from the last successful sweep timestamp (read from `<storage_path>/.last-sweep`) up to "now". If no marker exists, default to the past 24 hours.
2. Locate session transcripts for that window. Common roots:
   - Claude Code: `~/.claude/projects/*/*.jsonl`
   - Codex: `~/.codex/sessions/` (if present)
   - Other tools the user has configured
3. For each session, decide: did it produce 0, 1, or several recordable knowledge points? Most should be 0.
4. For each kept point, extract a concise title + 2-3 sentence summary + 1-3 tags.
5. Read today's daily file at `<storage_path>/daily/<YYYY>/<MM>/<YYYY-MM-DD>.md`. Create with the header below if missing.
6. Append each new entry, incrementing the entry number; skip any whose title clearly duplicates an existing entry today.
7. Update `<storage_path>/tags.md` with the new tags.
8. Write a fresh ISO-8601 timestamp to `<storage_path>/.last-sweep`.
9. End with a one-line summary so the user can scan the run later: e.g. `📝 sweep done — 2 new entries from 8 sessions`.

If the sweep finds nothing recordable → write nothing, but still update `.last-sweep` and report `📝 sweep done — nothing new (8 sessions scanned)`.

---

## Manual Capture Mode

**Trigger:** User explicitly says they learned something, or asks to record a knowledge point.

**Flow:**

1. Extract knowledge from current context: user's explicit description, recent conversation ("record what we just discussed"), or code-demonstrated technique.
2. Generate a structured entry using the *Manual Capture Entry* template in `references/output-templates.md`.
3. Read today's daily file (create from *Daily Entry File* template if missing).
4. Append the new entry with the next number, update the Daily Stats footer.
5. Update `tags.md` index — use established tag categories from `references/output-templates.md` (don't create duplicates like `#rust` and `#Rust`).

## Daily / Weekly / Monthly / Yearly Review Modes

Each review mode follows the same shape:

1. Read source files for the target window (today / ISO week / month / year).
2. If no entries → tell the user and suggest capturing.
3. Otherwise synthesize using the matching template in `references/output-templates.md` (do **not** inline the template here).
4. Save to the path specified at the bottom of each template (`weekly/<YYYY>/...`, `monthly/<YYYY>/...`, `yearly/<YYYY>.md`).

Synthesis discipline: surface patterns, blind spots, and trends — not just lists of titles.

## Search Mode

**Trigger:** User wants to find past entries.

1. Get keyword(s).
2. Search `tags.md` first (by tag), then full-text in daily files (titles + summaries).
3. Present results using the *Search Output* template in `references/output-templates.md`.

## Quality Checklist

- Each entry has a clear, descriptive title
- Tags are consistent (use established tag names, don't create duplicates like #rust and #Rust)
- Summaries are concise but capture the essential insight (3-5 sentences)
- Code snippets are minimal — just enough to illustrate the point
- Daily stats are updated after each capture
- tags.md is updated to maintain the searchable index
- Summaries synthesize patterns, not just list entries
- Storage path is read from config.yaml, not hardcoded
- Scheduled sweeps update `.last-sweep` and never re-record duplicates from the same day

## Example Triggers

- "TIL: Rust 的 `?` 操作符可以在 main 函数中使用"
- "记录一下：刚学到 Go 的 context 取消机制"
- "Record this — Flutter's RepaintBoundary improves performance"
- "今日回顾"
- "本周总结一下学到了什么"
- "这个月的知识总结"
- "搜索之前关于 concurrency 的记录"
- "What did I learn about Docker this month?"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
