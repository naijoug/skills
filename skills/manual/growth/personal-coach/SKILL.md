---
name: ng-growth-personal-coach
description: Use when the user asks about personal tech growth planning, skill assessment, daily/weekly/monthly practice recommendations, learning roadmap, or career development strategy
---

# Personal Growth Coach

Turn the user's growth goal and available time into useful practices with clear
completion criteria. Use the six pillars as a planning aid, not a mandatory
interview or an obligation to practice every technology.

## Scope and defaults

- Use for requested growth planning, assessment and practice recommendations.
  Answer ordinary coding questions or implementation requests directly.
- Reuse known goals, experience, technologies and time budget. Ask only for
  missing inputs that materially change the recommendation.
- Match the user's current focus. A one-off daily recommendation does not require
  a persistent roadmap, a six-pillar self-assessment or unrelated languages.
- Use `~/.personal-growth/growth-roadmap.md` for established tracking unless the
  user specifies another location. A missing file does not block a one-off answer.
- Update state only for actual plan changes or confirmed progress when tracking
  is requested or already established. Recommendations are not completed work.

## Select one mode

Load only the reference matching the request:

| Request | Reference |
| --- | --- |
| Set up a persistent growth roadmap | [Setup](references/setup.md) |
| Choose today's practice | [Daily](references/daily.md) |
| Review the week or plan next week | [Weekly](references/weekly.md) |
| Plan a monthly deep dive | [Monthly](references/monthly.md) |
| Compare quarterly abilities and milestones | [Quarterly](references/quarterly.md) |
| Plan annual goals and technical direction | [Yearly](references/yearly.md) |

Use the mode indicated by the goal and time horizon; ask only if a material
ambiguity remains. A missing state file does not override the requested mode.

## Planning framework

### Six Pillars

| Code | Pillar | Core Objective |
|------|--------|----------------|
| P1 | Code Craft | Write elegant, efficient, secure code |
| P2 | Architecture & System Design | Design thinking from components to systems |
| P3 | AI-Era Skills | Master AI tools, build AI applications |
| P4 | Engineering Practice | Professional engineering habits and processes |
| P5 | Vision & Learning | Continuous learning, stay technically sharp |
| P6 | Soft Skills & Leadership | Communication, influence, tech leadership |

### Five Frequencies

| Frequency | Time | Purpose |
|-----------|------|---------|
| Daily | 15-30 min | Micro-practice, build muscle memory |
| Weekly | 1-2 hours | Focused training, establish rhythm |
| Monthly | Half-day | Deep learning, break through plateaus |
| Quarterly | 1-2 days | Phase assessment, direction adjustment |
| Yearly | 1-2 days | Strategic planning, big picture review |

## Practice selection and completion

Prioritize the user's stated goal and largest supported gap. Rotate practices
when variety improves learning; respect a focused goal and the available time
instead of enforcing fixed percentages or coverage of every pillar.

For concrete exercises, read [practice catalog](references/practice-catalog.md).
These are suggested activities, not instructions to invoke other skills. Load a
matching practice skill only when the user asks to start that session.

For new or changed persistent state, read [state format](references/state-format.md).
Preserve existing history and distinguish self-ratings from observed results.

Deliver the requested recommendation or plan with concrete steps, estimated time,
completion criteria and evidence limits. Report state changes only when made.
Do not invent completion rates or trends when logs are missing.

For routing maintenance, see [trigger examples](references/trigger-examples.md).
