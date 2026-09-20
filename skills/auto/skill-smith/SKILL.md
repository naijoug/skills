---
name: skill-smith
description: Fix an existing personal skill when usage reveals a misleading trigger, missing scenario, unclear instruction, or wrong output.
---

# Skill Smith

Improve an existing skill using the reported behavior and intended outcome. Keep
unrelated behavior intact; remove obsolete rules when they cause the problem.
For a new skill, use the repository's starter template or the available skill creator.

## Find the source

Identify the skill from the request or recent conversation. Ask only if the
missing target or expected behavior cannot be inferred and would change the fix.
Prefer the user's named repository. Otherwise locate the installed skill under
`.agents/skills`, `.codex/skills`, or `.claude/skills`, at project or user scope.
Resolve symlinks before editing. A copied installation does not automatically
update its source or other installations; report any required synchronization.

Read the target `SKILL.md` and metadata. Read references only when they govern the
behavior being changed. Preserve pre-existing work in those files.

## Make the correction

- Use the user's instructions and existing authorization within the host's rules.
  When the user asks for a fix, complete the authorized local edit and validation.
  When they ask only for a review or proposal, deliver that result.
- Ask only for a material missing decision or authorization for an action outside
  the agreed scope. Complete independent authorized work while it is unresolved.
- Keep useful operational constraints. Wording, section order, and output examples
  are defaults, not reasons to reject an explicitly requested simplification.
- Change trigger scope in `SKILL.md` description as well as relevant catalog
  metadata; keywords in `skill.yaml` alone do not control a host's skill selection.
- Keep substantial mode-specific or maintenance detail in conditional references.
  Do not add a universal rule for every individual failure.
- If a rule causes a pause, identify its file and exact instruction, and explain
  whether the pause is required by that instruction or is your interpretation.

## Complete and verify

Use a patch version for compatible fixes, and a minor version for new workflows
or intentional behavior changes. Keep `name` and `id` consistent. Update affected
routing examples when selection changes, including near misses.

Run the narrowest meaningful checks: metadata and links for structure, routing
cases for selection changes, and isolated functional tests for executable helpers.
A keyword dry-run or perfect predictor checks tooling, not model quality.

Report the changed behavior, source files and version, checks actually run, and
any remaining installation or verification limitation. Do not reinstall globally,
publish, or commit unless that action is part of the authorized task.

For selection changes, use [trigger examples](references/trigger-examples.md).
