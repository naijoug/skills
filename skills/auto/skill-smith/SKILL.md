---
name: skill-smith
description: Use when an existing personal skill (SKILL.md) needs a targeted fix — missing scenario, ambiguous wording, wrong output format, bad trigger, or workflow gap — based on real usage feedback
---

# Skill Smith

## Overview

A skill prompt blacksmith — when a user discovers that a personal skill (SKILL.md) is incomplete, ambiguous, or missing a scenario during real-world usage, help them forge improvements in place. Since skills are installed via symlinks, edits propagate to all AI tools automatically.

Core principle: small, precise improvements driven by real usage context — never rewrite from scratch.

## When to Use

- A skill just produced unexpected or low-quality output
- A skill is missing handling for a scenario the user just encountered
- A skill's instructions are ambiguous, causing the AI to misinterpret intent
- The user wants to add a new output format, workflow step, or quality check to a skill
- The user wants to refine trigger conditions for better skill activation

## When Not to Use

- The user wants to create a brand-new skill from scratch (use `example` template instead)
- The user wants to delete a skill entirely
- The problem is not with the skill prompt but with the AI model's general capability

## Smithing Workflow

### Step 1: Identify the Target Skill

Ask the user which skill needs improvement. Use one of these approaches:

1. **User specifies directly**: "improve the `pr` skill"
2. **Infer from context**: If the user just used a skill and says "this isn't right", check the most recently triggered skill in the conversation
3. **Search by keyword**: If the user describes the problem, search installed skills directories to find the matching skill

### Step 2: Locate the Skill File

Search for the skill's SKILL.md in these locations (in order):

**Global installations:**
- `~/.claude/skills/<skill-name>/SKILL.md`
- `~/.codex/skills/<skill-name>/SKILL.md`
- `~/.agents/skills/<skill-name>/SKILL.md`

**Project-level installations:**
- `.claude/skills/<skill-name>/SKILL.md`
- `.codex/skills/<skill-name>/SKILL.md`
- `.agents/skills/<skill-name>/SKILL.md`

If the found path is a symlink, resolve it to the actual source path. **Always edit the resolved source path** to ensure changes propagate everywhere.
- macOS: `readlink -f <path>` (requires `brew install coreutils` for GNU readlink) or use `ls -la` to read the symlink target manually
- Linux: `readlink -f <path>`

### Step 3: Analyze Current Content

Read the full SKILL.md and any accompanying files:
- `SKILL.md` — the main prompt definition
- `skill.yaml` — metadata (version, tags, triggers, compatibility)
- `references/trigger-examples.md` — trigger evaluation examples (if exists)

Understand:
- The skill's intended purpose and scope
- Its current section structure (Overview, When to Use, Workflow, Output, Quality Checklist, etc.)
- Its style and tone (concise vs detailed, English vs bilingual)
- Any existing quality checklist items

### Step 4: Collect Improvement Context

Ask the user to describe:

1. **What happened?** — What was the skill's actual output or behavior?
2. **What was expected?** — What should the skill have produced instead?
3. **What scenario?** — What was the specific context (project type, input data, task at hand)?
4. **What category?** — Help classify the issue:

| Category | Description | Typical Fix |
|----------|-------------|-------------|
| Missing Scenario | Skill doesn't handle a valid use case | Add to "When to Use" + add workflow branch |
| Ambiguous Instruction | AI interprets the prompt differently than intended | Reword for clarity, add explicit constraints |
| Wrong Output Format | Output structure doesn't match needs | Add/modify Output Template section |
| Workflow Gap | Missing or wrong step in the workflow | Insert/reorder workflow steps |
| Quality Blind Spot | Output passes current checks but has issues | Add Quality Checklist items |
| Trigger Mismatch | Skill activates (or doesn't) at wrong times | Refine triggers in skill.yaml |
| Over-Engineering | Skill adds unnecessary complexity | Simplify instructions, remove excessive detail |

### Step 5: Design the Improvement

Based on the analysis, propose specific changes in this form, then wait for user confirmation:

- **Target:** `<skill-name>` (v`<current>`) at `<resolved-path>`
- **Category:** `<issue-category>`
- **Changes:** numbered list of `[Section] what to change and why`
- **Impact:** what this fixes without breaking

### Step 6: Apply the Changes

Edit the SKILL.md with surgical precision:
- **Add** new content that matches the existing style and tone
- **Modify** existing content with minimal changes
- **Never** restructure the entire file — only touch what needs fixing
- **Preserve** all existing formatting, indentation, and section ordering
- If adding a new section, place it logically among existing sections

### Step 7: Update Metadata

If `skill.yaml` exists:
- Bump the **patch** version (e.g., 1.0.0 → 1.0.1)
- Add new trigger keywords if the change involves trigger refinement
- Update tags if the skill's scope has expanded

If `references/trigger-examples.md` exists and trigger behavior changed:
- Add new trigger examples covering the improved scenarios

### Step 8: Verify

After applying changes, report:

- **Skill** + version bump (`<old>` → `<new>`)
- **Files modified** (list paths)
- **Re-trigger phrase** to verify the improvement, e.g. *"<example trigger>"*

## Quality Checklist

- Change addresses the specific issue the user reported (evidence-based, traceable to real usage)
- Modification scope is minimal — fix only what's broken, don't rewrite unrelated parts
- New content matches existing style/tone (bullets stay bullets, tables stay tables)
- SKILL.md section structure is preserved; existing valid triggers still fire
- Only one issue category addressed per iteration — don't bundle unrelated fixes
- Version bumped in `skill.yaml` (patch for fixes, minor for new sections/triggers)

## Example Triggers

- "这个 skill 输出不太对，帮我改进一下"
- "pr skill 缺少对 monorepo 的处理"
- "刚才那个 skill 理解错了我的意图，需要修正"
- "Help me improve the daily-trending skill, it's missing source categories"
- "The weekly-retro skill needs a better output format"
- "Fix the engineering skill — it gives answers too quickly in algorithm mode"

## References

- Trigger examples for recall/precision testing: `references/trigger-examples.md`
