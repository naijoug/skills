# Candidate Selection Examples

Use these examples when an hourly run has multiple possible directions and must choose one safe, valuable slice without mixing unrelated work.

## Quick Triage Matrix

| Candidate | Choose when | Avoid when | Verification |
| --- | --- | --- | --- |
| Continue a clean code repo task | The repo is clean or only this run will touch clearly isolated files; tests/build are cheap | The repo has broad unrelated dirty files or no obvious test path | Focused tests, lint, build, diff review |
| Add a reusable skill | The workflow has repeated prompts or recurring friction; `skills` is clean | The content is just a one-off note with no reuse trigger | YAML parse, readback, path audit |
| Write docs/tutorial page | The target repo is clean or the new file is isolated; topic is evergreen | Existing docs repo has wide unrelated changes that make commit boundaries risky | Frontmatter check, link/path review, build if cheap |
| Advance a book chapter | The chapter structure is already chosen and the text can be completed as one coherent slice | The book repo has uncommitted manuscript edits from another thread | Readback, outline consistency, relative path audit |
| Scan trends | A concrete decision or asset will be produced immediately | The output would be only news clipping | Convert into a plan, doc, experiment, or backlog item |
| Notebook only | No safe project edit exists, or all candidates require human clarification | There is any clear low-risk, verifiable task | Notebook entry explains why no project edit was safe |

## Example 1: Dirty Docs, Clean Skills

**Observed state**

- `docs` has dozens of modified/deleted/untracked files from existing work.
- `skills` is clean.
- The last notebook identifies a recurring workflow gap.

**Decision**

Choose a small `skills/skills/...` addition instead of writing into `docs`.

**Why**

The skill creates reusable process value and has a clean commit boundary. Writing into `docs` might be valuable, but broad existing changes make it easy to stage someone else's work by mistake.

**Good slice**

- Add one `SKILL.md`, one `skill.yaml`, or one reference page.
- Validate metadata and check that no local absolute paths were written.
- Commit only the new skill files.

## Example 2: Clean Product Repo With a Follow-up From Last Hour

**Observed state**

- A product repo is clean.
- The previous run added search behavior and left a concrete UI follow-up.
- There are focused unit tests already covering the touched utility.

**Decision**

Continue the product repo and implement the smallest UI or utility improvement.

**Why**

This compounds recent context and can be verified with existing tests. The notebook records the result, but the product change is the real output.

**Good slice**

- Touch only the utility/component/test files needed for the follow-up.
- Run focused tests first, then lint/build if cheap.
- Commit the product repo separately from `summaries`.

## Example 3: Book Repo Has Existing Manuscript Edits

**Observed state**

- `books` contains modified chapters and untracked book directories.
- The user did not explicitly ask this run to continue those edits.
- A new chapter idea is tempting but would overlap the existing manuscript work.

**Decision**

Do not edit `books` this hour unless there is an isolated new draft under the correct `.drafts/` location and the commit can include only that file.

**Why**

Manuscript edits are hard to merge mentally. Preserving authorship and avoiding accidental staging is more important than producing another page.

**Good slice if still choosing books**

- Create a clearly named draft in `books/<book>/.drafts/...` rather than altering active chapters.
- Do not stage existing modified chapters.
- Validate by reading back the draft and checking `git status --short` paths.

## Example 4: Trend Scan Without Concrete Action

**Observed state**

- Web search returns several AI tool announcements.
- No repo has an obvious clean target.
- The findings are interesting but not immediately actionable.

**Decision**

Convert the scan into one small asset or decision, or skip the scan.

**Why**

Hourly progress should not become passive news summarization. Trend information is useful only if it changes a plan, creates an experiment, or updates durable docs.

**Good slice**

- Add one entry to a backlog/plan with source links and a validation hypothesis.
- Write a short tutorial section that turns the trend into a repeatable workflow.
- If neither is possible, record that trend scan was deferred and choose a local asset task.

## Example 5: Handoff Has a Decision Gate and Boundary Condition

**Observed state**

- `skills` is clean and the previous handoff points at `skills/skills/cron/hourly-progress/references/selection-examples.md`.
- The handoff says to add a decision-gate example only if existing examples are still too generic.
- `docs`, `books`, and `loom` still contain broad unrelated changes.

**Decision**

Update this reference with one explicit handoff example instead of switching to a noisier repo.

**Why**

