---
name: ng-review-bounded-probe-before-workaround
description: Use when a handoff, release check, CI note, or agent log says a command might hang, fail intermittently, or need a workaround, and you need to verify the suspicion before changing scripts
---

# Bounded Probe Before Workaround

## Overview

Turn a suspected tool failure into a small, time-bounded, side-effect-safe probe before writing a wrapper, timeout, or workaround.

Core principle: treat a prior note like “may hang” or “might need `CI=true`” as a hypothesis, not as a confirmed bug. First collect real command output, exit status, time boundary, and environment notes. Only add a workaround after the failure is reproduced and the workaround is the smallest verified fix.

## When to Use

- A previous agent handoff mentions `hangs`, `does not exit`, `flaky`, `needs timeout`, `try CI=true`, or similar uncertainty.
- The candidate command is read-only or has a safe dry-run/check mode, such as type checking, linting, `--check`, `--dry-run`, contract tests, or local preflight.
- You are deciding whether to modify scripts, CI config, release workflow, or documentation because of an unconfirmed failure.
- The workspace has dirty files and you need a narrow action that will not absorb unrelated changes.

## When Not to Use

- The command deploys, uploads, publishes, deletes, migrates production data, or needs user authorization that is not present.
- The failure is already reproduced in this same environment with current output and exit status.
- The user explicitly asked for the workaround and accepted the behavior change.
- The only available probe would require changing unrelated dirty files first.

## Procedure

1. **Extract the hypothesis.**
   - Quote the suspected behavior in one sentence.
   - Separate `observed fact` from `inference` and `next idea`.
   - Example: `Hypothesis: non-CI wrangler types --check might print success and keep running.`

2. **Snapshot ownership and risk.**
   - Run the narrowest `git status --short` for the repo you might touch.
   - Name pre-existing dirty paths that you will avoid.
   - Confirm the probe is local/read-only/dry-run; otherwise stop and request authorization in the handoff.

3. **Run the original command under an outer time boundary.**
   - Do not change scripts yet.
   - Prefer the exact command from the handoff.
   - Use a timeout long enough for normal completion but short enough to prevent an unattended cron from hanging.
   - Capture exit code, key output, and whether the outer timeout fired.

4. **Classify the result.**

| Probe result | Classification | Action |
| --- | --- | --- |
| Command exits 0 inside the boundary | `dismissed for now` | Do not add workaround; record a green baseline and switch to higher-value work |
| Command exits non-zero with a clear error | `confirmed failure` | Fix the root cause or document required env; do not call it a hang |
| Outer timeout fires | `confirmed hang/timeout` | Run one minimal variable probe before editing scripts |
| Command needs credentials or production access | `unsafe to probe` | Stop; write an authorization/preflight checklist instead |

5. **If the issue reproduces, vary only one factor.**
   - Examples: `CI=true`, pinned tool version, disabled watch mode, offline fixture, clean cache, or shorter input.
   - Record which factor changed the result.
   - Avoid broad wrappers until the smallest effective condition is known.

6. **Patch only after evidence supports it.**
   - If `CI=true` fixes a CI-only command, patch CI docs/config rather than every local script.
   - If the tool has a known watch mode, switch to the documented check/no-watch flag.
   - If no variable helps, add a timeout wrapper only around the specific risky command and keep the failure output visible.

7. **Write a handoff receipt.**
   - Include `Hypothesis`, `Probe`, `Result`, `Decision`, `Owned files`, `Avoided files`, and `Next safe command`.
   - Use repo-relative paths only.
   - Label the claim as `confirmed`, `dismissed for now`, or `unknown`.

## Output Template

```markdown
## Bounded Probe Result

- Hypothesis:
- Safety boundary:
- Owned scope:
- Avoided dirty paths:
- Probe command:
- Time boundary:
- Exit status:
- Key output:
- Classification: confirmed / dismissed for now / unknown / unsafe to probe
- Decision:
- Patch made: yes / no
- Next safe command:
```

## Example

```markdown
## Bounded Probe Result

- Hypothesis: non-CI `wrangler types --check` might print success and not exit.
- Safety boundary: local type generation check; no deploy/upload/write outside generated type check.
- Owned scope: none; read-only probe.
- Avoided dirty paths: `docs/AGENTS.md`, `books/...`, `skills/...` are unrelated pre-existing dirty paths.
- Probe command: `pnpm --dir backend types:check`
- Time boundary: 60 seconds outer command timeout.
- Exit status: 0.
- Key output: `Types at src/worker-configuration.d.ts are up to date.`
- Classification: dismissed for now.
- Decision: do not add a timeout wrapper; record the green baseline and move to release preflight docs.
- Patch made: no.
- Next safe command: inspect release runner env docs or run the existing preflight in strict dry mode.
```

## Quality Checklist

- The report distinguishes hypothesis from confirmed failure.
- The probe uses the original command before any workaround is introduced.
- The time boundary and exit status are recorded.
- Any variable probe changes only one factor.
- Side-effecting release/deploy/upload commands are not run without authorization.
- The final decision says whether the suspected bug is `confirmed`, `dismissed for now`, `unknown`, or `unsafe to probe`.
- Handoff and docs use repo-relative paths only.

## References

- Trigger examples: `references/trigger-examples.md`
- Source method card: `docs/documents/trending/ai/bounded-probe-before-workaround.md`
- Related command ladder skill: `skills/skills/manual/review/next-safe-command-ladder/`
- Related handoff receipt skill: `skills/skills/manual/review/handoff-receipt/`
