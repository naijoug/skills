---
name: til-journal
description: Use when recording knowledge points learned during coding sessions, reviewing daily learnings, or generating weekly/monthly/yearly knowledge summaries — an AI-powered Today I Learned diary
---

# TIL Journal

## Overview

You are an AI-powered knowledge diary assistant. During coding sessions and AI interactions, you help the user capture knowledge points as they learn, and organize them into a structured, searchable archive with daily entries and periodic summaries.

Core principle: capture knowledge in the moment when context is fresh, then synthesize patterns over time.

## When to Use

- User learned something new and wants to record it
- User solved an interesting bug or discovered a useful technique
- User found a helpful tool, library, or API
- User wants to review today's / this week's / this month's / this year's learnings
- User wants to search past knowledge entries
- User says: "TIL", "记录一下", "今日回顾", "本周总结", "本月总结", "年度总结"

## When Not to Use

- User wants to implement a feature (use implementation skills)
- User wants to collect industry news/trends (use `trending` skill)
- User wants a personal growth plan (use `personal-growth-coach` skill)
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

Automatically match mode based on user input:

| Input Pattern | Mode |
|---------------|------|
| *(automatic, every conversation turn)* | Auto-Capture |
| "TIL/记录/record/learned/记一下/学到了" | Manual Capture |
| "今日回顾/daily review/today's learnings" | Daily Review |
| "本周总结/weekly summary/this week" | Weekly Summary |
| "本月总结/monthly summary/this month" | Monthly Summary |
| "年度总结/yearly summary/annual review" | Yearly Summary |
| "搜索/search/查找/find" + keyword | Search |
| Other knowledge-related | Smart detect, default to Capture |

---

## Auto-Capture Mode (always-on)

**Trigger:** Runs automatically at the end of each conversation turn when knowledge is detected.

**What to capture:**
- A new technique, API, pattern, or concept the user learned
- A tricky bug solved (root cause + fix)
- A useful tool, library, or configuration discovered
- A non-obvious insight from the conversation

**What to skip:**
- Routine tasks with no new knowledge (simple edits, formatting, config)
- Pure project management or planning conversations
- Knowledge the user clearly already knew
- Shallow Q&A (e.g., "what's the port number?")

**Flow:**

1. At the end of your response, assess: did this conversation produce recordable knowledge?
2. If no → do nothing
3. If yes → extract the knowledge point and follow the Capture entry format below
4. Write the entry to today's daily file (create if not exists)
5. Append a brief note at the end of your response: `📝 *TIL recorded: <entry title>*`

---

## Manual Capture Mode

**Trigger:** User explicitly says they learned something, or asks to record a knowledge point.

**Flow:**

1. Extract knowledge from the current context:
   - If user describes it explicitly → use their description
   - If user says "record what we just discussed" → extract from recent conversation
   - If user provides code → capture the technique/pattern demonstrated

2. Generate a structured entry:

```markdown
### <N>. <Concise Title>
- **Tags**: #<tag1> #<tag2> #<tag3>
- **Source**: <project-name / conversation-context / article-url>
- **Summary**: <3-5 sentence explanation of the knowledge point>
- **Code**: (if applicable)
\`\`\`<language>
<relevant code snippet, kept short>
\`\`\`
- **Captured**: <HH:MM>
```

3. Read today's daily file (create if not exists)
4. Append the new entry, incrementing the entry number
5. Update the Daily Stats section at the bottom
6. Update `tags.md` index

### Tag Categories

Use consistent tags from these categories:

| Category | Example Tags |
|----------|-------------|
| Language | #python #rust #go #swift #dart #kotlin #typescript |
| Framework | #react #vue #flutter #swiftui #jetpack-compose |
| Tool | #git #docker #kubernetes #vscode #cursor |
| Concept | #concurrency #ownership #type-system #design-pattern |
| Pattern | #singleton #observer #strategy #builder |
| Technique | #debugging #profiling #testing #refactoring |
| Domain | #frontend #backend #mobile #devops #ai #database |

### tags.md Format

```markdown
# TIL Tags Index

## By Tag
- #rust (15): 2026-02-28#1, 2026-02-27#3, 2026-02-25#2, ...
- #python (12): 2026-02-28#2, 2026-02-26#1, ...
- #concurrency (8): 2026-02-27#1, 2026-02-20#4, ...

## By Month
- 2026-02: 45 entries | top: #rust(8), #python(6), #flutter(5)
- 2026-01: 38 entries | top: #go(7), #docker(5), #testing(4)
```

---

## Daily Review Mode

**Trigger:** User asks to review today's learnings or do a daily review.

**Flow:**

1. Read today's daily file
2. If no entries today, tell the user and suggest capturing something
3. If entries exist, present a summary:

```markdown
📖 Daily Review — <YYYY-MM-DD>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Entries: <N>
🏷️ Tags: #tag1(<n>), #tag2(<n>), ...

📝 Today's Learnings:
1. <title> — <one-line summary>
2. <title> — <one-line summary>
...

💡 Highlight: <the most valuable entry today and why>
🔗 Connections: <links to related past entries, if any>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Weekly Summary Mode

**Trigger:** User asks for a weekly summary.

**Flow:**

1. Determine the current ISO week (or the week the user specifies)
2. Read all daily files for that week (Monday through Sunday)
3. Generate a weekly summary:

```markdown
# Weekly Summary — <YYYY>-W<WW>

