# Filled Example

Use this example when a previous agent completed a small documentation change while other repos or paths were already dirty.

```markdown
## Handoff Receipt

- Handoff title: AI catalog proof page added without absorbing unrelated dirty paths
- Repo / area: `docs/` / `documents/trending/ai/`
- Owned changes:
  - `documents/trending/ai/agent-cron-dirty-worktree-boundary.md`
  - `documents/trending/ai/README.md`
  - `documents/trending/ai/local-verifiable-proof-artifact.md`
  - `documents/trending/ai/ai-doc-change-proof-adoption-log.md`
- Avoided dirty paths:
  - `docs/AGENTS.md` — existing dirty path, not part of this task
  - `skills/` — existing unrelated repo changes, not inspected beyond status
  - `loom/` — large unrelated dirty tree, not owned by this handoff
- Verified facts:
  - Markdown links/frontmatter checked for the four owned docs files
  - AI catalog proof confirmed the new sibling page is listed in `README.md`
  - Whitespace diff check passed for the owned files
- Commands run:
  - `python3 scripts/check-markdown-proof.py documents/trending/ai/README.md documents/trending/ai/local-verifiable-proof-artifact.md documents/trending/ai/agent-cron-dirty-worktree-boundary.md documents/trending/ai/ai-doc-change-proof-adoption-log.md` -> `markdown proof ok: checked 4 file(s)`
  - `python3 scripts/check-ai-catalog.py` -> `AI catalog proof ok: README catalog covers all sibling AI markdown pages`
  - `git diff --check -- documents/trending/ai/README.md documents/trending/ai/local-verifiable-proof-artifact.md documents/trending/ai/agent-cron-dirty-worktree-boundary.md documents/trending/ai/ai-doc-change-proof-adoption-log.md` -> passed
- Open risks:
  - No claim about `docs/AGENTS.md`, `skills/`, or `loom/` correctness
  - No full VuePress build was run; verification was scoped to markdown proof and catalog proof
- Next safe command: `python3 scripts/check-ai-catalog.py`
- Decision: Continue
```

## Why This Is a Good Receipt

- It says exactly which files were owned.
- It names dirty paths that were deliberately avoided.
- It avoids claiming that unrelated repos are clean.
- It gives the receiver a single scoped command to rerun.
- It separates local proof from a heavier full-site build.
