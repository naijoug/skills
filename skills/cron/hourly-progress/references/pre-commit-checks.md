# Pre-commit Checks for Hourly Progress Runs

Use this page when a run has modified files and is ready to verify and commit. The goal is not to create a heavyweight release process; it is to catch the mistakes that commonly happen in autonomous hourly work.

## 1. Scope check

Run a status check in every repo you touched, plus `summaries/`:

```bash
git -C <repo> status --short
```

Confirm that every staged or unstaged path is either:

- created or modified by this run, or
- an already-existing unrelated change that will remain unstaged.

If a repo already had broad dirty state, prefer one of these patterns:

- choose a different clean repo;
- write only to an obviously isolated new path;
- stage explicit paths rather than using `git add .`.

## 2. Relative-path audit

Notebook entries and summary-style records must use workspace-relative paths such as `skills/skills/...` or `summaries/hermes/YYYY-MM-DD.md`.

Distinguish path semantics before copying commands into the notebook:

- **Notebook prose:** always use paths relative to the workspace root, for example `skills/skills/cron/hourly-progress/references/pre-commit-checks.md`.
- **`git -C <repo>` commands:** pathspecs are relative to that repo root, for example `git -C skills diff -- skills/cron/hourly-progress/references/pre-commit-checks.md`.
- **Cross-repo reports:** name both the repo and the workspace-relative file when useful, but do not write local absolute paths.

A quick audit pattern:

```bash
python3 - <<'PY'
from pathlib import Path
paths = [
    Path('summaries/hermes/YYYY-MM-DD.md'),
]
for path in paths:
    if not path.exists():
        continue
    text = path.read_text()
    # Fill this list with environment-specific absolute path markers for the host.
    forbidden = ['<absolute-home-marker-1>', '<absolute-home-marker-2>']
    hits = [item for item in forbidden if item in text]
    if hits:
        raise SystemExit(f'{path}: contains local absolute path markers {hits}')
print('relative-path audit passed')
PY
```

Adjust `YYYY-MM-DD` to the current notebook file before running.

## 3. Format and metadata check

Use the cheapest parser available for the file type changed:

- YAML: parse `skill.yaml` or frontmatter with Python/Ruby/Node if dependencies are available.
- Markdown: read back the rendered source sections and check headings, links, and code fences.
- Code: run the narrowest relevant test first; add lint/build only when cheap enough.

For a skill-only change, a minimal check is:

```bash
python3 - <<'PY'
from pathlib import Path
import yaml
meta = yaml.safe_load(Path('skills/skills/cron/hourly-progress/skill.yaml').read_text())
assert meta['id'] == 'hourly-progress'
print('skill metadata ok')
PY
```

If `yaml` is unavailable, use a small text assertion instead of installing dependencies during a short cron run.

## 4. Commit boundary check

Before committing, inspect the exact diff that will be included:

```bash
git -C <repo> diff -- <paths>
git -C <repo> diff --cached
```

Commit the work repo and `summaries/` separately. This keeps the durable notebook from being coupled to project changes and makes it easier to revert either side.

## 5. Handoff check

The notebook entry should leave one concrete next action, not a vague intention. For a fuller review rubric, use `references/handoff-quality-checklist.md` before staging the notebook.

A good handoff names:

- the preferred repo or path;
- the next small slice;
- the first verification command or review standard;
- any boundary condition that would make the next run choose a different target.