The next slice is precise, isolated, and directly improves future hourly runs: a later agent can see how to write a handoff that includes the next path, the next slice, the decision gate, and the boundary condition.

**Good handoff produced by this run**

> Next run: inspect `skills/skills/cron/hourly-progress/references/selection-examples.md` and only add a new example if no existing example shows both a decision gate and a boundary condition; if already covered, switch to a clean product repo such as `bytebite`. Verify with readback/path audit and `git diff --check`.

**What makes it good**

- **Next path:** names the exact file to inspect or edit.
- **Next slice:** limits the work to one example, not a broad rewrite.
- **Decision gate:** says when to proceed versus stop.
- **Boundary condition:** says what to do if the file is already sufficient or other repos are dirty.
- **Verification:** names the cheapest checks that prove the change is reviewable.

## Example 6: Target Repo Is Dirty at Start Time

**Observed state**

- The previous handoff names `docs/documents/trending/ai/coding.md` as the likely next content slice.
- `git -C docs status --short` shows broad modified, deleted, renamed, and untracked files that were not created by this run.
- A clean repo such as `skills` has an isolated process-improvement follow-up, or no clean repo has an obviously useful edit.

**Decision**

Do not add another file to the dirty target repo just to keep momentum. Choose the best safe fallback:

1. If another repo is clean and has a concrete, verifiable slice, switch to that repo.
2. If only a tiny new file in the dirty repo would be truly isolated, proceed only when it will be the sole staged path and the notebook clearly explains the boundary.
3. If no safe edit exists, make a notebook-only blocker entry that records the dirty repo status pattern, the skipped target, and the exact condition needed before resuming.

**Why**

A dirty repo can hide other agents' work or the user's manual edits. The hourly run should preserve authorship and auditability instead of producing a low-confidence commit.

**Good fallback slices**

- Update a clean `skills/skills/...` reference that improves the next run's decision quality.
- Add an isolated `.drafts/` file only when the book repo rules allow it and no existing chapter edits are staged.
- Defer project edits and write a blocker in `summaries/hermes/YYYY-MM-DD.md` when every candidate would require mixing unrelated changes.

**Verification**

- Capture the dirty target with `git -C <repo> status --short` before choosing the fallback.
- Before commit, run `git -C <repo> diff --cached --name-only` and confirm staged paths are limited to this run.
- Read back the notebook entry and confirm it uses workspace-relative paths and names the resume condition.

## Example 7: Handoff Includes Verification Destination

**Observed state**

- The target repo is clean and the previous handoff names a specific reference file.
- `references/handoff-quality-checklist.md` now requires a verification destination from `references/verification-command-matrix.md`.
- The proposed next task is Markdown-only, so the next run should not overclaim runtime skill loading or site-wide rendering.

**Decision**

Write the handoff as an executable packet that includes the next path, first action, destination row, focused verification, fallback, and claim boundary.

**Why**

A command alone is not enough. Naming the destination row tells the next run what the verification can and cannot prove, which keeps notebook claims aligned with the actual check.

**Good handoff produced by this run**

> Next run: inspect `skills/skills/cron/hourly-progress/references/selection-examples.md` first; if `git -C skills status --short` is clean and no example already covers verification destinations, add one small example. Verification destination: `skills/skills/.../references/*.md` in `skills/skills/cron/hourly-progress/references/verification-command-matrix.md`; focused check: read back the new example plus `git -C skills diff --check -- skills/cron/hourly-progress/references/selection-examples.md`; claim boundary: this proves the reference is formatted, linked, and scoped, not runtime skill loading. Fallback: if the file is dirty in overlapping lines, do not edit it; switch to `books/tech-cards-handbook/chapters/ai-agent/README.md` index consistency or write a blocker-only notebook entry.

**What makes it good**

- **First action:** starts with one path and one status command.
- **Verification destination:** names the exact matrix row, not just a generic command.
- **Focused verification:** pairs readback with `git diff --check` for the touched reference.
- **Claim boundary:** states what the Markdown/reference row proves and what it does not prove.
- **Fallback:** avoids editing overlapping dirty lines and gives a concrete alternate path.

## Commit Boundary Checklist

Before committing, answer yes to all:

1. Did I inspect the target repo status before editing?
2. Are staged files limited to this run's intentional changes?
3. Does the notebook list only relative paths?
4. Is there a cheap verification result or human-review criterion?
5. Are project changes and `summaries` changes committed in their own repos?