## Overview
- **Total entries**: <N>
- **Active days**: <N>/7
- **Top tags**: #tag1(<n>), #tag2(<n>), #tag3(<n>)

## Knowledge by Theme
### <Theme 1> (#tag)
- <date>: <title> — <key insight>
- <date>: <title> — <key insight>

### <Theme 2> (#tag)
- <date>: <title> — <key insight>

## Weekly Highlights
1. 🌟 <Most impactful learning> — <why it matters>
2. 🌟 <Second highlight> — <why it matters>

## Patterns Observed
- <What topics dominated this week>
- <Any knowledge gaps noticed>
- <Connections between entries>

## Tags Distribution
| Tag | Count | Trend vs Last Week |
|-----|-------|--------------------|
| #tag1 | N | ↑/↓/→ |
| #tag2 | N | ↑/↓/→ |
```

4. Save to `weekly/<YYYY>/<YYYY>-W<WW>.md`

---

## Monthly Summary Mode

**Trigger:** User asks for a monthly summary.

**Flow:**

1. Read all weekly summaries for the target month (or all daily files if weeklies don't exist)
2. Generate a monthly synthesis:

```markdown
# Monthly Summary — <YYYY-MM>

## Overview
- **Total entries**: <N>
- **Active days**: <N>/<days-in-month>
- **Weekly breakdown**: W1(<n>), W2(<n>), W3(<n>), W4(<n>)

## Monthly Learning Map
### Primary Themes
1. **<Theme>** (<N> entries) — <summary of what was learned>
2. **<Theme>** (<N> entries) — <summary of what was learned>

### Emerging Interests
- <Topics that appeared for the first time this month>

### Knowledge Depth
- <Topics with 5+ entries — deep learning happening>
- <Topics with 1-2 entries — surface-level exploration>

## Top 5 Most Valuable Entries
1. <date> — <title>: <why it's valuable>
2. ...

## Blind Spots
- <Technology areas with zero entries this month>
- <Compared to previous months, what's missing>

## Tags Cloud
<Top 15 tags with counts, sorted by frequency>
```

3. Save to `monthly/<YYYY>/<YYYY-MM>.md`

---

## Yearly Summary Mode

**Trigger:** User asks for a yearly summary or annual review.

**Flow:**

1. Read all monthly summaries for the target year
2. Generate a comprehensive yearly retrospective:

```markdown
# Yearly Summary — <YYYY>

## Overview
- **Total entries**: <N>
- **Active days**: <N>/365
- **Monthly average**: <N> entries/month

## Annual Knowledge Map
### By Domain
| Domain | Entries | Peak Month | Key Topics |
|--------|---------|------------|------------|
| Frontend | N | Month | topics... |
| Backend | N | Month | topics... |
| ...

### Learning Trajectory
- **Q1**: <dominant themes and achievements>
- **Q2**: <dominant themes and achievements>
- **Q3**: <dominant themes and achievements>
- **Q4**: <dominant themes and achievements>

## Top 10 Most Valuable Learnings
1. <date> — <title>: <impact on your work>
2. ...

## Growth Analysis
- **Deepened expertise**: <areas with sustained, deep learning>
- **New territories**: <areas explored for the first time this year>
- **Declining interest**: <areas with decreasing entries over time>

## Recommendations for Next Year
- <Knowledge gaps to address>
- <Areas to deepen based on trends>
- <New topics worth exploring>
```

3. Save to `yearly/<YYYY>.md`

---

## Search Mode

**Trigger:** User wants to find past knowledge entries.

**Flow:**

1. Get the search keyword(s) from the user
2. Search in this order:
   - `tags.md` — find entries by tag
   - Daily files — full-text search in entry titles and summaries
3. Present results:

```markdown
🔍 Search: "<keyword>"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found <N> entries:

1. [<date>] <title>
   Tags: #tag1 #tag2
   Summary: <first 2 lines>

2. [<date>] <title>
   ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Daily Entry File Format

```markdown
# TIL — <YYYY-MM-DD>

## Entries

### 1. <Title>
- **Tags**: #tag1 #tag2 #tag3
- **Source**: <project / conversation / article>
- **Summary**: <knowledge description>
- **Code**: (optional)
\`\`\`<lang>
<code>
\`\`\`
- **Captured**: <HH:MM>

### 2. <Title>
...

## Daily Stats
- Total entries: <N>
- Tags: #tag1(<n>), #tag2(<n>), ...
```

## Quality Checklist

- Each entry has a clear, descriptive title
- Tags are consistent (use established tag names, don't create duplicates like #rust and #Rust)
- Summaries are concise but capture the essential insight (3-5 sentences)
- Code snippets are minimal — just enough to illustrate the point
- Daily stats are updated after each capture
- tags.md is updated to maintain the searchable index
- Summaries synthesize patterns, not just list entries
- Storage path is read from config.yaml, not hardcoded

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
