---
name: ng-meta-example
description: Create a repository skill with a precise trigger, useful completion criteria, and compatible metadata.
---

# Repository Skill Starter

Create a skill only for a reusable workflow that benefits from task-specific
guidance. Place it under `skills/manual/<group>/<name>`, `skills/auto/<name>`, or
`skills/cron/<name>` according to its intended activation.

## Define the result

Write a short description naming the concrete task and its distinguishing trigger.
Exclude a likely near miss when needed. State what the user receives and what
evidence makes the task complete. Include only inputs and constraints that affect
decisions; infer routine details from context rather than adding a standard interview.

## Choose the minimum useful structure

A short skill can be self-contained. For multiple substantial workflows, keep a
compact route selector in `SKILL.md` and put conditional details in references.
Do not duplicate instructions in the workflow, reference map and final checklist.
Preserve authorization and operational boundaries while allowing the agent to
choose routine implementation steps.

Keep `name` and `skill.yaml` `id` identical. Repository metadata requires `version`,
`title`, `summary`, `kind`, `tags`, `triggers.keywords` and `compatibility.tools`.
Manual skills also need this Codex policy in `agents/openai.yaml`:

```yaml
policy:
  allow_implicit_invocation: false
```

Add optional interface fields only when useful. Auto injection text should be
short; scheduled skills do not gain scheduling just by being installed.

## Validate the contract

Add realistic positive and near-miss prompts to `references/trigger-examples.md`.
Keep author notes outside the prompt and add explicit no-skill or redirect labels
when they are known. These fixtures support maintenance and are not compulsory
reads during ordinary execution.

Run `bash apps/scripts/skills-quality-check` from the repository root. Inspect
the result and report the created skill's scope, source files and checks. A perfect
predictor validates the scorer, not the quality of the new skill's decisions.

For this starter's selection boundary, see [trigger examples](references/trigger-examples.md).
