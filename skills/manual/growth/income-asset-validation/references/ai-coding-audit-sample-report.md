# AI Coding Audit Sample Report

This sample shows what a fixed-scope AI coding audit can deliver before any production code changes. It is written as a reusable example for the `AI Coding Audit Offer` in `skills/skills/manual/growth/income-asset-validation/SKILL.md`.

## Context

- **Buyer:** small documentation or developer-tools team adopting coding agents.
- **Repo type:** content-heavy docs site, static site generator, or lightweight frontend app.
- **Audit object:** one repository and one recent agent-assisted change.
- **Access mode:** read-only inspection of files, scripts, CI notes, recent final report, and local command list.
- **Promise:** identify workflow risks and propose the next safe verification ladder; no production code edits are included.

## Executive Summary

The repository is a good candidate for AI-assisted maintenance because its changes are usually small, reviewable, and backed by build commands. The main risk is not model capability; it is boundary control. Agent runs can accidentally mix existing dirty workspace changes, generated artifacts, and documentation edits unless the workflow forces an ownership snapshot before planning and a scoped diff before reporting.

Recommended next move: add a standard audit gate that every agent run must pass before editing, before committing, and before final reporting.

## Risk Findings

| Priority | Area | Evidence to Inspect | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| P0 | Dirty workspace safety | `git status --short` at startup and before commit | Existing user or agent changes may be mixed into a new commit | Require a startup ownership ledger: `pre-existing`, `touched this run`, `do not touch` |
| P0 | Verification coverage | `package.json`, build scripts, docs build command, smoke scripts | Agent may report completion after only editing Markdown | Define a command ladder: syntax/link check first, site build second, smoke test only if relevant |
| P1 | Handoff quality | final reports, notebook entries, PR template | Reports can omit unverified files or skipped checks | Add required fields: changed files, commands run, exit codes, skipped checks, next owner |
| P1 | Generated artifacts | lockfiles, build output, screenshots, design exports | Generated files can be committed without intent | Maintain an allowlist of generated files and require explicit rationale for each |
| P2 | Productization fit | repeated agent failures, review comments, support requests | The workflow may be useful but not yet worth a paid tool | Start with a paid/manual audit; automate only repeated checklist items |

## Next Safe Command Ladder

Use the smallest command that proves the current change class:

```bash
# 1. Establish boundary before any edit
git status --short

# 2. Inspect the exact paths touched by the run
git diff -- path/to/changed-file.md

# 3. Run the cheapest relevant validation first
# Example for docs content:
cd docs/web/vuepress && npx -y pnpm@8.15.9 run docs:build

# 4. Confirm the staged set is scoped before commit
git diff --cached --name-status
```

If the build is too expensive for every small content edit, record the reason and use a lower-cost substitute such as frontmatter inspection, markdown linting, link sampling, or a targeted local render check. Do not silently replace verification with confidence.

## One-Page Fix Plan

### Fix 1: Startup Ownership Snapshot

Every run begins by writing a three-column snapshot:

| Path | State at startup | Ownership decision |
| --- | --- | --- |
| `docs/...` | clean / modified / untracked | editable / avoid / inspect only |
| `skills/...` | clean / modified / untracked | editable / avoid / inspect only |
| `summaries/...` | clean / modified / untracked | append only / avoid older dirty files |

### Fix 2: Scope-Locked Planning

Before editing, the agent states:

- chosen repo;
- exact file family to touch;
- files explicitly excluded because they were dirty before the run;
- validation command expected to prove the change.

### Fix 3: Evidence-First Final Report

Final report must include:

- changed files;
- commit hash if committed;
- exact validation command and result;
- skipped checks with reason;
- next safe handoff point.

### Fix 4: Repeatable Audit Template

Package the above into a paid/manual service:

- 60-90 minute read-only review;
- 1-page report;
- 5 prioritized fixes;
- command ladder;
- one reusable template customized to the buyer.

## Validation Metric for the Offer

Continue this offer if a buyer asks for one of these follow-up actions:

- implement the ownership snapshot in their agent workflow;
- audit a second repo;
- convert the findings into a team checklist or onboarding guide;
- run the same audit after a failed agent session.

Narrow the offer if buyers only care about one slice, such as docs-build verification or dirty-workspace commit safety. Stop if they want generic AI tooling advice but will not share a real repo, command list, or failed workflow sample.

## Reusable Delivery Skeleton

```markdown
# AI Coding Audit Report: [Project]

## Scope
- Repo/workflow reviewed:
- Included:
- Excluded:
- Evidence inspected:

## Executive Summary

## Top Risks
| Priority | Risk | Evidence | Recommended fix |
| --- | --- | --- | --- |

## Verification Ladder
1.
2.
3.

## Handoff Template
- Changed/observed files:
- Commands run:
- Unverified items:
- Next owner action:

## Continue / Narrow / Stop
```
