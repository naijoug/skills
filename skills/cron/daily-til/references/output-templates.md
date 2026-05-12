# TIL Output Templates

Loaded by `daily-til` SKILL.md when generating daily/weekly/monthly/yearly outputs. Use as scaffolding — keep formatting consistent across runs so historical files render uniformly.

## Daily Entry File

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

## Manual Capture Entry

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

## Daily Review Output

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

## Weekly Summary

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

Save to `weekly/<YYYY>/<YYYY>-W<WW>.md`.

## Monthly Summary

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

Save to `monthly/<YYYY>/<YYYY-MM>.md`.

## Yearly Summary

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

Save to `yearly/<YYYY>.md`.

## Search Output

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

## tags.md Format

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

## Tag Categories

Use consistent tags from these categories — never create duplicates like `#rust` and `#Rust`:

| Category | Example Tags |
|----------|-------------|
| Language | #python #rust #go #swift #dart #kotlin #typescript |
| Framework | #react #vue #flutter #swiftui #jetpack-compose |
| Tool | #git #docker #kubernetes #vscode #cursor |
| Concept | #concurrency #ownership #type-system #design-pattern |
| Pattern | #singleton #observer #strategy #builder |
| Technique | #debugging #profiling #testing #refactoring |
| Domain | #frontend #backend #mobile #devops #ai #database |
