# Planning Execution Verification Loop

Use this reference when a cron run has several possible directions and risks becoming either a notebook-only report or an unbounded project edit. It turns the high-level loop from `docs/documents/trending/ai/agent-cron-planning-execution-verification-loop.md` into an executable checklist inside the skill.

## Loop contract

Every run must produce one of two honest outcomes:

1. **Verified slice:** a small asset or code change with a focused proof and, when appropriate, a target repo commit.
2. **No safe slice:** a notebook entry that explains the blocking condition, the exact next discovery step, and why no project files were changed.

Do not treat the notebook itself as the project outcome unless the selected task is explicitly to update the notebook or worklog structure.

## Four planning questions

Before editing, answer these in the notebook draft or working notes:

| Question | Required answer | Reject if |
| --- | --- | --- |
| Previous/current state | Last handoff, startup dirty paths, clean candidate repos, known verification blockers | It only says “continue work” without naming paths |
| Candidate work | At least two plausible candidates or one candidate plus why alternatives are unsafe | It ignores a clear previous handoff without explanation |
| Selection | One cadence-sized slice with target path(s) | It spans multiple repos without a commit boundary plan |
| Next plan | First file/command/decision gate for the next run | It is a vague theme such as “optimize more” |

## Execution budget

Use this default order unless the user gave a stricter priority:

1. **Continue a clean handoff** if the target repo is clean or the needed path is not startup-dirty.
2. **Shrink the handoff** when the suggested task is too large but a smaller same-direction slice is verifiable.
3. **Switch to an asset** when repeated worklog signals should become a doc, skill reference, checklist, test, or script.
4. **Stop and record a blocker** when all candidate paths are dirty, unclear, destructive, or unverifiable.

For quarter-hour or short cadence runs, prefer one file plus one discoverability link or one test assertion. For longer runs, widen only after the focused proof passes.

## Verification minimums

A completed slice needs all of these before commit or final report:

- **Readback:** reread the touched section or generated output that proves the content exists.
- **Whitespace/path check:** run `git diff --check -- <touched-paths>` in the target repo, and search touched Markdown for local absolute path markers when relevant.
- **Behavior or structure check:** run the nearest test, parser, catalog check, or link/index inspection for the changed surface.
- **Staged boundary check:** stage explicit paths only; inspect `git diff --cached -- <touched-paths>` before committing.
- **Hash readback:** after commit, read back `git rev-parse --short HEAD` or `git log -1 --oneline` before writing the notebook hash.

If a broad check is killed, times out, or is polluted by pre-existing dirty state, record the failure and substitute the closest focused check. Do not claim the broad surface is green.

## Commit boundary

When target and notebook both change:

1. Commit target repo first with only target paths from this run.
2. Append/update `summaries/hermes/YYYY-MM-DD.md` with the real target commit hash.
3. Commit only that Hermes notebook path inside `summaries/`.
4. Leave other agents' summaries and startup-dirty files unstaged unless the user explicitly asked to take them over.

## Handoff shape

End each run with a next slice that is executable without rereading the whole day:

```text
Next path: <relative path>
Next slice: <first small edit or command>
Decision gate: <condition to continue, shrink, or switch>
Boundary condition: <dirty state, failed check, or external signal that stops this path>
Verification: <focused command for that next slice>
```

## Related references

- Notebook template: `skills/skills/cron/hourly-progress/references/notebook-template.md`
- Verification matrix: `skills/skills/cron/hourly-progress/references/verification-command-matrix.md`
- Worklog extraction gate: `skills/skills/cron/hourly-progress/references/worklog-asset-extraction.md`
- Human-readable docs card: `docs/documents/trending/ai/agent-cron-planning-execution-verification-loop.md`
