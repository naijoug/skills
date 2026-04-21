---
name: daily-trending
description: Use when collecting, summarizing, or reviewing daily AI industry trends, product launches, papers, and community discussions into a dated digest
---

# Trending

## Overview

Collect and organize daily AI hot topics into a concise report for quick review and follow-up.

## When to Use

- Need a daily/weekly AI trend digest
- Want a structured summary of products, papers, and industry news
- Need a repeatable format for historical tracking by date

## When Not to Use

- User asks about a specific technology's documentation or usage (use normal Q&A)
- User wants a personal learning plan based on trends (use `personal-coach`)
- User wants to record a specific learning from today (use `til-journal`)

## Suggested Workflow

1. Gather signals from multiple sources (news, communities, code, papers).
2. Deduplicate overlapping topics.
3. Group by category (product, research, tooling, industry).
4. Summarize each item with why it matters.
5. Save with a date-based filename for later retrieval.

## Output Format (Recommended)

For each topic, include:

- `title`: short headline
- `category`: product / paper / tooling / industry / community
- `summary`: 1-3 sentence summary
- `why_it_matters`: impact or relevance
- `source`: link or source name

## Data Sources (Examples)

- Hacker News
- Reddit (`r/MachineLearning`, `r/LocalLLaMA`)
- arXiv
- GitHub Trending (AI/ML related)
- X/Twitter (AI researchers/builders)
- Company blogs / release notes

## Output Template

```markdown
# AI Trends — <YYYY-MM-DD>

## 🔥 Today's Highlights

### 1. <Title>
- **Category**: product / paper / tooling / industry / community
- **Summary**: <1-3 sentence summary>
- **Why it matters**: <impact or relevance>
- **Source**: <link or source name>

### 2. <Title>
...

## Quick Stats
- Total items: <N>
- By category: product(<n>), paper(<n>), tooling(<n>), industry(<n>), community(<n>)
```

## Quality Checklist

- Avoid duplicate topics across sources
- Prefer primary sources when available
- Separate facts from commentary
- Record date/time of collection

## Example Triggers

- "今天 AI 领域有什么新动态？"
- "Give me today's AI trend digest"
- "What happened in AI this week?"
- "Summarize the latest ML papers and product launches"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
