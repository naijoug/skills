# Verification Command Matrix

Use this reference after choosing the hourly slice and before committing. The goal is to pick the cheapest check that can catch the most likely failure for the type of work done, then record that check in `summaries/hermes/YYYY-MM-DD.md`.

## Selection rule

Start narrow, then widen only when the change can affect broader behavior.

1. **Focused check first:** validate the exact file, test, link, or command touched this run.
2. **Structural check second:** validate metadata, formatting, generated navigation, or imports when relevant.
3. **Broad check last:** run full test/lint/build only when cheap enough or when the slice could break shared behavior.
4. **Record limitations:** if a broad check is skipped because the repo is already dirty or the command is expensive, write the reason and the next safest check.

## Matrix

| Work type | Focused check | Structural check | Broader check | When to stop |
| --- | --- | --- | --- | --- |
| Markdown note or tutorial | Read back the changed section; check heading order and links by inspection | `git diff --check -- <path>`; optional Markdown linter if already configured | Site/docs build if the page affects navigation or generated sidebar | Stop after readback + diff check for isolated prose with no generated nav |
| Book manuscript | Read back the new/edited chapter section; confirm it belongs in `chapters/`, `.drafts/`, or `resources/` as intended | Search for forbidden absolute paths and broken relative references | Book/site build only if the repo has one and the change touches published structure | Stop after readback when prose is self-contained and repo has no build |
| Skill or reference | Read back `SKILL.md` plus the new reference; confirm discoverability link exists | Parse or text-check frontmatter/`skill.yaml`; audit relative paths | Run repository test/lint only if skill tooling exists | Stop after metadata + path audit for pure Markdown skills |
| Unit or component test | Run the new or changed test file only | Run formatter/lint on touched files | Run full test suite; add build if type coverage matters | Stop after focused test only when the repo is large and the slice is isolated; otherwise widen to full test |
| Product code | Run the narrowest test that exercises the changed behavior | Run lint/typecheck for touched language | Run full test/build before commit when cheap enough | Do not stop at readback only; code needs executable verification |
| Refactor with no intended behavior change | Run tests around every touched module | Run formatter/lint/typecheck | Run full test suite/build when feasible | Stop only after a check that could detect import/type/runtime regressions |
| Config/navigation change | Run parser or config load command if available | Build generated docs/site/sidebar | Smoke open or inspect generated output path | Stop after parser + build/smoke because visual/link regressions are likely |
| Data fixture or JSON/YAML | Parse the changed data file | Run schema validation if present | Run the consumer test/build if the data is bundled | Stop after parse only for unconsumed archival data |
| Dependency/package change | Run install/lockfile consistency command | Run tests that import the dependency | Run full build/test | Avoid dependency changes in a short cron unless clearly required |

## Minimal bundle for Markdown/reference-only changes

For an isolated Markdown note, skill reference, or notebook entry, use this small bundle instead of a broad build:

1. **Readback:** reread the changed lines and confirm the section has the required heading, decision, verification, and next-action content.
2. **Whitespace diff:** run `git -C <repo> diff --check -- <repo-relative-path>` for every touched path in the work repo, and `git -C summaries diff --check -- hermes/YYYY-MM-DD.md` for the notebook.
3. **Relative-path audit:** search the changed Markdown for local absolute path markers and replace them with workspace-relative paths before staging.
4. **Discoverability check:** when adding a reference page, confirm `SKILL.md`, a README, sidebar, or index links to it; if no link is appropriate, record why the file is intentionally standalone.
5. **Staged-diff check:** after `git add <explicit-paths>`, inspect `git -C <repo> diff --cached -- <paths>` so unrelated dirty files are not included.

Use workspace-relative paths in notebook prose, but remember that `git -C <repo>` commands usually need paths relative to that repo root. For example, the workspace path `skills/skills/cron/hourly-progress/SKILL.md` becomes `skills/cron/hourly-progress/SKILL.md` when the command runs with `git -C skills`.

## Focused fallback checks

Use a focused fallback when the ideal broad check is unsafe, too slow for the cadence, or polluted by unrelated dirty state. A fallback is acceptable only when it still tests the most likely failure introduced by this run.

A good fallback has four parts:

1. **Named skipped check:** state the broader check that would normally be useful, such as `npm run build`, `docs:build`, or the full test suite.
2. **Reason for skipping:** name the concrete blocker: unrelated dirty files, known pre-existing failure, missing dependency cache, or cadence budget.
3. **Substitute check:** run the narrowest command or readback that can catch this slice's likely regression.
4. **Claim boundary:** write what the fallback proves and what it does not prove.

| Situation | Broad check skipped | Focused fallback | Safe claim |
| --- | --- | --- | --- |
| Dirty docs repo, isolated Markdown edit | `docs:build` | Readback changed section + `git diff --check -- <path>` + link/index inspection | The edited page is structurally sane; site-wide navigation was not proven |
| Skill reference addition | Full skill tooling or repo tests | Readback `SKILL.md` link + text audit for required headings + path audit | The reference is discoverable and formatted; runtime skill loading was not proven |
| Product code in dirty repo but exact component touched | Full formatter or generator | Typecheck/build if cheap; otherwise focused test for touched component + `git diff --check -- <paths>` | The touched behavior passed the focused check; unrelated dirty files were not validated |
| Known pre-existing broad test failure | Full suite | Run the nearest passing test or parser for changed files; record the known failure separately | This run did not add the checked regression; the suite remains not green |

Notebook wording pattern:

```markdown
- 验证方式：未运行 `<broad check>`，因为 `<reason>`；本轮改用 `<focused fallback>`，验证 `<safe claim>`，不声称 `<unverified claim>`。
```

## Dirty-worktree adjustment

When the target repo has unrelated existing changes:

- Prefer checks that operate on explicit paths: `git -C <repo> diff --check -- <path>` or a focused test command.
- Avoid broad formatters or generators that could rewrite unrelated files.
- If a broad build is necessary but may observe unrelated dirty files, record that limitation in the notebook instead of overstating confidence.
- Stage explicit paths only after the verification scope is clear.

## Notebook wording examples

Use precise evidence, not vague confidence:

- `验证方式：readback 新增 reference；python3 路径/metadata audit 通过；git diff --check 无 whitespace error。`
- `验证方式：npm run test:run -- src/pages/Foo.test.tsx 通过；npm run test:run 通过；npm run lint -- --quiet 通过。`
- `验证方式：仅做 readback 与链接检查；未运行 docs build，因为本轮只改孤立草稿且仓库已有大量无关改动。`

## Command snippets

```bash
# Markdown/skill path audit for local absolute paths.
python3 - <<'PY'
from pathlib import Path
paths = [Path('skills/skills/cron/hourly-progress/SKILL.md')]
for path in paths:
    text = path.read_text()
    # Fill this list with host-specific absolute path markers before running.
    forbidden = ['<absolute-home-marker-1>', '<absolute-home-marker-2>']
    hits = [item for item in forbidden if item in text]
    if hits:
        raise SystemExit(f'{path}: contains absolute path marker {hits}')
print('path audit passed')
PY

# Whitespace check for exact staged or touched paths.
git diff --check -- <path>

# Inspect exactly what will be committed.
git diff --cached -- <path>
```
