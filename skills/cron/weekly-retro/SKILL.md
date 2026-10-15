---
name: weekly-retro
description: Use when doing a weekly engineering retrospective to identify recurring mistakes, debugging patterns, review feedback themes, and concrete improvement experiments for the next week
---

# Weekly Coding Retro

## Overview

Turn a week of coding work into specific improvement loops.

Core principle: reflect on repeated patterns, not isolated frustrations.

## When to Use

- Weekly personal learning review
- After a week with repeated bugs, rework, or slow delivery
- To convert PR feedback and incidents into practice goals

## When Not to Use

- User wants a project status report only
- There is no source material (commits, notes, PR feedback, incidents) and no recall

## Inputs (any subset)

- Commits / PRs
- Review comments
- Bugs and incidents
- Time sinks / blockers
- Notes from daily work

## Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| Manual | User asks for a retro | Use whatever the user provides; ask for any missing inputs |
| Scheduled (`mode=scheduled-sweep`) | Cron / launchd fires with no user prompt | **Must run unattended** — auto-collect evidence from the sources below; do not ask questions |

Auto-collection sources for scheduled mode (past 7 days):

- AI session transcripts: recursively discover `~/.claude/projects/**/*.jsonl` and `~/.codex/sessions/**/*.jsonl` within the authorized sources and time window.
- Git activity: `git log --author="$(git config user.email)" --since='7 days ago'` across repo roots from `~/.weekly-retro/config.yaml: repos`
- PR feedback: if `gh` is available and authenticated, use the collection steps below for each configured repository. A PR list locates candidates; it is not the review feedback itself.
- Output: write to `~/.weekly-retro/<YYYY-MM-DD>.md`

For each configured repository, resolve its GitHub `OWNER/REPO` from the remote,
then run this portable date-filtered query:

```bash
retro_since=$(python3 -c 'from datetime import datetime, timedelta, timezone; print((datetime.now(timezone.utc) - timedelta(days=7)).date().isoformat())')
gh pr list --repo "$retro_repo" --author=@me --state=all \
  --search "updated:>=$retro_since" --limit 100 --json number,url,title,updatedAt
```

Read the relevant candidates with `gh pr view <number> --repo "$retro_repo"
--json title,url,comments,reviews`, and collect inline review comments with
`gh api --paginate "repos/$retro_repo/pulls/<number>/comments"`. Filter comments
and reviews by their timestamps within the retrospective window; an updated PR
can contain older feedback. If the query reaches the limit, page or narrow the
date range before claiming complete coverage. Report inaccessible sources or
authentication failures as coverage gaps, and continue with available evidence.

## Retro Workflow

1. Collect evidence
- What was shipped, fixed, or attempted
- Where time went (implementation, debugging, waiting, rework)

2. Spot patterns
- Repeated bug class (null handling, async races, off-by-one, schema mismatch)
- Repeated workflow friction (unclear requirements, weak tests, slow code reading)
- Repeated feedback theme (naming, API design, missing edge cases)

3. Find root causes
- Knowledge gap
- Process gap
- Tooling gap
- Habit/attention gap

4. Choose 1-3 experiments for next week
- Small, observable, and time-boxed
- Example: "Add test matrix before coding validators"
- Example: "Use root-cause template for every bug over 30 min"

5. Define success signals
- Fewer review comments of a type
- Faster bug time-to-root-cause
- Fewer regressions in changed modules

## Output Template

```markdown
## Weekly Coding Retro

### Wins
- ...

### Repeated Frictions / Mistakes
- Pattern:
- Evidence:
- Impact:

### Root Cause Hypotheses
- ...

### Next Week Experiments (1-3)
1. ...
2. ...

### Success Signals
- ...
```

## Quality Checklist

- Uses evidence from real work, not vibes only
- Focuses on repeated patterns
- Experiments are concrete and measurable
- Keeps improvement scope small for one week

## Example Triggers

- "Help me do a coding retrospective for this week"
- "Summarize my recurring engineering mistakes"
- "Turn review feedback into next-week practice goals"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
