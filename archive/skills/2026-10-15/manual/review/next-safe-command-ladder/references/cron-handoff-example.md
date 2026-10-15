# Cron Handoff Example

Use this example when a scheduled agent must choose the next verifiable slice without taking over unrelated dirty worktree changes.

## Scenario

```text
Change type: scheduled agent handoff and small repo maintenance task
Known context: workspace root is not a git repo; subrepos have mixed states. `docs/` is clean, `skills/` has pre-existing dirty files under `skills/manual/tool/debug-loom/`, and `loom/` has unrelated dirty paths.
Main risk: the agent either does nothing but write a notebook entry, or accidentally stages pre-existing dirty work while trying to prove progress.
Current evidence: `git status --short` was captured for each candidate repo before choosing the slice.
```

## Next Safe Command Ladder

| Step | Command / check | Why this first | Pass means | Fail means |
| --- | --- | --- | --- | --- |
| 1 | `for d in books docs skills loom summaries; do git -C "$d" status --short; done` | ownership must be known before any write | candidate repos and avoided dirty paths are visible | stop and record the unknown status before editing |
| 2 | choose only a clean repo, or a path disjoint from known dirty files | prevents accidental takeover of another task | the slice has an owned path boundary | switch to read-only triage if no safe path exists |
| 3 | run the smallest checker for the touched artifact, for example `git -C docs diff --check -- <paths>` plus a catalog/link proof | proves this slice without broad side effects | the artifact is locally reviewable | narrow to the touched files before any commit |
| 4 | `git -C <repo> diff --cached --name-status` before commit | final guard against mixed staging | commit scope contains only owned paths | unstage unrelated paths and re-run the check |

## Escalation

- If step 1 shows the target repo is clean, a small edit may proceed.
- If the repo is dirty but the target path is disjoint and clearly owned by this run, proceed only with path-limited staging.
- Escalate to heavier tests or builds only after the path-limited checker proves the local artifact.

## Stop Conditions

- The only available changes would touch pre-existing dirty paths.
- The checker requires credentials, destructive services, or broad environment setup unrelated to this slice.
- `diff --cached --name-status` includes files outside the owned path list.

## Review Note Shape

```markdown
Selected slice: <repo/path>
Owned paths: <paths changed in this run>
Avoided paths: <pre-existing dirty paths>
Proof: <smallest checker output>
Next safe command: <first command for the next scheduled run>
Continue / Narrow / Stop: <decision>
```

This ladder is especially useful for cron-style work: the proof is not that the notebook is updated, but that the agent chose a bounded slice, changed only owned files, and left the next owner a command that can be run safely.
