---
name: trending
description: Use when collecting, summarizing, or reviewing daily AI industry trends, product launches, papers, and community discussions into a dated digest
---

# Trending

## Overview

Collect and organize daily AI hot topics into a concise report for quick review and follow-up.

## When to Use

- Need a daily/weekly AI trend digest
- Want a structured summary of products, papers, and industry news
- Need a repeatable format for historical tracking by date

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

## Commands (Example)

```bash
alma trending collect
alma trending show <date>
```

## Quality Checklist

- Avoid duplicate topics across sources
- Prefer primary sources when available
- Separate facts from commentary
- Record date/time of collection
