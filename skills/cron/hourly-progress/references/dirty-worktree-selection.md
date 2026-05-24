# Dirty Worktree Safe Selection

Use this reference when an hourly progress run starts in a multi-repo workspace where several repositories already contain unrelated edits. The goal is to keep making progress without accidentally owning, overwriting, or committing someone else's work.

## Decision ladder

1. **Prefer a clean repo with a concrete handoff.**
   - Best case: previous notebook names a next slice and the repo is clean.
   - Action: execute the smallest verifiable slice and commit that repo separately from `summaries/`.
2. **Use a clean asset repo when product repos are dirty.**
   - Good targets: `skills/skills/...`, an isolated doc page, a small test-only addition.
   - Action: create one durable asset that improves future runs or developer leverage.
3. **Touch a dirty repo only with an isolated path boundary.**
   - Acceptable: a clearly new file under a new path, or a test file that does not overlap existing modified files.
   - Required: stage explicit paths; never use `git add .`.
4. **Notebook-only is a last resort.**
   - Use only when every useful action would require human clarification or risks mixing work.
   - The notebook must explain the risk and leave a concrete next check.

## Red flags that should change the selection

- The target repo has many modified, deleted, renamed, or untracked files and the intended task touches nearby paths.
- The existing changes include generated files or build outputs whose provenance is unclear.
- A broad command such as formatter, migration, package install, or build could rewrite unrelated files.
- The task needs assumptions about product direction, credentials, deployment, or irreversible side effects.
- Verification would require staging or running against files that are already in an unknown state.

## Safe patterns

### Pattern A: Clean skill repo, dirty docs/books

Choose a reusable skill/reference if the recurring workflow pain is visible. This compounds process value while avoiding manuscript or documentation merge risk.

Checklist:

- `git -C skills status --short` is empty before editing.
- The new file lives under `skills/skills/...`.
- `SKILL.md` or an existing reference links to it if discoverability matters.
- Verification includes readback and a metadata/path audit.

### Pattern B: Clean product repo, dirty workspace neighbors

Continue the product repo only if its own status is clean. Other dirty repos in the workspace do not block the work, but they do require explicit repo-scoped commands.

Checklist:

- Use `git -C <repo> ...` or set the command workdir to the repo.
- Run focused tests before broader lint/build.
- Commit only product files in that repo.
- Commit `summaries/` in a separate commit.

### Pattern C: Dirty target repo, isolated new file

Proceed only when the file path is obviously independent from existing changes, for example adding a new note under a dated plan directory.

Checklist:

- Capture pre-edit `git status --short`.
- After editing, compare status and identify exactly which path is new from this run.
- Stage with `git add -- <exact-path>`.
- Inspect `git diff --cached -- <exact-path>` before committing.

### Pattern D: Pre-existing untracked handoff file

Sometimes a run starts with an untracked file that looks like the previous handoff's next slice.
Treat it as unknown ownership until proven otherwise; a cron run should not silently claim it
just because it is useful.

Decision gate:

1. **Adopt only when provenance is clear.** Acceptable signals include: the previous notebook
   explicitly says the prior run created or intentionally left this exact path; the file has a
   matching commit attempt recorded in the notebook; or the current run itself created the file
   after the pre-edit status snapshot.
2. **If provenance is unclear, do not modify or commit it.** Prefer a clean repo/asset task
   instead, and mention the orphaned path in the notebook as a re-entry risk.
3. **If adoption is justified, verify before staging.** Run the narrowest focused test/check for
   that file, inspect the diff, and commit with an explicit message that matches the recovered
   slice.
4. **Never use broad formatting or `git add .` around orphaned files.** Broad commands can
   rewrite or stage unrelated work and make provenance impossible to audit.

Checklist:

- Record the pre-run status containing the untracked path.
- Read the file and the previous notebook entry before deciding.
- If not adopting, leave it untouched and choose another task.
- If adopting, stage only that path and include the reason in the notebook.

### Pattern E: Pre-existing tracked diff matches the previous handoff

A dirty tracked file can look like the obvious continuation from the previous notebook. Do not
assume it is yours. A tracked diff may have been produced by another agent, a human editor, or a
failed run, and committing it would make the final report indistinguishable from actual work done
in this run.

Decision gate:

1. **Read the diff before selecting the slice.** If the diff already implements the named handoff,
   the useful action is no longer "write it"; the decision is whether to adopt, verify, or avoid it.
2. **Adopt only with evidence.** Acceptable evidence includes a same-run edit, a prior notebook
   entry that explicitly says the file was left uncommitted, or an instruction to finish and commit
   that exact path. A vague next-step note is not enough.
3. **If not adopting, choose another clean target.** Record that the handoff appears already present
   but has unclear provenance. Do not modify the same tracked file just to make the diff "partly
   yours".
4. **If adopting, report it as adoption.** Verify the existing diff, stage only that path, and state
   that the run adopted and validated pre-existing work rather than authored it from scratch.

Checklist:

- Capture pre-edit status and a focused `git diff -- <path>` excerpt.
- Decide whether the diff is same-run, explicitly recoverable, or unknown provenance.
- If unknown, leave the file untouched and move to a clean repo or isolated new file.
- If recoverable, run focused validation before staging and commit only that path.

## Commands worth running

```bash
# Workspace-level overview: repo names plus short status.
for d in */; do
  if [ -d "$d/.git" ]; then
    printf '%s\n' "${d%/}"
    git -C "$d" status --short
  fi
done

# Inspect a suspicious continuation diff before choosing the task.
git -C <repo> diff -- <path-that-matches-handoff>

# Explicit-path staging for a dirty repo.
git -C <repo> add -- <path-created-or-edited-this-run>
git -C <repo> diff --cached -- <path-created-or-edited-this-run>
```

## Avoiding a process-only loop

A clean `skills` repo is a good fallback, but it should not become an infinite substitute for product, writing, or learning work. After two or more consecutive process-only improvements, add an explicit re-entry gate to the notebook:

- **Resume condition:** which dirty repo must become clean, or which isolated path can be safely edited without adopting existing changes.
- **Value target:** the product, book, tutorial, experiment, or income-facing asset that should take priority once the boundary is safe.
- **Fallback limit:** whether the next run may still edit `skills`, or should prefer a notebook-only blocker over another process tweak.

Use another `skills/skills/...` improvement only when it removes a concrete recurring failure mode for future runs. If the improvement is merely cosmetic, stop and record the dirty-repo blocker instead.

## Selection sentence template

Use a concrete sentence in the notebook:

> Because `docs`/`books`/`loom` have broad existing changes and `skills` is clean, this run chooses `skills/skills/...` to create one reusable reference; this avoids mixing unrelated work while still building a durable asset. Since several recent runs have already improved process references, the next handoff names the exact condition for returning to product or writing work.

## Handoff standard

A good handoff after avoiding dirty repos names the next safe re-entry point:

- preferred repo/path;
- first status command to rerun;
- one smallest next slice;
- verification command or human-review criterion.
