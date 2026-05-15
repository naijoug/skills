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

## Commands worth running

```bash
# Workspace-level overview: repo names plus short status.
for d in */; do
  if [ -d "$d/.git" ]; then
    printf '%s\n' "${d%/}"
    git -C "$d" status --short
  fi
done

# Explicit-path staging for a dirty repo.
git -C <repo> add -- <path-created-or-edited-this-run>
git -C <repo> diff --cached -- <path-created-or-edited-this-run>
```

## Selection sentence template

Use a concrete sentence in the notebook:

> Because `docs`/`books`/`loom` have broad existing changes and `skills` is clean, this run chooses `skills/skills/...` to create one reusable reference; this avoids mixing unrelated work while still building a durable asset.

## Handoff standard

A good handoff after avoiding dirty repos names the next safe re-entry point:

- preferred repo/path;
- first status command to rerun;
- one smallest next slice;
- verification command or human-review criterion.
